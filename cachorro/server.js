/*
 * Servidor de la fase 1: landing + formulario + paywall + upsell + entrega de planes.
 * Sin dependencias: Node >= 18. Stripe se usa por su API REST.
 *
 *   cp .env.example .env   # rellena las claves
 *   node server.js
 *
 * Sin STRIPE_SECRET_KEY arranca en MODO DEMO: el pago se simula para probar el funnel.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------- Configuración ----------
cargarEnv(path.join(__dirname, '.env'));
const CFG = {
  puerto: Number(process.env.PORT || 3000),
  baseUrl: (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  marca: process.env.MARCA || 'Plan Cachorro',
  emailContacto: process.env.EMAIL_CONTACTO || 'hola@example.com',
  titular: process.env.TITULAR || '[RAZÓN SOCIAL, NIF y dirección]',
  stripeKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  pixelId: process.env.META_PIXEL_ID || '',
  // Céntimos. Un valor = precio fijo (fase 1a). Varios = test de precio (fase 1b), reparto estable por visitante.
  precios: (process.env.PRECIOS || '1999').split(',').map((x) => Number(x.trim())).filter(Boolean),
  precioUpsell: Number(process.env.PRECIO_UPSELL || 999),
  adminToken: process.env.ADMIN_TOKEN || ''
};
const MODO_DEMO = !CFG.stripeKey;
const DATA = path.join(__dirname, 'data');
const PUBLIC = path.join(__dirname, 'public');
fs.mkdirSync(path.join(DATA, 'planes'), { recursive: true });

function cargarEnv(f) {
  if (!fs.existsSync(f)) return;
  for (const linea of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// ---------- Almacenamiento (JSONL; suficiente para la validación) ----------
function guardar(archivo, obj) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.appendFileSync(path.join(DATA, archivo), JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
}
function leer(archivo) {
  const f = path.join(DATA, archivo);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

// Precio estable por visitante (sid) para que no cambie al recargar.
function precioPara(sid) {
  const h = crypto.createHash('sha256').update(String(sid || '')).digest();
  return CFG.precios[h[0] % CFG.precios.length];
}

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
  const partes = Object.fromEntries(cabecera.split(',').map((p) => p.split('=')));
  const t = partes.t;
  const firmas = cabecera.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const esperada = crypto.createHmac('sha256', CFG.stripeWebhookSecret).update(`${t}.${raw}`).digest('hex');
  return firmas.some((f) => f.length === esperada.length && crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperada)));
}

// ---------- Utilidades HTTP ----------
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json' };
function enviar(res, codigo, cuerpo, tipo = 'application/json') {
  res.writeHead(codigo, { 'Content-Type': tipo, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(typeof cuerpo === 'string' || Buffer.isBuffer(cuerpo) ? cuerpo : JSON.stringify(cuerpo));
}
function leerCuerpo(req, limite = 100_000) {
  return new Promise((ok, ko) => {
    let datos = '';
    req.on('data', (c) => { datos += c; if (datos.length > limite) { ko(new Error('demasiado grande')); req.destroy(); } });
    req.on('end', () => ok(datos));
    req.on('error', ko);
  });
}
async function json(req) { try { return JSON.parse((await leerCuerpo(req)) || '{}'); } catch { return {}; } }
function servirArchivo(res, archivo) {
  fs.readFile(archivo, (err, buf) => {
    if (err) return enviar(res, 404, 'No encontrado', 'text/plain; charset=utf-8');
    enviar(res, 200, buf, TIPOS[path.extname(archivo)] || 'application/octet-stream');
  });
}
const limpio = (s, n = 200) => String(s ?? '').slice(0, n);
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || ''));

// ---------- Rutas ----------
const rutas = {
  'GET /api/config': (req, res, url) => {
    const sid = url.searchParams.get('sid');
    enviar(res, 200, { marca: CFG.marca, pixelId: CFG.pixelId, precio: precioPara(sid), precioUpsell: CFG.precioUpsell, demo: MODO_DEMO, emailContacto: CFG.emailContacto });
  },

  'POST /api/evento': async (req, res) => {
    const b = await json(req);
    const permitidos = ['visita', 'inicio_form', 'paso', 'form_completo', 'resultado_visto', 'paywall_visto', 'checkout_inicio', 'checkout_cancelado', 'upsell_visto', 'upsell_rechazado', 'clic_seguros'];
    if (!permitidos.includes(b.tipo)) return enviar(res, 400, { error: 'tipo' });
    guardar('eventos.jsonl', { tipo: b.tipo, sid: limpio(b.sid, 64), paso: limpio(b.paso, 40), utm: b.utm && typeof b.utm === 'object' ? b.utm : {} });
    enviar(res, 200, { ok: true });
  },

  'POST /api/lead': async (req, res) => {
    const b = await json(req);
    if (!emailValido(b.email)) return enviar(res, 400, { error: 'email' });
    if (!b.consentimientos?.privacidad) return enviar(res, 400, { error: 'privacidad' });
    const r = b.respuestas || {};
    guardar('leads.jsonl', {
      sid: limpio(b.sid, 64),
      email: limpio(b.email, 200).toLowerCase(),
      respuestas: {
        nombre: limpio(r.nombre, 40), raza: limpio(r.raza, 60), razaId: limpio(r.razaId, 20), tamano: limpio(r.tamano, 10), edadSemanas: Number(r.edadSemanas) || 0,
        vivienda: limpio(r.vivienda, 10), horasSolo: Number(r.horasSolo) || 0, problema: limpio(r.problema, 12),
        convivientes: Array.isArray(r.convivientes) ? r.convivientes.map((x) => limpio(x, 20)) : [],
        primerPerro: limpio(r.primerPerro, 3), comunidad: limpio(r.comunidad, 40),
        tiene: Array.isArray(r.tiene) ? r.tiene.map((x) => limpio(x, 20)) : []
      },
      consentimientos: { privacidad: true, comerciales: !!b.consentimientos.comerciales, seguros: !!b.consentimientos.seguros, version: '2026-11-07' },
      precio: precioPara(b.sid),
      utm: b.utm && typeof b.utm === 'object' ? b.utm : {}
    });
    guardar('eventos.jsonl', { tipo: 'form_completo', sid: limpio(b.sid, 64), utm: b.utm || {} });
    enviar(res, 200, { ok: true });
  },

  'POST /api/checkout': async (req, res) => {
    const b = await json(req);
    if (!b.desistimiento) return enviar(res, 400, { error: 'Debes aceptar el inicio inmediato del contenido digital.' });
    const sid = limpio(b.sid, 64);
    const lead = leer('leads.jsonl').reverse().find((l) => l.sid === sid);
    if (!lead) return enviar(res, 400, { error: 'Completa primero el formulario.' });
    const precio = precioPara(sid);
    guardar('eventos.jsonl', { tipo: 'checkout_inicio', sid, utm: lead.utm });

    if (MODO_DEMO) return enviar(res, 200, { url: `${CFG.baseUrl}/?pago=ok&session_id=demo_${sid}` });

    try {
      const s = await stripe('POST', '/checkout/sessions', {
        mode: 'payment',
        customer_creation: 'always',
        customer_email: lead.email,
        locale: 'es',
        line_items: { 0: { quantity: 1, price_data: { currency: 'eur', unit_amount: precio, product_data: { name: `Plan de 8 semanas para ${lead.respuestas.nombre || 'tu cachorro'}`, description: 'Plan personalizado, emails diarios y garantía de 14 días.' } } } },
        // Guarda el método de pago para el upsell de un clic.
        payment_intent_data: { setup_future_usage: 'off_session', metadata: { sid, tipo: 'plan' } },
        metadata: { sid, precio, desistimiento: 'aceptado_' + new Date().toISOString() },
        success_url: `${CFG.baseUrl}/?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CFG.baseUrl}/?pago=cancelado`
      });
      enviar(res, 200, { url: s.url });
    } catch (e) {
      console.error('checkout', e.message);
      enviar(res, 502, { error: 'No hemos podido iniciar el pago. Inténtalo de nuevo.' });
    }
  },

  // Confirma el pago al volver de Stripe (el webhook es la fuente de verdad; esto es para la pantalla).
  'GET /api/pedido': async (req, res, url) => {
    const id = limpio(url.searchParams.get('session_id'), 200);
    if (MODO_DEMO && id.startsWith('demo_')) {
      const sid = id.slice(5);
      if (!leer('pedidos.jsonl').some((p) => p.session_id === id)) {
        const lead = leer('leads.jsonl').reverse().find((l) => l.sid === sid);
        guardar('pedidos.jsonl', { session_id: id, sid, email: lead?.email, importe: precioPara(sid), tipo: 'plan', demo: true, utm: lead?.utm || {} });
      }
      return enviar(res, 200, { pagado: true, importe: precioPara(sid), upsell: !leer('pedidos.jsonl').some((p) => p.session_id === id && p.tipo === 'upsell') });
    }
    if (!id.startsWith('cs_')) return enviar(res, 400, { error: 'id' });
    try {
      const s = await stripe('GET', '/checkout/sessions/' + encodeURIComponent(id));
      const pagado = s.payment_status === 'paid';
      if (pagado) registrarPedido(s);
      const yaUpsell = leer('pedidos.jsonl').some((p) => p.session_id === id && p.tipo === 'upsell');
      enviar(res, 200, { pagado, importe: s.amount_total, upsell: pagado && !yaUpsell });
    } catch (e) {
      enviar(res, 502, { error: 'No hemos podido comprobar el pago.' });
    }
  },

  'POST /api/upsell': async (req, res) => {
    const b = await json(req);
    const id = limpio(b.session_id, 200);
    if (leer('pedidos.jsonl').some((p) => p.session_id === id && p.tipo === 'upsell')) return enviar(res, 200, { ok: true });

    if (MODO_DEMO && id.startsWith('demo_')) {
      guardar('pedidos.jsonl', { session_id: id, sid: id.slice(5), importe: CFG.precioUpsell, tipo: 'upsell', pack: limpio(b.pack, 30), demo: true });
      return enviar(res, 200, { ok: true });
    }
    try {
      const s = await stripe('GET', '/checkout/sessions/' + encodeURIComponent(id), { expand: { 0: 'payment_intent' } });
      if (s.payment_status !== 'paid') return enviar(res, 400, { error: 'pedido' });
      const pi = await stripe('POST', '/payment_intents', {
        amount: CFG.precioUpsell, currency: 'eur', customer: s.customer, payment_method: s.payment_intent.payment_method,
        off_session: 'true', confirm: 'true', description: 'Pack problema', metadata: { sid: s.metadata.sid, tipo: 'upsell', pack: limpio(b.pack, 30), session_id: id }
      }, 'upsell_' + id);
      if (pi.status === 'succeeded') {
        guardar('pedidos.jsonl', { session_id: id, sid: s.metadata.sid, email: s.customer_details?.email, importe: CFG.precioUpsell, tipo: 'upsell', pack: limpio(b.pack, 30), payment_intent: pi.id });
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
    if (ev.type === 'checkout.session.completed' && ev.data.object.payment_status === 'paid') registrarPedido(ev.data.object);
    if (ev.type === 'charge.refunded') {
      const c = ev.data.object;
      guardar('reembolsos.jsonl', { charge: c.id, payment_intent: c.payment_intent, importe: c.amount_refunded, sid: c.metadata?.sid, tipo: c.metadata?.tipo });
    }
    enviar(res, 200, { recibido: true });
  },

  'GET /api/admin/metricas': (req, res, url) => {
    if (!CFG.adminToken || url.searchParams.get('token') !== CFG.adminToken) return enviar(res, 403, { error: 'token' });
    const { calcular } = require('./scripts/metricas.js');
    enviar(res, 200, calcular(DATA, {}));
  }
};

function registrarPedido(s) {
  if (leer('pedidos.jsonl').some((p) => p.session_id === s.id && p.tipo === 'plan')) return;
  const lead = leer('leads.jsonl').reverse().find((l) => l.sid === s.metadata?.sid);
  guardar('pedidos.jsonl', { session_id: s.id, sid: s.metadata?.sid, email: s.customer_details?.email || lead?.email, importe: s.amount_total, tipo: 'plan', payment_intent: s.payment_intent?.id || s.payment_intent, desistimiento: s.metadata?.desistimiento, utm: lead?.utm || {} });
}

// ---------- Servidor ----------
const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, CFG.baseUrl);
  const ruta = rutas[`${req.method} ${url.pathname}`];
  try {
    if (ruta) return await ruta(req, res, url);
    if (req.method !== 'GET') return enviar(res, 405, { error: 'método' });

    // Página privada del plan: /plan/<token de 32 hex>
    const m = url.pathname.match(/^\/plan\/([a-f0-9]{32})$/);
    if (m) return servirArchivo(res, path.join(DATA, 'planes', m[1] + '.html'));

    if (['/plantillas.js', '/tareas-diarias.js', '/plan-html.js'].includes(url.pathname)) return servirArchivo(res, path.join(__dirname, 'content', url.pathname.slice(1)));
    if (url.pathname === '/privacidad' || url.pathname === '/condiciones') {
      const html = fs.readFileSync(path.join(PUBLIC, url.pathname.slice(1) + '.html'), 'utf8')
        .replaceAll('{{MARCA}}', CFG.marca).replaceAll('{{EMAIL}}', CFG.emailContacto).replaceAll('{{TITULAR}}', CFG.titular);
      return enviar(res, 200, html, TIPOS['.html']);
    }
    const archivo = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!archivo.startsWith(PUBLIC + path.sep)) return enviar(res, 403, 'Prohibido', 'text/plain');
    servirArchivo(res, archivo);
  } catch (e) {
    console.error(e);
    enviar(res, 500, { error: 'interno' });
  }
});

if (require.main === module) {
  servidor.listen(CFG.puerto, () => {
    console.log(`${CFG.marca} en ${CFG.baseUrl} (puerto ${CFG.puerto})`);
    console.log(MODO_DEMO ? 'MODO DEMO: sin Stripe, los pagos se simulan.' : 'Stripe activo.');
    console.log('Precios en test:', CFG.precios.map((p) => (p / 100).toFixed(2) + ' €').join(' / '));
  });
}
module.exports = { servidor, CFG };
