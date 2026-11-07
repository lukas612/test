#!/usr/bin/env node
/*
 * Genera el BORRADOR del plan de un comprador (fase 2: revisión manual antes de enviar).
 *
 *   node scripts/generar-plan.js <email o sid>
 *
 * Guarda el plan (Supabase o data/) y lo deja visible en /plan/<token> para revisarlo.
 * Imprime la URL y un prompt de revisión para Claude. Cuando esté revisado:
 *   node scripts/enviar-plan.js <token>
 */
'use strict';
const { CFG } = require('../lib/config');
const crypto = require('crypto');
const datos = require('../lib/datos');
const { render } = require('../content/plan-html.js');

(async () => {
  const clave = process.argv[2];
  if (!clave) { console.error('Uso: node scripts/generar-plan.js <email o sid>'); process.exit(1); }
  const lead = (await datos.primero('leads', { email: clave.toLowerCase() })) || (await datos.primero('leads', { sid: clave }));
  if (!lead) { console.error('No encuentro ese lead.'); process.exit(1); }

  const token = crypto.randomBytes(16).toString('hex');
  const html = render({ respuestas: lead.respuestas, marca: CFG.marca, id: token, inicio: new Date().toISOString() });
  await datos.insertar('planes', { token, sid: lead.sid, email: lead.email, html, estado: 'borrador' });

  console.log(`\nBorrador guardado. Revísalo en: ${CFG.baseUrl}/plan/${token}`);
  console.log(`Cuando esté bien: node scripts/enviar-plan.js ${token}\n`);
  console.log('--- Prompt de revisión para Claude (pega también lo que ves en la página) ---\n');
  console.log(`Revisa este plan de cachorro antes de enviarlo a un cliente. Perfil: ${JSON.stringify(lead.respuestas)}.
Reglas: no inventes contenido nuevo; solo señala (1) contradicciones entre secciones o con el perfil, (2) cualquier frase que parezca consejo veterinario, de alimentación o una afirmación legal no prudente, (3) horarios imposibles para las horas que pasa solo, (4) cualquier método aversivo. Devuelve una lista de cambios concretos con el texto actual y el propuesto, o "OK" si no hay nada.`);
})().catch((e) => { console.error(e.message); process.exit(1); });
