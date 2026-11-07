#!/usr/bin/env node
/*
 * Envíos programados. Se ejecuta una vez al día (GitHub Actions, como los de Vigila).
 *  - Quien no compra (con consentimiento comercial): emails de los días 2 y 5.
 *  - Compradores con el plan enviado: la tarea de cada día (1 a 56) y encuestas de los días 7 y 21.
 * Nunca envía dos veces el mismo email (tabla "emails") ni a quien se dio de baja.
 *
 *   node scripts/enviar-emails.js            # envía
 *   node scripts/enviar-emails.js --prueba   # solo muestra lo que enviaría
 */
'use strict';
const { CFG } = require('../lib/config');
const datos = require('../lib/datos');
const correo = require('../lib/email');
const emails = require('../lib/emails');

const PRUEBA = process.argv.includes('--prueba');
const DIA = 864e5;
const diasDesde = (fecha) => Math.floor((Date.now() - new Date(fecha).getTime()) / DIA);

(async () => {
  const [leads, pedidos, planes, enviados] = await Promise.all([datos.listar('leads'), datos.listar('pedidos'), datos.listar('planes', { estado: 'enviado' }), datos.listar('emails')]);
  const hecho = new Set(enviados.map((e) => e.email + '|' + e.clave));
  const bajas = new Set(enviados.filter((e) => e.clave === 'baja').map((e) => e.email));
  // Quien tiene un pedido o un plan es comprador: nunca recibe los emails de "quien no compra".
  const compradores = new Set([...pedidos.filter((p) => p.tipo === 'plan').map((p) => p.sid), ...planes.map((p) => p.sid)]);
  const reembolsados = new Set((await datos.listar('reembolsos')).filter((r) => r.tipo === 'plan').map((r) => r.sid));
  const cola = [];

  // Último lead por email
  const porEmail = new Map();
  for (const l of leads) porEmail.set(l.email, l);

  for (const lead of porEmail.values()) {
    if (bajas.has(lead.email) || compradores.has(lead.sid) || !lead.consentimientos?.comerciales) continue;
    const d = diasDesde(lead.ts);
    for (const n of [2, 5]) if (d >= n && d < n + 3) { const m = emails.nurture(n, lead); m.para = lead.email; cola.push(m); }
  }

  for (const plan of planes) {
    if (bajas.has(plan.email) || reembolsados.has(plan.sid)) continue;
    const lead = porEmail.get(plan.email) || (await datos.primero('leads', { sid: plan.sid }));
    if (!lead) continue;
    const dia = diasDesde(plan.enviado_at); // el día 1 es el día siguiente a la entrega
    const url = `${CFG.baseUrl}/plan/${plan.token}`;
    if (dia >= 1 && dia <= 56) { const m = emails.diario(plan.email, lead.respuestas, dia, url); if (m) { m.para = plan.email; cola.push(m); } }
    for (const e of [7, 21]) if (dia >= e && dia < e + 3) { const m = emails.encuesta(plan.email, lead.respuestas, e, url); m.para = plan.email; cola.push(m); }
  }

  let enviadosHoy = 0;
  for (const m of cola) {
    if (hecho.has(m.para + '|' + m.clave)) continue;
    if (PRUEBA) { console.log(`[prueba] ${m.para} · ${m.clave} · ${m.asunto}`); continue; }
    if (await correo.enviarUnaVez(m.para, m.clave, m.asunto, m.html)) enviadosHoy++;
  }
  console.log(PRUEBA ? `${cola.length} emails candidatos.` : `${enviadosHoy} emails enviados.`);
})().catch((e) => { console.error(e.message); process.exit(1); });
