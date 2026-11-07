#!/usr/bin/env node
/*
 * Exporta leads a CSV para la herramienta de email marketing.
 *
 *   node scripts/exportar-leads.js compradores > compradores.csv    # secuencia diaria de 8 semanas
 *   node scripts/exportar-leads.js no-compradores > nurture.csv     # 3 emails en 5 días
 *   node scripts/exportar-leads.js seguros > seguros.csv            # solo con consentimiento de seguros
 *
 * "no-compradores" incluye solo a quien dio consentimiento comercial: sin él solo se puede enviar el resultado del test.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data');
const leer = (f) => { const r = path.join(DATA, f); return fs.existsSync(r) ? fs.readFileSync(r, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []; };

const tipo = process.argv[2];
if (!['compradores', 'no-compradores', 'seguros'].includes(tipo)) { console.error('Uso: exportar-leads.js compradores|no-compradores|seguros'); process.exit(1); }

const compradores = new Set(leer('pedidos.jsonl').filter((p) => p.tipo === 'plan').map((p) => p.sid));
const reembolsados = new Set(leer('reembolsos.jsonl').map((r) => r.sid));
const porEmail = new Map();
for (const l of leer('leads.jsonl')) porEmail.set(l.email, l); // el último gana

const filas = [...porEmail.values()].filter((l) => {
  if (tipo === 'compradores') return compradores.has(l.sid) && !reembolsados.has(l.sid);
  if (tipo === 'no-compradores') return !compradores.has(l.sid) && l.consentimientos?.comerciales;
  return l.consentimientos?.seguros;
});

const cols = ['email', 'nombre_cachorro', 'raza', 'tamano', 'edad_semanas', 'vivienda', 'horas_solo', 'problema', 'comunidad', 'fecha'];
const csv = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
console.log(cols.join(','));
for (const l of filas) {
  const r = l.respuestas;
  console.log([l.email, r.nombre, r.raza, r.tamano, r.edadSemanas, r.vivienda, r.horasSolo, r.problema, r.comunidad, l.ts.slice(0, 10)].map(csv).join(','));
}
console.error(`${filas.length} filas (${tipo}).`);
