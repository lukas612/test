/*
 * Envío de emails con Resend (la misma cuenta que Vigila).
 * Necesita un dominio propio del cachorro verificado en Resend para EMAIL_FROM:
 * no enviamos desde vigilamultas.com.
 *
 * enviarUnaVez() registra cada envío en la tabla "emails" para no repetirlo nunca.
 */
'use strict';
const datos = require('./datos');

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Plan Cachorro <hola@example.com>';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || '';

async function enviar(para, asunto, html) {
  if (!RESEND_API_KEY) { console.warn(`[email] RESEND_API_KEY vacía: no se envía "${asunto}" a ${para}`); return false; }
  const cuerpo = { from: EMAIL_FROM, to: [para], subject: asunto, html };
  if (EMAIL_REPLY_TO) cuerpo.reply_to = EMAIL_REPLY_TO;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
  if (!r.ok) { console.error('[email] Resend rechazó', para, r.status, (await r.text()).slice(0, 300)); return false; }
  return true;
}

// Envía solo si (email, clave) no se envió antes. Devuelve true si se envió ahora.
async function enviarUnaVez(para, clave, asunto, html) {
  const ya = await datos.primero('emails', { email: para, clave });
  if (ya) return false;
  const ok = await enviar(para, asunto, html);
  if (ok) await datos.insertar('emails', { email: para, clave }, { ignorarDuplicado: true });
  return ok;
}

module.exports = { enviar, enviarUnaVez, configurado: () => !!RESEND_API_KEY };
