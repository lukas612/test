#!/usr/bin/env node
/*
 * Envía al cliente el email de entrega de un plan ya revisado y lo marca como enviado.
 * Desde ese momento empiezan sus 56 emails diarios (scripts/enviar-emails.js).
 *
 *   node scripts/enviar-plan.js <token>
 */
'use strict';
const { CFG } = require('../lib/config');
const datos = require('../lib/datos');
const correo = require('../lib/email');
const emails = require('../lib/emails');

(async () => {
  const token = process.argv[2];
  const plan = token && (await datos.primero('planes', { token }));
  if (!plan) { console.error('Uso: node scripts/enviar-plan.js <token> (token no encontrado)'); process.exit(1); }
  if (plan.estado === 'enviado') { console.log('Este plan ya se envió el', plan.enviado_at); return; }
  const lead = await datos.primero('leads', { sid: plan.sid });
  const pack = await datos.primero('pedidos', { sid: plan.sid, tipo: 'upsell' });
  const m = emails.entrega(plan.email, lead.respuestas, `${CFG.baseUrl}/plan/${token}`, !!pack);
  const ok = await correo.enviarUnaVez(plan.email, m.clave, m.asunto, m.html);
  if (!ok && correo.configurado()) { console.error('No se ha podido enviar (o ya se envió antes). Revisa Resend.'); process.exit(1); }
  await datos.actualizar('planes', { token }, { estado: 'enviado', enviado_at: new Date().toISOString() });
  console.log(`Plan enviado a ${plan.email}${correo.configurado() ? '' : ' (simulado: sin RESEND_API_KEY)'}.`);
  if (pack) console.log(`Ojo: compró el pack "${pack.pack}". Envíaselo aparte.`);
})().catch((e) => { console.error(e.message); process.exit(1); });
