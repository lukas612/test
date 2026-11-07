#!/usr/bin/env node
/*
 * Métricas del funnel frente a las puertas del MVP, por ángulo de anuncio y por precio.
 *
 *   node scripts/metricas.js                 # usa data/gasto.json si existe
 *   node scripts/metricas.js --gasto 300     # gasto total en anuncios (se reparte por clics si no hay desglose)
 *
 * data/gasto.json (opcional, desglose por ángulo copiado de Meta Ads Manager):
 *   { "pis": 62.4, "noches": 58.1, "mordiscos": 60.0, "solo": 59.7, "rutina": 61.2 }
 */
'use strict';
require('../lib/config');
const fs = require('fs');
const path = require('path');
const datos = require('../lib/datos');

const IVA = 0.21;
const PUERTAS = { costeForm: 0.75, compra: 0.05, ventasMin: 30, cac: 16, reembolsos: 0.05, clicsMin: 1000, utilMin: 0.8, respuestasMin: 20 };

const anguloDe = (utm) => (utm && (utm.a || utm.utm_content)) || 'directo';
const pct = (a, b) => (b ? a / b : null);
const netoVenta = (c) => c / 100 / (1 + IVA) - (c / 100 * 0.015 + 0.25);

async function calcular(opts = {}) {
  const [eventos, leads, pedidosTodos, reembolsos] = await Promise.all([datos.listar('eventos'), datos.listar('leads'), datos.listar('pedidos'), datos.listar('reembolsos')]);
  const pedidos = pedidosTodos.filter((p) => !p.demo || opts.incluirDemo);
  let gasto = opts.gastoPorAngulo || {};
  const gf = path.join(__dirname, '..', 'data', 'gasto.json');
  if (!opts.gastoPorAngulo && fs.existsSync(gf)) gasto = JSON.parse(fs.readFileSync(gf, 'utf8'));

  const leadPorSid = Object.fromEntries(leads.map((l) => [l.sid, l]));
  const fila = () => ({ visitas: 0, inicios: 0, forms: 0, compras: 0, upsells: 0, ingresosNetos: 0, reembolsos: 0 });
  const porAngulo = {}, porPrecio = {};
  const get = (o, k) => (o[k] = o[k] || fila());
  const sidVistos = new Set();

  for (const e of eventos) {
    const a = anguloDe(e.utm);
    if (e.tipo === 'visita' && !sidVistos.has(e.sid)) { sidVistos.add(e.sid); get(porAngulo, a).visitas++; }
    if (e.tipo === 'inicio_form') get(porAngulo, a).inicios++;
  }
  for (const l of leads) { get(porAngulo, anguloDe(l.utm)).forms++; get(porPrecio, l.precio).forms++; }

  const piReembolsados = new Set(reembolsos.map((r) => r.payment_intent));
  for (const p of pedidos) {
    const lead = leadPorSid[p.sid];
    const a = anguloDe(p.utm || lead?.utm);
    const precio = lead?.precio;
    const neto = netoVenta(p.importe) - (p.tipo === 'plan' ? 0.20 : 0);
    for (const f of [get(porAngulo, a), precio ? get(porPrecio, precio) : null].filter(Boolean)) {
      if (p.tipo === 'plan') f.compras++; else f.upsells++;
      // Reembolsado: se devuelve todo, pero Stripe no devuelve su comisión.
      if (piReembolsados.has(p.payment_intent)) { f.reembolsos += p.tipo === 'plan' ? 1 : 0; f.ingresosNetos -= p.importe / 100 * 0.015 + 0.25; }
      else f.ingresosNetos += neto;
    }
  }

  // Gasto: por ángulo si hay desglose; si no, reparto proporcional a visitas.
  const totalVisitas = Object.values(porAngulo).reduce((s, f) => s + f.visitas, 0);
  const gastoTotal = opts.gasto != null ? opts.gasto : Object.values(gasto).reduce((s, x) => s + Number(x), 0);
  for (const [a, f] of Object.entries(porAngulo)) {
    f.gasto = gasto[a] != null ? Number(gasto[a]) : (opts.gasto != null && totalVisitas ? opts.gasto * f.visitas / totalVisitas : 0);
  }
  const deriva = (f) => ({
    ...f,
    tasaForm: pct(f.forms, f.visitas),
    costeForm: f.gasto ? f.gasto / (f.forms || NaN) : null,
    tasaCompra: pct(f.compras, f.forms),
    cac: f.gasto ? f.gasto / (f.compras || NaN) : null,
    netoPorComprador: f.compras ? f.ingresosNetos / f.compras : null,
    tasaReembolso: pct(f.reembolsos, f.compras)
  });
  const angulos = Object.fromEntries(Object.entries(porAngulo).map(([k, f]) => [k, deriva(f)]));
  const precios = Object.fromEntries(Object.entries(porPrecio).map(([k, f]) => [k, deriva(f)]));
  const total = deriva(Object.values(porAngulo).reduce((s, f) => { for (const k in f) s[k] = (s[k] || 0) + f[k]; return s; }, {}));
  total.gasto = gastoTotal;
  Object.assign(total, deriva(total));

  const notas = eventos.filter((e) => e.tipo === 'encuesta').map((e) => Number(String(e.paso).split(':')[1])).filter(Boolean);
  const util = pct(notas.filter((x) => x >= 8).length, notas.length);
  const puertas = {
    puerta1: total.costeForm == null ? 'sin gasto' : total.costeForm <= PUERTAS.costeForm ? 'PASA' : 'NO PASA',
    puerta2: total.compras < PUERTAS.ventasMin ? `faltan datos (${total.compras}/${PUERTAS.ventasMin} ventas)` : (total.tasaCompra >= PUERTAS.compra && total.cac <= PUERTAS.cac ? 'PASA' : 'NO PASA'),
    reembolsos: total.compras ? (total.tasaReembolso < PUERTAS.reembolsos ? 'dentro' : 'FUERA') : '—',
    puerta3: notas.length < PUERTAS.respuestasMin ? `faltan datos (${notas.length}/${PUERTAS.respuestasMin} respuestas)` : (util >= PUERTAS.utilMin && total.tasaReembolso < PUERTAS.reembolsos ? 'PASA' : 'NO PASA')
  };
  return { umbrales: PUERTAS, total, angulos, precios, puertas, encuesta: { respuestas: notas.length, util }, clicSeguros: eventos.filter((e) => e.tipo === 'clic_seguros').length, leadsSeguros: leads.filter((l) => l.consentimientos?.seguros).length };
}

function imprimir(m) {
  const f2 = (x, suf = '') => (x == null || Number.isNaN(x) ? '—' : x.toFixed(2) + suf);
  const p1 = (x) => (x == null || Number.isNaN(x) ? '—' : (x * 100).toFixed(1) + '%');
  const tabla = (titulo, filas) => {
    console.log('\n' + titulo);
    console.log(['', 'visitas', 'forms', '%form', '€/form', 'compras', '%compra', 'CAC', 'neto/comp', 'upsells', 'reemb'].map((x) => x.padStart(10)).join(''));
    for (const [k, f] of Object.entries(filas)) {
      console.log([k.slice(0, 10), f.visitas ?? '', f.forms, p1(f.tasaForm), f2(f.costeForm), f.compras, p1(f.tasaCompra), f2(f.cac), f2(f.netoPorComprador), f.upsells, f.reembolsos].map((x) => String(x).padStart(10)).join(''));
    }
  };
  tabla('Por ángulo', { ...m.angulos, TOTAL: m.total });
  tabla('Por precio (céntimos)', m.precios);
  console.log(`\nGasto: ${f2(m.total.gasto, ' €')} · Clics en "comparar seguros": ${m.clicSeguros}`);
  console.log(`Puerta 1 (≤ ${m.umbrales.costeForm} €/form): ${m.puertas.puerta1}`);
  console.log(`Puerta 2 (≥ ${m.umbrales.compra * 100}% compra y CAC ≤ ${m.umbrales.cac} €): ${m.puertas.puerta2}`);
  console.log(`Reembolsos (< ${m.umbrales.reembolsos * 100}%): ${m.puertas.reembolsos}`);
  console.log(`Puerta 3 (≥ 8/10 útil y < 5% reembolsos): ${m.puertas.puerta3} · útil: ${p1(m.encuesta.util)} de ${m.encuesta.respuestas}`);
  console.log('Recuerda: mínimo 1.000 clics por ángulo para decidir la puerta 1 (los clics salen de Meta, no de aquí).');
}

if (require.main === module) {
  const i = process.argv.indexOf('--gasto');
  const opts = { gasto: i > 0 ? Number(process.argv[i + 1]) : null, incluirDemo: process.argv.includes('--demo') };
  calcular(opts).then(imprimir).catch((e) => { console.error(e.message); process.exit(1); });
}
module.exports = { calcular };
