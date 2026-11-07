/*
 * Servidor: landing + test + paywall + upsell + página privada del plan + panel.
 * Sin dependencias: Node >= 18. Stripe y Resend por su API REST; datos en Supabase o en data/.
 *
 *   cp .env.example .env   # rellena las claves
 *   node server.js
 *
 * Sin STRIPE_SECRET_KEY arranca en MODO DEMO: el pago se simula para probar el funnel.
 */
'use strict';
const { CFG, precioPara, firmaBaja } = require('./lib/config');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const datos = require('./lib/datos');
const correo = require('./lib/email');
const plantillasEmail = require('./lib/emails');

const MODO_DEMO = !CFG.stripeKey;
const PUBLIC = path.join(__dirname, 'public');

// ---------- Stripe (REST) ----------
function codificar(obj, prefijo, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const clave = prefijo ? `${prefijo}[${k}]` : k;
    if (typeof v === 'object') codificar(v, clave, out);
    else out.push(encodeURIComponent(clave) + '=' + encodeURIComponent(v));
  }
  return out.join('&');
}
async function stripe(metodo, ruta, params, idempotencia) {
  const headers = { Authorization: 'Bearer ' + CFG.stripeKey, 'Content-Type': 'application/x-www-form-urlencoded' };
  if (idempotencia) headers['Idempotency-Key'] = idempotencia;
  let url = 'https://api.stripe.com/v1' + ruta;
  const opts = { method: metodo, headers };
  if (params && metodo === 'GET') url += '?' + codificar(params);
  else if (params) opts.body = codificar(params);
  const r = await fetch(url, opts);
  const json = await r.json();
  if (!r.ok) { const e = new Error(json.error?.message || 'Stripe error'); e.stripe = json.error; throw e; }
  return json;
}
function verificarFirmaStripe(raw, cabecera) {
  if (!CFG.stripeWebhookSecret || !cabecera) return false;
  const t = (cabecera.split(',').find((p) => p.startsWith('t=')) || '').slice(2);
  const firmas = cabecera.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const esperada = crypto.createHmac('sha256', CFG.stripeWebhookSecret).update(`${t}.${raw}`).digest('hex');
  return firmas.some((f) => f.length === esperada.length && crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperada)));
}

// ---------- Utilidades HTTP ----------
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };
function enviar(res, codigo, cuerpo, tipo = 'application/json', extra = {}) {
  res.writeHead(codigo, { 'Content-Type': tipo, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(typeof cuerpo === 'string' || Buffer.isBuffer(cuerpo) ? cuerpo : JSON.stringify(cuerpo));
}
const html = (res, codigo, cuerpo) => enviar(res, codigo, cuerpo, TIPOS['.html']);
function leerCuerpo(req, limite = 100_000) {
  return new Promise((ok, ko) => {
    let d = '';
    req.on('data', (c) => { d += c; if (d.length > limite) { ko(new Error('demasiado grande')); req.destroy(); } });
    req.on('end', () => ok(d));
    req.on('error', ko);
  });
}
async function json(req) { try { return JSON.parse((await leerCuerpo(req)) || '{}'); } catch { return {}; } }
function servirArchivo(res, archivo) {
  fs.readFile(archivo, (err, buf) => {
    if (err) return enviar(res, 404, 'No encontrado', 'text/plain; charset=utf-8');
    enviar(res, 200, buf, TIPOS[path.extname(archivo)] || 'application/octet-stream', { 'Cache-Control': 'public, max-age=300' });
  });
}
const limpio = (s, n = 200) => String(s ?? '').slice(0, n);
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || ''));
const objeto = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
const pagina = (titulo, cuerpo) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${titulo}</title><link rel="stylesheet" href="/styles.css"></head><body><main class="pila" style="padding-top:40px">${cuerpo}</main></body></html>`;

// ---------- Rutas ----------
const rutas = {
  'GET /api/config': async (req, res, url) => {
    enviar(res, 200, { marca: CFG.marca, pixelId: CFG.pixelId, precio: precioPara(url.searchParams.get('sid')), precioUpsell: CFG.precioUpsell, demo: MODO_DEMO, emailContacto: CFG.emailContacto });
  },

  'POST /api/evento': async (req, res) => {
    const b = await json(req);
    const permitidos = ['visita', 'inicio_form', 'paso', 'form_completo', 'resultado_visto', 'paywall_visto', 'checkout_inicio', 'checkout_cancelado', 'upsell_visto', 'upsell_rechazado', 'clic_seguros'];
    if (!permitidos.includes(b.tipo)) return enviar(res, 400, { error: 'tipo' });
    await datos.insertar('eventos', { tipo: b.tipo, sid: limpio(b.sid, 64), paso: limpio(b.paso, 40), utm: objeto(b.utm) });
    enviar(res, 200, { ok: true });
  },

  'POST /api/lead': async (req, res) => {
    const b = await json(req);
    if (!emailValido(b.email)) return enviar(res, 400, { error: 'email' });
    if (!b.consentimientos?.privacidad) return enviar(res, 400, { error: 'privacidad' });
    const r = objeto(b.respuestas);
    const lista = (x, n) => (Array.isArray(x) ? x.slice(0, 10).map((v) => limpio(v, n)) : []);
    const lead = {
      sid: limpio(b.sid, 64),
      email: limpio(b.email, 200).toLowerCase(),
      respuestas: {
        nombre: limpio(r.nombre, 40), raza: limpio(r.raza, 60), razaId: limpio(r.razaId, 20), tamano: limpio(r.tamano, 10), edadSemanas: Number(r.edadSemanas) || 0,
        vivienda: limpio(r.vivienda, 10), horasSolo: Number(r.horasSolo) || 0, problema: limpio(r.problema, 12),
        convivientes: lista(r.convivientes, 20), primerPerro: limpio(r.primerPerro, 3), comunidad: limpio(r.comunidad, 40), tiene: lista(r.tiene, 20)
      },
      consentimientos: { privacidad: true, comerciales: !!b.consentimientos.comerciales, seguros: !!b.consentimientos.seguros, version: '2026-11-07' },
      precio: precioPara(b.sid),
      utm: objeto(b.utm)
    };
    await datos.insertar('leads', lead);
    await datos.insertar('eventos', { tipo: 'form_completo', sid: lead.sid, utm: lead.utm });
    enviar(res, 200, { ok: true });
    // Email inmediato con su rutina, solo con consentimiento comercial. Sin bloquear la respuesta.
    if (lead.consentimientos.comerciales) {
      const m = plantillasEmail.nurture(0, lead);
      correo.enviarUnaVez(lead.email, m.clave, m.asunto, m.html).catch((e) => console.error('nurture_0', e.message));
    }
  },

  'POST /api/checkout': async (req, res) => {
    const b = await json(req);
    if (!b.desistimiento) return enviar(res, 400, { error: 'Debes aceptar el inicio inmediato del contenido digital.' });
    const sid = limpio(b.sid, 64);
    const lead = await datos.primero('leads', { sid });
    if (!lead) return enviar(res, 400, { error: 'Completa primero el formulario.' });
    const precio = precioPara(sid);
    await datos.insertar('eventos', { tipo: 'checkout_inicio', sid, utm: lead.utm });
    if (MODO_DEMO) return enviar(res, 200, { url: `${CFG.baseUrl}/?pago=ok&session_id=demo_${sid}` });
    try {
      const s = await stripe('POST', '/checkout/sessions', {
        mode: 'payment', customer_creation: 'always', customer_email: lead.email, locale: 'es',
        line_items: { 0: { quantity: 1, price_data: { currency: 'eur', unit_amount: precio, product_data: { name: `Plan de 8 semanas para ${lead.respuestas.nombre || 'tu cachorro'}`, description: 'Plan personalizado, emails diarios y garantía de 14 días.' } } } },
        payment_intent_data: { setup_future_usage: 'off_session', metadata: { sid, tipo: 'plan', app: 'cachorro' } },
        metadata: { sid, precio, app: 'cachorro', desistimiento: 'aceptado_' + new Date().toISOString() },
        success_url: `${CFG.baseUrl}/?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CFG.baseUrl}/?pago=cancelado`
      });
      enviar(res, 200, { url: s.url });
    } catch (e) {
      console.error('checkout', e.message);
      enviar(res, 502, { error: 'No hemos podido iniciar el pago. Inténtalo de nuevo.' });
    }
  },

  'GET /api/pedido': async (req, res, url) => {
    const id = limpio(url.searchParams.get('session_id'), 200);
    if (MODO_DEMO && id.startsWith('demo_')) {
      const sid = id.slice(5);
      const lead = await datos.primero('leads', { sid });
      await datos.insertar('pedidos', { session_id: id, sid, email: lead?.email, importe: precioPara(sid), tipo: 'plan', demo: true, utm: lead?.utm || {} }, { ignorarDuplicado: true });
      const up = await datos.primero('pedidos', { session_id: id, tipo: 'upsell' });
      return enviar(res, 200, { pagado: true, importe: precioPara(sid), upsell: !up });
    }
    if (!id.startsWith('cs_')) return enviar(res, 400, { error: 'id' });
    try {
      const s = await stripe('GET', '/checkout/sessions/' + encodeURIComponent(id));
      const pagado = s.payment_status === 'paid';
      if (pagado) await registrarPedido(s);
      const up = await datos.primero('pedidos', { session_id: id, tipo: 'upsell' });
      enviar(res, 200, { pagado, importe: s.amount_total, upsell: pagado && !up });
    } catch (e) {
      enviar(res, 502, { error: 'No hemos podido comprobar el pago.' });
    }
  },

  'POST /api/upsell': async (req, res) => {
    const b = await json(req);
    const id = limpio(b.session_id, 200);
    if (await datos.primero('pedidos', { session_id: id, tipo: 'upsell' })) return enviar(res, 200, { ok: true });
    if (MODO_DEMO && id.startsWith('demo_')) {
      await datos.insertar('pedidos', { session_id: id, sid: id.slice(5), importe: CFG.precioUpsell, tipo: 'upsell', pack: limpio(b.pack, 30), demo: true }, { ignorarDuplicado: true });
      return enviar(res, 200, { ok: true });
    }
    try {
      const s = await stripe('GET', '/checkout/sessions/' + encodeURIComponent(id), { expand: { 0: 'payment_intent' } });
      if (s.payment_status !== 'paid') return enviar(res, 400, { error: 'pedido' });
      const pi = await stripe('POST', '/payment_intents', {
        amount: CFG.precioUpsell, currency: 'eur', customer: s.customer, payment_method: s.payment_intent.payment_method,
        off_session: 'true', confirm: 'true', description: 'Pack problema', metadata: { sid: s.metadata.sid, tipo: 'upsell', app: 'cachorro', pack: limpio(b.pack, 30), session_id: id }
      }, 'upsell_' + id);
      if (pi.status === 'succeeded') {
        await datos.insertar('pedidos', { session_id: id, sid: s.metadata.sid, email: s.customer_details?.email, importe: CFG.precioUpsell, tipo: 'upsell', pack: limpio(b.pack, 30), payment_intent: pi.id }, { ignorarDuplicado: true });
        return enviar(res, 200, { ok: true });
      }
      enviar(res, 402, { error: 'El banco pide confirmar el pago. Te lo enviamos por email.' });
    } catch (e) {
      console.error('upsell', e.message);
      enviar(res, 402, { error: 'No hemos podido cobrar el pack. Tu plan no se ve afectado.' });
    }
  },

  'POST /api/webhook': async (req, res) => {
    const raw = await leerCuerpo(req, 1_000_000);
    if (!verificarFirmaStripe(raw, req.headers['stripe-signature'])) return enviar(res, 400, { error: 'firma' });
    const ev = JSON.parse(raw);
    const obj = ev.data?.object || {};
    // La cuenta de Stripe puede ser compartida: solo procesamos lo que es del cachorro.
    if (ev.type === 'checkout.session.completed' && obj.metadata?.app === 'cachorro' && obj.payment_status === 'paid') await registrarPedido(obj);
    if (ev.type === 'charge.refunded' && obj.metadata?.app === 'cachorro') {
      await datos.insertar('reembolsos', { charge: obj.id, payment_intent: obj.payment_intent, importe: obj.amount_refunded, sid: obj.metadata?.sid, tipo: obj.metadata?.tipo }, { ignorarDuplicado: true });
    }
    enviar(res, 200, { recibido: true });
  },

  // Encuesta de 1 clic desde los emails de los días 7 y 21.
  'GET /api/encuesta': async (req, res, url) => {
    const nota = Number(url.searchParams.get('n')), dia = Number(url.searchParams.get('d'));
    const email = limpio(url.searchParams.get('e'), 200).toLowerCase();
    if (nota >= 1 && nota <= 10 && [7, 21].includes(dia) && emailValido(email)) {
      const lead = await datos.primero('leads', { email });
      await datos.insertar('eventos', { tipo: 'encuesta', sid: lead?.sid || '', paso: `d${dia}:${nota}`, utm: {} });
    }
    html(res, 200, pagina('Gracias', '<h1>¡Gracias!</h1><p class="suave">Tu respuesta nos ayuda a mejorar el plan. Si quieres contarnos algo más, responde al email.</p>'));
  },

  'GET /baja': async (req, res, url) => {
    const email = limpio(url.searchParams.get('e'), 200).toLowerCase();
    const t = limpio(url.searchParams.get('t'), 64);
    if (!emailValido(email) || t !== firmaBaja(email)) return html(res, 400, pagina('Enlace no válido', '<h1>Enlace no válido</h1><p>Escríbenos y te damos de baja a mano.</p>'));
    await datos.insertar('emails', { email, clave: 'baja' }, { ignorarDuplicado: true });
    html(res, 200, pagina('Baja confirmada', `<h1>Te hemos dado de baja</h1><p class="suave">No recibirás más emails de ${CFG.marca}. Si compraste el plan, sigues teniendo acceso a tu página privada.</p>`));
  },

  'GET /api/admin/metricas': async (req, res, url) => {
    if (!CFG.adminToken || url.searchParams.get('token') !== CFG.adminToken) return enviar(res, 403, { error: 'token' });
    const { calcular } = require('./scripts/metricas.js');
    enviar(res, 200, await calcular({ gasto: url.searchParams.get('gasto') ? Number(url.searchParams.get('gasto')) : null }));
  }
};

async function registrarPedido(s) {
  if (await datos.primero('pedidos', { session_id: s.id, tipo: 'plan' })) return;
  const lead = await datos.primero('leads', { sid: s.metadata?.sid });
  await datos.insertar('pedidos', {
    session_id: s.id, sid: s.metadata?.sid, email: s.customer_details?.email || lead?.email, importe: s.amount_total, tipo: 'plan',
    payment_intent: typeof s.payment_intent === 'object' ? s.payment_intent?.id : s.payment_intent, desistimiento: s.metadata?.desistimiento, utm: lead?.utm || {}
  }, { ignorarDuplicado: true });
}

// ---------- Servidor ----------
const ESTATICOS_CONTENT = ['/plantillas.js', '/tareas-diarias.js', '/plan-html.js'];
const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, CFG.baseUrl);
  try {
    const ruta = rutas[`${req.method} ${url.pathname}`];
    if (ruta) return await ruta(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return enviar(res, 405, { error: 'método' });
    if (url.pathname === '/salud') return enviar(res, 200, { ok: true, supabase: datos.USA_SUPABASE, stripe: !MODO_DEMO, email: correo.configurado() });

    // Página privada del plan: /plan/<token de 32 hex>
    const m = url.pathname.match(/^\/plan\/([a-f0-9]{32})$/);
    if (m) {
      const plan = await datos.primero('planes', { token: m[1] });
      if (!plan) return html(res, 404, pagina('Plan no encontrado', '<h1>No encontramos este plan</h1><p>Revisa el enlace del email o escríbenos.</p>'));
      return enviar(res, 200, plan.html, TIPOS['.html'], { 'X-Robots-Tag': 'noindex' });
    }
    if (ESTATICOS_CONTENT.includes(url.pathname)) return servirArchivo(res, path.join(__dirname, 'content', url.pathname.slice(1)));
    if (url.pathname === '/privacidad' || url.pathname === '/condiciones') {
      const h = fs.readFileSync(path.join(PUBLIC, url.pathname.slice(1) + '.html'), 'utf8')
        .replaceAll('{{MARCA}}', CFG.marca).replaceAll('{{EMAIL}}', CFG.emailContacto).replaceAll('{{TITULAR}}', CFG.titular);
      return html(res, 200, h);
    }
    const archivo = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!archivo.startsWith(PUBLIC + path.sep)) return enviar(res, 403, 'Prohibido', 'text/plain');
    servirArchivo(res, archivo);
  } catch (e) {
    console.error(req.method, url.pathname, e);
    if (!res.headersSent) enviar(res, 500, { error: 'interno' });
  }
});

if (require.main === module) {
  servidor.listen(CFG.puerto, () => {
    console.log(`${CFG.marca} en ${CFG.baseUrl} (puerto ${CFG.puerto})`);
    console.log('Datos:', datos.USA_SUPABASE ? 'Supabase' : 'archivos en data/ (desarrollo)');
    console.log(MODO_DEMO ? 'MODO DEMO: sin Stripe, los pagos se simulan.' : 'Stripe activo.');
    console.log('Emails:', correo.configurado() ? 'Resend' : 'desactivados (sin RESEND_API_KEY)');
    console.log('Precios en test:', CFG.precios.map((p) => (p / 100).toFixed(2) + ' €').join(' / '));
  });
}
module.exports = { servidor };
