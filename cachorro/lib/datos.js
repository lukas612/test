/*
 * Almacenamiento: Supabase (producción) o archivos JSONL en data/ (desarrollo).
 *
 * Con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se usan las tablas pc_* del proyecto de
 * Supabase compartido con Vigila (RLS sin políticas: solo esta clave de servicio entra).
 * Sin ellas, todo va a data/<tabla>.jsonl.
 *
 * API (todas async):
 *   insertar(tabla, fila, { ignorarDuplicado })
 *   listar(tabla, filtro, { orden: 'ts.desc', limite })
 *   primero(tabla, filtro, orden)
 *   actualizar(tabla, filtro, cambios)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const URL_SB = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const CLAVE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const USA_SUPABASE = !!(URL_SB && CLAVE);
const DATA = path.join(__dirname, '..', 'data');
const TABLAS = ['eventos', 'leads', 'pedidos', 'reembolsos', 'planes', 'emails'];

function comprobar(tabla) { if (!TABLAS.includes(tabla)) throw new Error('Tabla desconocida: ' + tabla); }

// ---------- Supabase (PostgREST) ----------
async function sb(metodo, tabla, { filtro = {}, cuerpo, orden, limite, prefer } = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(filtro)) q.append(k, 'eq.' + v);
  if (orden) q.append('order', orden);
  if (limite) q.append('limit', String(limite));
  const headers = { apikey: CLAVE, Authorization: 'Bearer ' + CLAVE, 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${URL_SB}/rest/v1/pc_${tabla}?${q}`, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  if (!r.ok) throw new Error(`Supabase ${metodo} pc_${tabla}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r.status === 204 ? null : r.json();
}
async function sbTodos(tabla, filtro, orden) {
  // PostgREST devuelve como mucho 1.000 filas por petición: paginamos.
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(filtro || {})) q.append(k, 'eq.' + v);
    q.append('order', orden || 'ts.asc');
    const r = await fetch(`${URL_SB}/rest/v1/pc_${tabla}?${q}`, { headers: { apikey: CLAVE, Authorization: 'Bearer ' + CLAVE, Range: `${desde}-${desde + 999}` } });
    if (!r.ok) throw new Error(`Supabase GET pc_${tabla}: ${r.status}`);
    const pag = await r.json();
    filas.push(...pag);
    if (pag.length < 1000) return filas;
  }
}

// ---------- Archivos JSONL ----------
function archivo(tabla) { return path.join(DATA, tabla + '.jsonl'); }
function leerArchivo(tabla) {
  const f = archivo(tabla);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
function escribirArchivo(tabla, filas) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(archivo(tabla), filas.map((f) => JSON.stringify(f)).join('\n') + (filas.length ? '\n' : ''));
}
const coincide = (fila, filtro) => Object.entries(filtro || {}).every(([k, v]) => String(fila[k]) === String(v));
const CLAVES_UNICAS = { pedidos: ['session_id', 'tipo'], emails: ['email', 'clave'], planes: ['token'], reembolsos: ['charge'] };

// ---------- API ----------
async function insertar(tabla, fila, opts = {}) {
  comprobar(tabla);
  if (USA_SUPABASE) {
    const prefer = opts.ignorarDuplicado ? 'resolution=ignore-duplicates,return=minimal' : 'return=minimal';
    await sb('POST', tabla, { cuerpo: fila, prefer });
    return;
  }
  const filas = leerArchivo(tabla);
  const unica = CLAVES_UNICAS[tabla];
  if (unica && filas.some((f) => unica.every((k) => f[k] === fila[k]))) {
    if (opts.ignorarDuplicado) return;
    throw new Error('Duplicado en ' + tabla);
  }
  fs.mkdirSync(DATA, { recursive: true });
  fs.appendFileSync(archivo(tabla), JSON.stringify({ ts: new Date().toISOString(), ...fila }) + '\n');
}

async function listar(tabla, filtro = {}, opts = {}) {
  comprobar(tabla);
  if (USA_SUPABASE) {
    if (opts.limite) return sb('GET', tabla, { filtro, orden: opts.orden || 'ts.asc', limite: opts.limite });
    return sbTodos(tabla, filtro, opts.orden);
  }
  let filas = leerArchivo(tabla).filter((f) => coincide(f, filtro));
  if ((opts.orden || '').endsWith('.desc')) filas.reverse();
  return opts.limite ? filas.slice(0, opts.limite) : filas;
}

async function primero(tabla, filtro = {}, orden = 'ts.desc') {
  const filas = await listar(tabla, filtro, { orden, limite: 1 });
  return filas[0] || null;
}

async function actualizar(tabla, filtro, cambios) {
  comprobar(tabla);
  if (USA_SUPABASE) { await sb('PATCH', tabla, { filtro, cuerpo: cambios, prefer: 'return=minimal' }); return; }
  escribirArchivo(tabla, leerArchivo(tabla).map((f) => (coincide(f, filtro) ? { ...f, ...cambios } : f)));
}

module.exports = { insertar, listar, primero, actualizar, USA_SUPABASE };
