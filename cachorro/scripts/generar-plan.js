#!/usr/bin/env node
/*
 * Genera el BORRADOR del plan de un comprador a partir de sus respuestas y las plantillas revisadas.
 * Fase 2 (entrega manual): este borrador se revisa a mano (y se puede pulir con Claude) antes de enviarlo.
 *
 *   node scripts/generar-plan.js <email o sid>
 *
 * Crea data/planes/<token>.html (página privada en /plan/<token>) e imprime:
 *  - la URL privada para enviar al cliente,
 *  - un prompt de revisión para pegar en Claude junto al HTML.
 * Para el PDF: abre la página privada y usa "Imprimir → Guardar como PDF".
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'data');
const clave = process.argv[2];
if (!clave) { console.error('Uso: node scripts/generar-plan.js <email o sid>'); process.exit(1); }

const leads = leerJsonl('leads.jsonl');
const lead = leads.reverse().find((l) => l.email === clave.toLowerCase() || l.sid === clave);
if (!lead) { console.error('No encuentro ese lead.'); process.exit(1); }

const marca = process.env.MARCA || 'Plan Cachorro';
const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const r = lead.respuestas;
const token = crypto.randomBytes(16).toString('hex');
const html = require('../content/plan-html.js').render({ respuestas: r, marca, id: token, inicio: new Date().toISOString() });

fs.mkdirSync(path.join(DATA, 'planes'), { recursive: true });
fs.writeFileSync(path.join(DATA, 'planes', token + '.html'), html);
fs.appendFileSync(path.join(DATA, 'entregas.jsonl'), JSON.stringify({ ts: new Date().toISOString(), sid: lead.sid, email: lead.email, token, estado: 'borrador' }) + '\n');

console.log(`\nBorrador creado: data/planes/${token}.html`);
console.log(`URL privada:     ${baseUrl}/plan/${token}\n`);
console.log('--- Prompt de revisión para Claude (pega también el HTML) ---\n');
console.log(`Revisa este plan de cachorro antes de enviarlo a un cliente. Perfil: ${JSON.stringify(r)}.
Reglas: no inventes contenido nuevo; solo señala (1) contradicciones entre secciones o con el perfil, (2) cualquier frase que parezca consejo veterinario, de alimentación o una afirmación legal no prudente, (3) horarios imposibles para las horas que pasa solo, (4) cualquier método aversivo. Devuelve una lista de cambios concretos con el texto actual y el propuesto, o "OK" si no hay nada.`);

function leerJsonl(f) {
  const ruta = path.join(DATA, f);
  if (!fs.existsSync(ruta)) return [];
  return fs.readFileSync(ruta, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
