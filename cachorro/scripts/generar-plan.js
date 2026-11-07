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
const P = require('../content/plantillas.js');

const DATA = path.join(__dirname, '..', 'data');
const clave = process.argv[2];
if (!clave) { console.error('Uso: node scripts/generar-plan.js <email o sid>'); process.exit(1); }

const leads = leerJsonl('leads.jsonl');
const lead = leads.reverse().find((l) => l.email === clave.toLowerCase() || l.sid === clave);
if (!lead) { console.error('No encuentro ese lead.'); process.exit(1); }

const marca = process.env.MARCA || 'Plan Cachorro';
const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const r = lead.respuestas;
const perfil = { nombre: r.nombre || 'tu cachorro', edadSemanas: r.edadSemanas, tamano: r.tamano || 'mediano', vivienda: r.vivienda, horasSolo: r.horasSolo };
const n = perfil.nombre;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lista = (arr) => '<ul>' + arr.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';

// Rutinas por semana: la edad avanza con el plan.
let semanasHtml = '';
let tramoAnterior = null;
for (let s = 1; s <= 8; s++) {
  const edad = perfil.edadSemanas + s - 1;
  const rut = P.rutinaDiaria({ ...perfil, edadSemanas: edad });
  const soc = P.SOCIALIZACION[s - 1];
  const cambia = rut.tramo !== tramoAnterior;
  tramoAnterior = rut.tramo;
  semanasHtml += `<section class="semana"><h3>Semana ${s} · ${esc(n)} con ${edad} semanas</h3>` +
    (cambia
      ? `<p class="suave">${s === 1 ? 'Su rutina' : 'Nueva rutina: ha pasado al tramo de ' + esc(rut.tramo)}.</p><table>${rut.bloques.map((b) => `<tr><td>${esc(b[0])}</td><td>${esc(b[1])}</td></tr>`).join('')}</table><p class="suave">${esc(rut.nota)}</p>`
      : '<p class="suave">Misma rutina que la semana anterior.</p>') +
    `<h4>Socialización: ${esc(soc.foco)}</h4>${lista(soc.items)}</section>`;
}

const protPrincipal = P.PROTOCOLOS[r.problema] || P.PROTOCOLOS.pis;
const protocolos = ['pis', 'mordiscos', 'noches', 'solo']
  .sort((a, b) => (a === r.problema ? -1 : b === r.problema ? 1 : 0))
  .map((k) => {
    const p = P.PROTOCOLOS[k];
    const si = k === 'pis' ? (r.vivienda === 'jardin' ? p.jardin : p.piso) : p.si;
    return `<section><h3>${esc(p.titulo)}${k === r.problema ? ' · tu prioridad' : ''}</h3><h4>Qué hacer</h4><ol>${si.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><h4>Qué no hacer</h4>${lista(p.no)}</section>`;
  }).join('');

const tiene = r.tiene || [];
const legal = P.LEGAL.items.map((x) => `<li>${tiene.includes(x.id) ? '✓' : '○'} <b>${esc(x.texto)}</b><br><span class="suave">${esc(x.estado)}</span></li>`).join('');

const notasHogar = [];
if ((r.convivientes || []).includes('ninos')) notasHogar.push(`Con niños en casa: que ${n} tenga un sitio donde nadie le moleste cuando descansa, y juegos siempre supervisados.`);
if ((r.convivientes || []).includes('perros')) notasHogar.push(`Con otro perro: comidas separadas y momentos a solas con ${n} para que aprenda contigo, no solo del otro perro.`);
if ((r.convivientes || []).includes('gatos')) notasHogar.push(`Con gatos: que el gato tenga zonas altas y su comida fuera del alcance de ${n}. Presentaciones cortas y con premio.`);
if (r.horasSolo >= 6) notasHogar.push(`${n} pasa ${r.horasSolo} horas o más sin compañía: en estas semanas es muy recomendable que alguien pase a mitad de jornada.`);
if (r.primerPerro === 'si') notasHogar.push('Es tu primer perro: es normal sentirse agobiado las primeras semanas. Sigue la tarea de cada día y no intentes hacerlo todo a la vez.');

const token = crypto.randomBytes(16).toString('hex');
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Plan de ${esc(n)} · ${esc(marca)}</title>
<style>
body{font:16px/1.55 system-ui,sans-serif;color:#2b2420;background:#fbf7f2;margin:0}
main{max-width:720px;margin:0 auto;padding:24px 16px 60px}
h1{font-size:1.8rem;margin:.2em 0}h2{margin-top:2em;border-bottom:2px solid #e8dfd5;padding-bottom:.3em}h3{margin-top:1.6em}
.suave{color:#6f645c;font-size:.92rem}.aviso{background:#fff;border:1px solid #e8dfd5;border-radius:12px;padding:12px 14px}
table{border-collapse:collapse;width:100%;font-size:.93rem}td{border-bottom:1px solid #e8dfd5;padding:6px 8px;vertical-align:top}td:first-child{white-space:nowrap;font-weight:700;color:#b44f29;width:56px}
.semana{page-break-inside:avoid}ul.legal{list-style:none;padding:0}ul.legal li{margin-bottom:10px}
@media print{body{background:#fff}h2{page-break-before:always}h2:first-of-type{page-break-before:auto}}
</style></head><body><main>
<p class="suave">${esc(marca)} · Plan personalizado</p>
<h1>Plan de 8 semanas para ${esc(n)}</h1>
<p>${esc(r.raza || 'Cachorro')} · ${esc(P.TAMANOS[perfil.tamano].nombre)} (${esc(P.TAMANOS[perfil.tamano].rango)}) · ${r.edadSemanas} semanas · ${r.vivienda === 'jardin' ? 'casa con jardín' : 'piso'} · ${esc(r.comunidad)}</p>
<p class="aviso">Tu prioridad ahora: <b>${esc(protPrincipal.titulo.toLowerCase())}</b>. Empieza por esa sección y sigue el email de cada día.</p>
${notasHogar.length ? '<h2>Notas para tu casa</h2>' + lista(notasHogar) : ''}
<h2>Semana a semana</h2>${semanasHtml}
<h2>Protocolos</h2>${protocolos}
<h2>Calendario de salud</h2><p class="aviso">${esc(P.SALUD.aviso)}</p>${lista(P.SALUD.items)}
<h2>Checklist legal</h2><ul class="legal">${legal}</ul><p class="suave">${esc(P.LEGAL.aviso)}</p>
<p class="suave">Este plan ofrece rutinas y educación en positivo. No sustituye a tu veterinario ni al curso oficial de tenencia responsable. Garantía de 14 días: si no te sirve, responde a cualquier email y te devolvemos el dinero.</p>
</main></body></html>`;

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
