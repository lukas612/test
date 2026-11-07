/*
 * Página privada del plan de 8 semanas (HTML completo y autocontenido).
 * Funciona en Node (generar-plan.js) y en navegador (demo): render(datos) → string HTML.
 * Las casillas marcadas se guardan en el navegador del cliente (localStorage).
 */
(function (root) {
  'use strict';
  var P, D, T;
  if (typeof module !== 'undefined' && module.exports) {
    P = require('./plantillas.js'); D = require('../public/perros.js'); T = require('./tareas-diarias.js');
  } else { P = root.PLANTILLAS; D = root.PERROS; T = root.TAREAS; }
  var I = D.icono;

  var TIPOS = {
    despertar: ['sol', 'butter'], comida: ['cuenco', 'butter'], juego: ['pelota', 'mint'], solo: ['puerta', 'peach'],
    pis: ['gota', 'sky'], aprender: ['estrella', 'lilac'], raza: ['huella', 'peach'], social: ['personas', 'mint'],
    familia: ['nino', 'butter'], mordiscos: ['diente', 'peach'], noches: ['luna', 'lilac'], dormir: ['cama', 'lilac'], noche: ['luna', 'lilac']
  };
  var ICONO_PROBLEMA = { pis: 'gota', mordiscos: 'diente', noches: 'luna', solo: 'puerta' };
  var ICONO_LEGAL = { chip: 'chip', registro: 'ley', rabia: 'vacuna', seguro: 'escudo', curso: 'calendario', ppp: 'ley' };
  var ICONO_SALUD = ['corazon', 'calendario', 'huella', 'vacuna', 'cuenco', 'calendario'];
  var COLORES = ['sky', 'butter', 'mint', 'peach', 'lilac'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function b(ic, color, cls) { return '<span class="bu b-' + color + (cls ? ' ' + cls : '') + '">' + I(ic) + '</span>'; }
  function perfilDe(r) {
    return { nombre: r.nombre || 'tu cachorro', raza: r.raza, razaId: r.razaId || 'mestizo', edadSemanas: Number(r.edadSemanas) || 10, tamano: r.tamano || 'mediano', vivienda: r.vivienda, horasSolo: Number(r.horasSolo) || 0, problema: r.problema || 'pis', convivientes: r.convivientes || [] };
  }
  function fechaLarga(d) {
    var m = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return d.getDate() + ' de ' + m[d.getMonth()];
  }

  function timeline(rut) {
    return '<ul class="tl">' + rut.bloques.map(function (x) {
      var t = TIPOS[x[2]] || ['reloj', 'sky'];
      return '<li>' + b(t[0], t[1]) + '<div><div class="h">' + esc(x[0]) + '</div><div class="t">' + esc(x[1]) + '</div></div></li>';
    }).join('') + '</ul>';
  }

  function render(datos) {
    var r = datos.respuestas || {};
    var pf = perfilDe(r);
    var n = pf.nombre;
    var marca = datos.marca || 'Plan Cachorro';
    var id = datos.id || 'demo';
    var inicio = datos.inicio ? new Date(datos.inicio) : new Date();
    var raza = D.raza(pf.razaId) || D.raza('mestizo');
    var tiene = r.tiene || [];
    var prot = P.PROTOCOLOS[pf.problema] || P.PROTOCOLOS.pis;
    var rut0 = P.rutinaDiaria(pf);
    var nombreRaza = pf.razaId === 'otra' ? (r.raza || 'Cachorro') : raza.nombre;

    // ---------- Semanas ----------
    var tramoPrev = null, semanas = '';
    for (var s = 1; s <= 8; s++) {
      var edad = pf.edadSemanas + s - 1;
      var rut = P.rutinaDiaria(Object.assign({}, pf, { edadSemanas: edad }));
      var soc = P.SOCIALIZACION[s - 1];
      var cambia = rut.tramo !== tramoPrev; tramoPrev = rut.tramo;
      var tareas = T.slice((s - 1) * 7, s * 7);
      semanas += '<section class="sem" id="s' + s + '" data-sem="' + s + '"' + (s === 1 ? '' : ' hidden') + '>' +
        '<div class="sem-cab"><div><span class="eti">Semana ' + s + ' · ' + esc(soc.foco) + '</span><h3>' + esc(n) + ' con ' + edad + ' semanas</h3></div>' +
        (cambia && s > 1 ? '<span class="pill nueva">Rutina nueva</span>' : '') + '</div>' +
        '<div class="rejilla">' +
          '<div class="caja"><h4>' + I('calendario') + 'Una tarea cada día</h4><ul class="checks">' + tareas.map(function (t) {
            var k = 'd' + t.dia;
            return '<li><label><input type="checkbox" data-k="' + k + '"><span><b>Día ' + t.dia + ' · ' + esc(t.titulo) + '</b>' + esc(t.tarea.replace(/\{n\}/g, n)) + '</span></label></li>';
          }).join('') + '</ul></div>' +
          '<div class="caja"><h4>' + I('personas') + 'Socialización: ' + esc(soc.foco.toLowerCase()) + '</h4><ul class="checks">' + soc.items.map(function (it, j) {
            return '<li><label><input type="checkbox" data-k="s' + s + '-' + j + '"><span>' + esc(it) + '</span></label></li>';
          }).join('') + '</ul><p class="peq">Poco rato y sin forzar. Si se agobia, más distancia y vuelve otro día.</p></div>' +
        '</div>' +
        '<details class="rut"' + (cambia ? ' open' : '') + '><summary>' + I('reloj') + (cambia ? 'Su rutina de esta semana' : 'Su rutina (igual que la semana pasada)') + '</summary>' + timeline(rut) + '<p class="nota">' + I('chispa') + esc(rut.nota) + '</p></details>' +
        '</section>';
    }

    // ---------- Protocolos ----------
    var orden = ['pis', 'mordiscos', 'noches', 'solo'].sort(function (a, c) { return a === pf.problema ? -1 : c === pf.problema ? 1 : 0; });
    var protocolos = orden.map(function (k, idx) {
      var pr = P.PROTOCOLOS[k];
      var si = k === 'pis' ? (pf.vivienda === 'jardin' ? pr.jardin : pr.piso) : pr.si;
      return '<details class="prot"' + (idx === 0 ? ' open' : '') + '><summary>' + b(ICONO_PROBLEMA[k], COLORES[idx]) + '<span><b>' + esc(pr.titulo) + '</b>' + (idx === 0 ? '<em>Tu prioridad</em>' : '<em>' + si.length + ' pasos</em>') + '</span></summary>' +
        '<div class="prot-in"><div><h4 class="ok">' + I('check') + 'Qué hacer</h4><ol>' + si.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>' +
        '<div><h4 class="no">' + I('flecha') + 'Evita</h4><ul class="evita">' + pr.no.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div></details>';
    }).join('');

    // ---------- Notas del hogar ----------
    var conv = pf.convivientes;
    var notas = [];
    if (conv.indexOf('ninos') >= 0) notas.push(['nino', 'butter', 'Niños en casa', 'Que ' + n + ' tenga un sitio donde nadie le moleste cuando descansa, y juegos siempre supervisados.']);
    if (conv.indexOf('perros') >= 0) notas.push(['perro', 'peach', 'Otro perro', 'Comidas separadas y ratos a solas contigo para que aprenda de ti, no solo del otro perro.']);
    if (conv.indexOf('gatos') >= 0) notas.push(['gato', 'lilac', 'Gatos', 'Que el gato tenga zonas altas y su comida fuera del alcance. Presentaciones cortas y con premio.']);
    if (pf.horasSolo >= 6) notas.push(['reloj', 'sky', pf.horasSolo + ' horas sin nadie', 'En estas semanas es muy recomendable que alguien pase a mitad de jornada.']);
    if (r.primerPerro === 'si') notas.push(['estrella', 'mint', 'Tu primer perro', 'Es normal sentirse agobiado. Haz solo la tarea de cada día; no intentes hacerlo todo a la vez.']);
    rut0.avisosRaza.forEach(function (a) { notas.unshift(['huella', 'peach', 'Por ser ' + nombreRaza.toLowerCase(), a]); });

    var legal = P.LEGAL.items.map(function (x) {
      var hecho = tiene.indexOf(x.id) >= 0;
      return '<li>' + b(ICONO_LEGAL[x.id], hecho ? 'mint' : 'peach') + '<div><b>' + esc(x.texto) + '</b><span>' + esc(x.estado) + '</span></div>' +
        '<label class="pill-check"><input type="checkbox" data-k="l-' + x.id + '"' + (hecho ? ' data-def="1"' : '') + '><span>Hecho</span></label></li>';
    }).join('');

    var salud = P.SALUD.items.map(function (x, k) { return '<li>' + b(ICONO_SALUD[k] || 'corazon', COLORES[k % 5]) + '<span>' + esc(x) + '</span></li>'; }).join('');

    var primeros = (pf.problema === 'pis' ? (pf.vivienda === 'jardin' ? prot.jardin : prot.piso) : prot.si).slice(0, 3);
    var chips = [nombreRaza, pf.edadSemanas + ' semanas', pf.vivienda === 'jardin' ? 'Casa con jardín' : 'Piso', r.comunidad].filter(Boolean);

    var html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex">' +
      '<title>Plan de ' + esc(n) + ' · ' + esc(marca) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap">' +
      '<style>' + CSS + '</style></head><body>' +
      (datos.volver ? '<button class="volver" id="volver">' + I('flecha') + 'Volver a la demo</button>' : '') +

      '<header class="hero"><div class="in">' +
        '<div class="hero-top"><span class="marca"><span class="logo">' + I('huella') + '</span>' + esc(marca) + '</span><span class="desde">Desde el ' + fechaLarga(inicio) + '</span></div>' +
        '<div class="hero-main"><span class="av">' + D.cara(pf.razaId, { lengua: true }) + '</span><div><span class="eti cl">Plan de 8 semanas</span><h1>' + esc(n) + '</h1>' +
        '<div class="chips">' + chips.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div></div></div>' +
        '<div class="progreso"><div class="pr-txt"><b id="pr-sem">Semana 1 de 8</b><span id="pr-pct">0 tareas hechas</span></div><div class="barra"><i id="pr-bar"></i></div></div>' +
      '</div></header>' +

      '<nav class="nav"><div class="in"><a href="#hoy">Hoy</a><a href="#semanas">Semanas</a><a href="#protocolos">Protocolos</a><a href="#papeleo">Salud y papeleo</a></div></nav>' +

      '<main class="in">' +
      '<section id="hoy" class="pila">' +
        '<div class="hoy"><div class="hoy-cab">' + b('sol', 'butter') + '<div><span class="eti">Hoy · <span id="hoy-dia">Día 1</span></span><h2 id="hoy-tit">' + esc(T[0].titulo) + '</h2></div></div>' +
        '<p id="hoy-txt">' + esc(T[0].tarea.replace(/\{n\}/g, n)) + '</p><label class="hecho-hoy"><input type="checkbox" id="hoy-check"><span>Hecho</span></label></div>' +
        '<div class="prio">' + b(ICONO_PROBLEMA[pf.problema], 'peach') + '<div><span class="eti">Tu prioridad</span><h3>' + esc(prot.titulo) + '</h3><ol>' + primeros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol><a href="#protocolos">Ver el protocolo completo</a></div></div>' +
        (notas.length ? '<div class="notas">' + notas.map(function (x) { return '<div class="nt">' + b(x[0], x[1]) + '<div><b>' + esc(x[2]) + '</b><span>' + esc(x[3]) + '</span></div></div>'; }).join('') + '</div>' : '') +
      '</section>' +

      '<section id="semanas" class="pila"><span class="eti">Semana a semana</span><h2>Su plan, día a día</h2>' +
        '<div class="tabs" role="tablist">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '<button role="tab" data-tab="' + k + '" aria-selected="' + (k === 1) + '"><b>S' + k + '</b><small>' + (pf.edadSemanas + k - 1) + ' sem.</small></button>'; }).join('') + '</div>' +
        semanas + '</section>' +

      '<section id="protocolos" class="pila"><span class="eti">Protocolos</span><h2>Qué hacer en cada situación</h2>' + protocolos + '</section>' +

      '<section id="papeleo" class="pila"><span class="eti">Salud y papeleo</span><h2>Lo que no se te puede pasar</h2>' +
        '<div class="caja"><h4>' + I('corazon') + 'Para preguntar a tu veterinario</h4><p class="aviso">' + esc(P.SALUD.aviso) + '</p><ul class="lista-ic">' + salud + '</ul></div>' +
        '<div class="caja"><h4>' + I('ley') + 'Checklist legal' + (r.comunidad ? ' · ' + esc(r.comunidad) : '') + '</h4><ul class="legal">' + legal + '</ul><p class="peq">' + esc(P.LEGAL.aviso) + '</p></div>' +
      '</section>' +

      '<footer class="pie">' + b('escudo', 'mint') + '<div><b>Garantía de 14 días</b><span>Si el plan no te sirve, responde a cualquiera de nuestros emails y te devolvemos el dinero.</span></div></footer>' +
      '<p class="legal-pie">Este plan ofrece rutinas y educación en positivo. No sustituye a tu veterinario ni al curso oficial de tenencia responsable. Contenido revisado el ' + esc(P.REVISADO) + '.</p>' +
      '</main>' +
      '<script>' + JS.replace('__ID__', JSON.stringify(id)).replace('__INICIO__', JSON.stringify(inicio.toISOString())).replace('__TAREAS__', JSON.stringify(T.map(function (t) { return [t.titulo, t.tarea.replace(/\{n\}/g, n)]; }))) + '<\/script>' +
      '</body></html>';
    return html;
  }

  var JS = "(function(){var id='plan_'+__ID__,inicio=new Date(__INICIO__),T=__TAREAS__;" +
    "function get(){try{return JSON.parse(localStorage.getItem(id))||{}}catch(e){return{}}}function set(v){try{localStorage.setItem(id,JSON.stringify(v))}catch(e){}}" +
    "var st=get();var dia=Math.min(56,Math.max(1,Math.floor((Date.now()-inicio.getTime())/864e5)+1));var sem=Math.ceil(dia/7);" +
    "document.querySelectorAll('input[data-k]').forEach(function(c){var k=c.dataset.k;c.checked=k in st?st[k]:!!c.dataset.def;c.onchange=function(){st[k]=c.checked;set(st);sync();act()}});" +
    "var hc=document.getElementById('hoy-check');document.getElementById('hoy-dia').textContent='Día '+dia;document.getElementById('hoy-tit').textContent=T[dia-1][0];document.getElementById('hoy-txt').textContent=T[dia-1][1];" +
    "hc.checked=!!st['d'+dia];hc.onchange=function(){st['d'+dia]=hc.checked;set(st);sync();act()};" +
    "function sync(){var c=document.querySelector('input[data-k=\"d'+dia+'\"]');if(c)c.checked=!!st['d'+dia]}" +
    "function act(){var n=0;for(var i=1;i<=56;i++)if(st['d'+i])n++;document.getElementById('pr-sem').textContent='Semana '+sem+' de 8';document.getElementById('pr-pct').textContent=n+' de 56 tareas hechas';document.getElementById('pr-bar').style.width=Math.max(3,n/56*100)+'%'}" +
    "function tab(k){document.querySelectorAll('[data-tab]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab==k)});document.querySelectorAll('.sem').forEach(function(s){s.hidden=s.dataset.sem!=k})}" +
    "document.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){tab(b.dataset.tab)}});tab(sem);act();" +
    "var v=document.getElementById('volver');if(v)v.onclick=function(){location.reload()};" +
    "window.addEventListener('beforeprint',function(){document.querySelectorAll('.sem').forEach(function(s){s.hidden=false});document.querySelectorAll('details').forEach(function(d){d.open=true})});})();";

  var CSS = [
    ':root{--bg:#f5f7fb;--surface:#fff;--surface-2:#eef2f8;--ink:#1b2a41;--muted:#5c6b80;--line:#dde3ec;--primary:#ffc83d;--brand:#2546a8;--ok:#17885c;--ok-bg:#dcf3e8;--warn:#b8432b;--warn-bg:#fde6df;--peach:#ffe0cc;--butter:#fff0bf;--mint:#d5f2e3;--sky:#d6ecff;--lilac:#e6defc;--shadow:0 1px 2px rgba(27,42,65,.06),0 8px 24px rgba(27,42,65,.08);--display:"Bricolage Grotesque","Avenir Next",system-ui,sans-serif;--body:"Figtree",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f1724;--surface:#18233a;--surface-2:#1f2c46;--ink:#edf1f8;--muted:#a3b3c9;--line:#2a3a58;--brand:#a9c0ff;--ok:#5fd3a0;--ok-bg:#163b2d;--warn:#ff9a80;--warn-bg:#3d211b;--peach:#4a3328;--butter:#463d1c;--mint:#1d3d30;--sky:#1d3352;--lilac:#2f2a4d;--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.25);color-scheme:dark}}',
    ':root[data-theme="dark"]{--bg:#0f1724;--surface:#18233a;--surface-2:#1f2c46;--ink:#edf1f8;--muted:#a3b3c9;--line:#2a3a58;--brand:#a9c0ff;--ok:#5fd3a0;--ok-bg:#163b2d;--warn:#ff9a80;--warn-bg:#3d211b;--peach:#4a3328;--butter:#463d1c;--mint:#1d3d30;--sky:#1d3352;--lilac:#2f2a4d;--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.25);color-scheme:dark}',
    '[hidden]{display:none!important}*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--ink);font:16px/1.5 var(--body);-webkit-font-smoothing:antialiased}',
    '.in{max-width:760px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}',
    'h1,h2,h3,h4{font-family:var(--display);letter-spacing:-.02em;margin:0;text-wrap:balance}h2{font-size:1.6rem;line-height:1.15}h3{font-size:1.2rem;line-height:1.2}h4{font-size:1rem;display:flex;align-items:center;gap:8px}',
    'p{margin:0}a{color:var(--brand);font-weight:600}.peq{font-size:.82rem;color:var(--muted)}.ico{width:20px;height:20px;flex:none}',
    '.eti{font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--brand)}.eti.cl{color:#ffd76e}',
    '.bu{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;flex:none;color:var(--ink)}.b-peach{background:var(--peach)}.b-butter{background:var(--butter)}.b-mint{background:var(--mint)}.b-sky{background:var(--sky)}.b-lilac{background:var(--lilac)}',
    '.volver{position:fixed;z-index:30;bottom:calc(14px + env(safe-area-inset-bottom,0px));right:max(14px,env(safe-area-inset-right,0px));padding:12px 16px!important;display:flex;align-items:center;gap:6px;border:0;border-radius:99px;padding:8px 14px;font:700 .85rem var(--body);background:var(--primary);color:#1b2a41;cursor:pointer;box-shadow:var(--shadow)}',
    '.hero{background:linear-gradient(150deg,#26396a,#1b2a41 65%);color:#fff;padding-block:18px 26px;position:relative;overflow:hidden}.hero::after{content:"";position:absolute;width:320px;height:320px;border-radius:50%;background:#ffc83d;opacity:.12;right:-120px;top:-140px}',
    '.hero .in{position:relative;z-index:1;display:flex;flex-direction:column;gap:20px}.hero-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}',
    '.marca{display:flex;align-items:center;gap:8px;font:800 1.05rem var(--display)}.logo{width:28px;height:28px;border-radius:9px;background:var(--primary);color:#1b2a41;display:grid;place-items:center}.logo .ico{width:17px;height:17px}.desde{font-size:.85rem;color:#c5d0e3}',
    '.hero-main{display:flex;gap:18px;align-items:center}.av{width:104px;height:104px;flex:none;filter:drop-shadow(0 8px 16px rgba(0,0,0,.25))}.hero h1{font-size:clamp(2.2rem,9vw,3rem);line-height:1;color:#fff;margin:4px 0 10px}',
    '.chips{display:flex;flex-wrap:wrap;gap:6px}.chips span{background:rgba(255,255,255,.12);border-radius:99px;padding:4px 10px;font-size:.8rem;font-weight:600}',
    '.progreso{background:rgba(255,255,255,.08);border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}.pr-txt{display:flex;justify-content:space-between;gap:8px;font-size:.88rem;flex-wrap:wrap}.pr-txt span{color:#c5d0e3}.barra{height:8px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden}.barra i{display:block;height:100%;width:3%;background:var(--primary);border-radius:99px;transition:width .3s}',
    '.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}.nav .in{display:flex;gap:4px;overflow-x:auto;padding-block:8px;scrollbar-width:none}.nav a{white-space:nowrap;text-decoration:none;color:var(--ink);font-weight:700;font-size:.9rem;padding:8px 12px;border-radius:99px}.nav a:hover{background:var(--surface)}',
    'main.in{display:flex;flex-direction:column;gap:40px;padding-block:24px 40px}section{scroll-margin-top:64px}.pila{display:flex;flex-direction:column;gap:14px}',
    '.hoy{background:var(--surface);border-radius:22px;padding:18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:12px;border:2px solid var(--primary)}.hoy-cab{display:flex;gap:12px;align-items:center}.hoy p{font-size:1.02rem}',
    '.hecho-hoy,.pill-check{display:inline-flex;align-self:flex-start;align-items:center;gap:8px;font-weight:700;font-size:.9rem;cursor:pointer;background:var(--surface-2);border-radius:99px;padding:8px 14px}.hecho-hoy input,.pill-check input,.checks input{width:20px;height:20px;accent-color:var(--ok);margin:0;flex:none}',
    '.prio{background:var(--surface);border-radius:22px;padding:18px;box-shadow:var(--shadow);display:grid;grid-template-columns:42px 1fr;gap:12px}.prio>div{display:flex;flex-direction:column;gap:6px;min-width:0}.prio ol{margin:4px 0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:.95rem}',
    '.notas{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}.nt{background:var(--surface);border-radius:18px;padding:14px;display:grid;grid-template-columns:42px 1fr;gap:12px;min-width:0}.nt b{display:block;font-size:.95rem}.nt span{font-size:.9rem;color:var(--muted)}',
    '.tabs{display:grid;grid-template-columns:repeat(8,1fr);gap:6px}.tabs button{border:0;border-radius:14px;background:var(--surface);color:var(--ink);padding:8px 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;font-family:var(--body);box-shadow:var(--shadow)}.tabs b{font:800 1rem var(--display)}.tabs small{font-size:.66rem;color:var(--muted)}.tabs button[aria-selected="true"]{background:var(--primary);color:#1b2a41}.tabs button[aria-selected="true"] small{color:#1b2a41}',
    '.sem{display:flex;flex-direction:column;gap:14px}.sem-cab{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}.sem-cab h3{font-size:1.4rem;margin-top:2px}',
    '.pill{font-size:.75rem;font-weight:700;border-radius:99px;padding:5px 10px}.pill.nueva{background:var(--butter);color:var(--ink)}',
    '.rejilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}.caja{background:var(--surface);border-radius:22px;padding:18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:12px;min-width:0}',
    '.checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}.checks label{display:flex;gap:12px;align-items:flex-start;padding:8px 6px;border-radius:12px;cursor:pointer;font-size:.92rem;line-height:1.4}.checks label:hover{background:var(--surface-2)}.checks b{display:block;font-size:.88rem}.checks input{margin-top:2px}.checks input:checked+span{opacity:.5;text-decoration:line-through}',
    'details.rut{background:var(--surface);border-radius:22px;box-shadow:var(--shadow);padding:4px 18px}details.rut summary,details.prot summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;font-weight:700;padding:14px 0}details summary::-webkit-details-marker{display:none}details.rut[open]{padding-bottom:18px}',
    '.tl{list-style:none;margin:0;padding:0;position:relative}.tl:before{content:"";position:absolute;left:20px;top:12px;bottom:12px;width:2px;background:var(--line)}.tl li{display:grid;grid-template-columns:42px 1fr;gap:12px;padding:7px 0;position:relative}.tl .bu{position:relative;z-index:1;box-shadow:0 0 0 4px var(--surface)}.tl .h{font:800 .92rem var(--display);font-variant-numeric:tabular-nums}.tl .t{font-size:.92rem;line-height:1.4}',
    '.nota{margin-top:10px;background:var(--surface-2);border-radius:14px;padding:12px 14px;font-size:.86rem;color:var(--muted);display:flex;gap:10px}.nota .ico{color:var(--brand)}',
    'details.prot{background:var(--surface);border-radius:22px;box-shadow:var(--shadow);padding:2px 18px}details.prot summary span{display:flex;flex-direction:column}details.prot summary em{font-style:normal;font-size:.8rem;color:var(--muted);font-weight:600}details.prot[open] summary em{color:var(--warn)}',
    '.prot-in{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;padding-bottom:18px}.prot-in ol{margin:8px 0 0;padding-left:22px;display:flex;flex-direction:column;gap:8px;font-size:.93rem}.ok{color:var(--ok)}.no{color:var(--warn)}.no .ico{transform:rotate(45deg)}',
    '.evita{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:.93rem}.evita li{background:var(--warn-bg);border-radius:12px;padding:8px 12px}',
    '.aviso{background:var(--surface-2);border-radius:14px;padding:10px 12px;font-size:.86rem;color:var(--muted)}.lista-ic{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}.lista-ic li{display:flex;gap:12px;align-items:center;font-size:.93rem}',
    '.legal{list-style:none;margin:0;padding:0}.legal li{display:grid;grid-template-columns:42px 1fr auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}.legal li:last-child{border-bottom:0}.legal b{display:block;font-size:.93rem;line-height:1.3}.legal span{font-size:.82rem;color:var(--muted)}.pill-check{padding:6px 10px;font-size:.8rem}',
    '.pie{background:var(--ok-bg);color:var(--ok);border-radius:22px;padding:16px;display:grid;grid-template-columns:42px 1fr;gap:12px;align-items:center}.pie b{display:block}.pie span{font-size:.9rem}.legal-pie{font-size:.8rem;color:var(--muted);text-align:center}',
    '@media (max-width:480px){.hero-main{gap:14px}.av{width:84px;height:84px}.tabs{grid-template-columns:repeat(4,1fr)}.legal li{grid-template-columns:42px 1fr}.legal .pill-check{grid-column:2}}',
    '@media print{.nav,.volver,.tabs{display:none}.sem{page-break-inside:avoid}body{background:#fff}}',
    '@media (prefers-reduced-motion:reduce){*{transition:none!important}}'
  ].join('\n');

  var api = { render: render, TIPOS: TIPOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PLAN_HTML = api;
})(this);
