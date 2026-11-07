/*
 * Contenido de los emails (HTML compatible con clientes de correo: tablas y estilos en línea).
 * Textos de content/emails.md. Las tareas diarias salen de content/tareas-diarias.js.
 */
'use strict';
const { CFG, urlBaja } = require('./config');
const P = require('../content/plantillas.js');
const T = require('../content/tareas-diarias.js');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PROBLEMA = { pis: 'el pis en casa', mordiscos: 'los mordiscos', noches: 'las noches', solo: 'quedarse solo' };

function marco(email, interior, preheader) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1b2a41">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px">
<tr><td style="padding:20px 24px;border-bottom:1px solid #dde3ec"><span style="display:inline-block;background:#ffc83d;border-radius:8px;padding:4px 8px;font-weight:bold">🐾</span> <b style="font-size:17px">${esc(CFG.marca)}</b></td></tr>
<tr><td style="padding:24px;font-size:16px;line-height:1.55">${interior}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #dde3ec;font-size:12px;color:#5c6b80;line-height:1.5">
Responde a este email si necesitas algo. ${esc(CFG.titular)}<br>
<a href="${urlBaja(email)}" style="color:#5c6b80">Darme de baja de estos emails</a>
</td></tr></table></td></tr></table></body></html>`;
}
const boton = (url, txt) => `<p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:#ffc83d;color:#1b2a41;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">${esc(txt)}</a></p>`;
const tablaRutina = (rut) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.45">${rut.bloques.map((b) =>
  `<tr><td style="padding:6px 10px 6px 0;vertical-align:top;font-weight:bold;white-space:nowrap;color:#2546a8">${esc(b[0])}</td><td style="padding:6px 0;border-bottom:1px solid #eef2f8">${esc(b[1])}</td></tr>`).join('')}</table>`;

function perfil(r) {
  return { nombre: r.nombre || 'tu cachorro', raza: r.raza, razaId: r.razaId, edadSemanas: Number(r.edadSemanas) || 10, tamano: r.tamano || 'mediano', vivienda: r.vivienda, horasSolo: Number(r.horasSolo) || 0, problema: r.problema, convivientes: r.convivientes || [] };
}

// ---------- Quien no compra (solo con consentimiento comercial) ----------
function nurture(dia, lead) {
  const r = lead.respuestas, n = r.nombre || 'tu cachorro', email = lead.email;
  const url = `${CFG.baseUrl}/?utm_source=email&utm_medium=nurture&utm_campaign=d${dia}`;
  if (dia === 0) {
    const rut = P.rutinaDiaria(perfil(r));
    return { clave: 'nurture_0', asunto: `La rutina de mañana para ${n}`, html: marco(email,
      `<h1 style="font-size:22px;margin:0 0 12px">La rutina de mañana para ${esc(n)}</h1>
       <p>Aquí la tienes para guardarla. Pruébala mañana tal cual y fíjate en cuántos pis hace en el sitio bueno.</p>
       ${tablaRutina(rut)}
       <p style="font-size:14px;color:#5c6b80">${esc(rut.nota)}</p>
       ${boton(url, `Ver el plan completo de ${n}`)}`, 'Pruébala mañana tal cual') };
  }
  if (dia === 2) {
    const prot = P.PROTOCOLOS[r.problema] || P.PROTOCOLOS.pis;
    const pasos = (r.problema === 'pis' ? (r.vivienda === 'jardin' ? prot.jardin : prot.piso) : prot.si).slice(0, 3);
    return { clave: 'nurture_2', asunto: `Lo que casi todo el mundo hace mal con ${PROBLEMA[r.problema] || 'su cachorro'}`, html: marco(email,
      `<p>Hola:</p><p>Nos dijiste que lo que más te preocupa es <b>${esc(PROBLEMA[r.problema] || 'su educación')}</b>. El error más común es reaccionar tarde: regañar cuando ya ha pasado. A un cachorro eso no le enseña nada, solo le asusta.</p>
       <p>Lo que sí funciona es adelantarse:</p><ol>${pasos.map((p) => `<li style="margin-bottom:8px">${esc(p)}</li>`).join('')}</ol>
       <p>Es una parte del plan de 8 semanas de ${esc(n)}.</p>${boton(url, `Ver el plan de ${n}`)}`, 'Y lo que funciona en su lugar') };
  }
  return { clave: 'nurture_5', asunto: `El plan de ${n} sigue aquí`, html: marco(email,
    `<p>Hola:</p><p>Las primeras 8 semanas en casa son las que más cuentan. Lo que ${esc(n)} aprende ahora (dónde hacer pis, qué se puede morder, cómo quedarse solo) se queda.</p>
     <p>Su plan incluye la rutina semana a semana, los 4 protocolos, la socialización y un email cada día con la tarea del día. Si no te sirve, te devolvemos el dinero en 14 días, sin preguntas.</p>
     ${boton(url, `Quiero el plan de ${n}`)}`, '8 semanas, un email al día, garantía de 14 días') };
}

// ---------- Compradores ----------
function entrega(email, r, urlPlan, conPack) {
  const n = r.nombre || 'tu cachorro';
  return { clave: 'entrega', asunto: `El plan de ${n} está listo`, html: marco(email,
    `<h1 style="font-size:22px;margin:0 0 12px">El plan de ${esc(n)} está listo</h1>
     <p>Empieza por la sección de <b>${esc(PROBLEMA[r.problema] || 'su prioridad')}</b>: es tu prioridad. Desde mañana te llegará cada día un email corto con la tarea del día.</p>
     ${boton(urlPlan, `Abrir el plan de ${n}`)}
     <p style="font-size:14px;color:#5c6b80">Guarda este email: el enlace es privado y es tu acceso al plan. Puedes marcar las tareas como hechas y ver tu progreso.</p>
     ${conPack ? '<p>El pack que añadiste te llegará en un email aparte.</p>' : ''}
     <p>Recuerda: tienes 14 días de garantía. Si no te sirve, responde a este email.</p>`, 'Empieza hoy por la semana 1') };
}

function diario(email, r, dia, urlPlan) {
  const t = T[dia - 1], n = r.nombre || 'tu cachorro';
  if (!t) return null;
  return { clave: 'diario_' + dia, asunto: `Día ${dia}: ${t.titulo}`, html: marco(email,
    `<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2546a8;font-weight:bold;margin:0">Día ${dia} de 56 · Semana ${Math.ceil(dia / 7)}</p>
     <h1 style="font-size:22px;margin:4px 0 12px">${esc(t.titulo)}</h1>
     <p>${esc(t.tarea.replace(/\{n\}/g, n))}</p>
     ${boton(urlPlan + '#hoy', 'Marcarla como hecha')}
     <p style="font-size:14px;color:#5c6b80">¿Te atascas? Responde a este email y te ayudamos.</p>`, `5 minutos hoy con ${n}`) };
}

function encuesta(email, r, dia, urlPlan) {
  const n = r.nombre || 'tu cachorro';
  const notas = Array.from({ length: 10 }, (_, k) => k + 1).map((k) =>
    `<a href="${CFG.baseUrl}/api/encuesta?e=${encodeURIComponent(email)}&d=${dia}&n=${k}" style="display:inline-block;width:34px;line-height:34px;margin:2px;text-align:center;border-radius:8px;background:${k >= 8 ? '#dcf3e8' : '#eef2f8'};color:#1b2a41;text-decoration:none;font-weight:bold">${k}</a>`).join('');
  return { clave: 'encuesta_' + dia, asunto: dia === 7 ? '¿Os está sirviendo el plan? (1 clic)' : `3 semanas con el plan: ¿cómo va ${n}?`, html: marco(email,
    `<p>Hola:</p><p>Del 1 al 10, ¿cuánto te está sirviendo el plan de ${esc(n)}?</p><p>${notas}</p>
     <p style="font-size:14px;color:#5c6b80">Un clic y listo. Si quieres contarnos algo más, responde a este email.</p>`, 'Un clic y nos ayudas mucho') };
}

module.exports = { nurture, entrega, diario, encuesta };
