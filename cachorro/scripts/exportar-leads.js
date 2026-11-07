#!/usr/bin/env node
/*
 * Exporta leads a CSV.
 *   node scripts/exportar-leads.js compradores > compradores.csv
 *   node scripts/exportar-leads.js no-compradores > nurture.csv   # solo con consentimiento comercial
 *   node scripts/exportar-leads.js seguros > seguros.csv          # solo con consentimiento de seguros
 */
'use strict';
require('../lib/config');
const datos = require('../lib/datos');

(async () => {
  const tipo = process.argv[2];
  if (!['compradores', 'no-compradores', 'seguros'].includes(tipo)) { console.error('Uso: exportar-leads.js compradores|no-compradores|seguros'); process.exit(1); }
  const [leads, pedidos, reembolsos, emails] = await Promise.all([datos.listar('leads'), datos.listar('pedidos'), datos.listar('reembolsos'), datos.listar('emails', { clave: 'baja' })]);
  const compradores = new Set(pedidos.filter((p) => p.tipo === 'plan' && !p.demo).map((p) => p.sid));
  const reembolsados = new Set(reembolsos.map((r) => r.sid));
  const bajas = new Set(emails.map((e) => e.email));
  const porEmail = new Map();
  for (const l of leads) porEmail.set(l.email, l);
  const filas = [...porEmail.values()].filter((l) => {
    if (bajas.has(l.email)) return false;
    if (tipo === 'compradores') return compradores.has(l.sid) && !reembolsados.has(l.sid);
    if (tipo === 'no-compradores') return !compradores.has(l.sid) && l.consentimientos?.comerciales;
    return l.consentimientos?.seguros;
  });
  const csv = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  console.log(['email', 'nombre_cachorro', 'raza', 'tamano', 'edad_semanas', 'vivienda', 'horas_solo', 'problema', 'comunidad', 'fecha'].join(','));
  for (const l of filas) { const r = l.respuestas; console.log([l.email, r.nombre, r.raza, r.tamano, r.edadSemanas, r.vivienda, r.horasSolo, r.problema, r.comunidad, String(l.ts).slice(0, 10)].map(csv).join(',')); }
  console.error(`${filas.length} filas (${tipo}).`);
})().catch((e) => { console.error(e.message); process.exit(1); });
