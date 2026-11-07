/*
 * Ilustraciones propias: caras de perro por raza (SVG generado) e iconos de línea.
 * Funciona en navegador (window.PERROS) y en Node (require).
 */
(function (root) {
  'use strict';

  var TRAZO = '#2a1f1a';

  // Cada raza: tamaño adulto por defecto, colores y forma.
  // orejas: erecta | pequena | grande | murcielago | caida | larga | larga-rizo | doblada | rizo | mixta
  // Orden: mestizo primero y luego por popularidad aproximada en España (RSCE y prensa); "otra" al final.
  var RAZAS = [
    { id: 'mestizo',         nombre: 'Mestizo',          tamano: null,      fondo: '#ffe0cc', base: '#b9844f', claro: '#f3dfc6', mancha: '#6d4a2c', orejas: 'mixta', hocico: 1,   parche: 'ojo' },
    { id: 'caniche',         nombre: 'Caniche',          tamano: 'pequeno', fondo: '#e6defc', base: '#f2e6d3', claro: '#fbf4ea', mancha: '#e2cfb3', orejas: 'rizo',  hocico: 1.1, pelo: 'rizo' },
    { id: 'teckel',          nombre: 'Teckel',           tamano: 'pequeno', fondo: '#fff0bf', base: '#a8582a', claro: '#d9925a', mancha: '#7a3c18', orejas: 'larga', hocico: 1.3 },
    { id: 'chihuahua',       nombre: 'Chihuahua',        tamano: 'pequeno', fondo: '#fff0bf', base: '#e3b77d', claro: '#f8e6cc', mancha: '#c99558', orejas: 'grande', hocico: 0.75 },
    { id: 'yorkshire',       nombre: 'Yorkshire',        tamano: 'pequeno', fondo: '#d6ecff', base: '#c9965a', claro: '#e6c08a', mancha: '#c9965a', orejas: 'pequena', hocico: 0.85, pelo: 'flequillo-gris', lazo: true },
    { id: 'schnauzer',       nombre: 'Schnauzer',        tamano: null,      fondo: '#e6defc', base: '#8b9098', claro: '#e3e5e8', mancha: '#4a4f57', orejas: 'doblada', hocico: 1.2, pelo: 'barba' },
    { id: 'bichon',          nombre: 'Bichón maltés',    tamano: 'pequeno', fondo: '#d6ecff', base: '#ffffff', claro: '#ffffff', mancha: '#ece7e0', orejas: 'rizo',  hocico: 0.85, pelo: 'nube' },
    { id: 'pomerania',       nombre: 'Pomerania',        tamano: 'pequeno', fondo: '#d5f2e3', base: '#ee9a45', claro: '#f8cf9a', mancha: '#e08a35', orejas: 'pequena', hocico: 0.7, pelo: 'melena' },
    { id: 'shih-tzu',        nombre: 'Shih tzu',         tamano: 'pequeno', fondo: '#ffe0cc', base: '#ffffff', claro: '#ffffff', mancha: '#d9a35f', orejas: 'larga', hocico: 0.75, parche: 'antifaz', lazo: true },
    { id: 'bulldog-frances', nombre: 'Bulldog francés',  tamano: 'mediano', fondo: '#d5f2e3', base: '#4a4542', claro: '#f1ece6', mancha: '#2e2a28', orejas: 'murcielago', hocico: 0.7, parche: 'pecho' },
    { id: 'jack-russell',    nombre: 'Jack Russell',     tamano: 'pequeno', fondo: '#e6defc', base: '#ffffff', claro: '#ffffff', mancha: '#b5713a', orejas: 'doblada', hocico: 1.05, parche: 'antifaz' },
    { id: 'beagle',          nombre: 'Beagle',           tamano: 'mediano', fondo: '#ffe0cc', base: '#c47a3c', claro: '#ffffff', mancha: '#3a2c24', orejas: 'larga', hocico: 1.05, parche: 'franja' },
    { id: 'cocker',          nombre: 'Cocker spaniel',   tamano: 'mediano', fondo: '#fff0bf', base: '#d9963f', claro: '#efc07a', mancha: '#b8762a', orejas: 'larga-rizo', hocico: 1.05 },
    { id: 'border-collie',   nombre: 'Border collie',    tamano: 'mediano', fondo: '#d6ecff', base: '#2b2725', claro: '#ffffff', mancha: '#2b2725', orejas: 'doblada', hocico: 1.1, parche: 'franja' },
    { id: 'perro-agua',      nombre: 'Perro de agua',    tamano: 'mediano', fondo: '#d5f2e3', base: '#6b4a34', claro: '#8a6448', mancha: '#5a3c28', orejas: 'rizo',  hocico: 1, pelo: 'rizo' },
    { id: 'podenco',         nombre: 'Podenco',          tamano: 'mediano', fondo: '#fff0bf', base: '#c8763a', claro: '#f6e2cd', mancha: '#a85c26', orejas: 'grande', hocico: 1.25 },
    { id: 'setter',          nombre: 'Setter inglés',    tamano: 'grande',  fondo: '#e6defc', base: '#ffffff', claro: '#ffffff', mancha: '#c8692e', orejas: 'larga', hocico: 1.25, parche: 'motas' },
    { id: 'labrador',        nombre: 'Labrador',         tamano: 'grande',  fondo: '#d5f2e3', base: '#e9c27f', claro: '#f6e1b8', mancha: '#d4a75e', orejas: 'caida', hocico: 1.15 },
    { id: 'golden',          nombre: 'Golden retriever', tamano: 'grande',  fondo: '#ffe0cc', base: '#d9963f', claro: '#f2c886', mancha: '#b8762a', orejas: 'caida', hocico: 1.15, pelo: 'flequillo' },
    { id: 'pastor-aleman',   nombre: 'Pastor alemán',    tamano: 'grande',  fondo: '#e6defc', base: '#c98b45', claro: '#e9c08a', mancha: '#2d2420', orejas: 'erecta', hocico: 1.3, parche: 'mascara' },
    { id: 'husky',           nombre: 'Husky',            tamano: 'grande',  fondo: '#d6ecff', base: '#7d8794', claro: '#ffffff', mancha: '#5f6874', orejas: 'erecta', hocico: 1.15, parche: 'husky', ojos: '#5aa9e6' },
    { id: 'otra',            nombre: 'Otra raza',        tamano: null,      fondo: '#eceff4', base: '#d8cfc6', claro: '#f3eee8', mancha: '#b9ad9f', orejas: 'caida', hocico: 1, interrogacion: true }
  ];
  // Nombres populares y faltas de ortografía habituales → raza dibujada.
  var ALIAS = {
    'snauzer': 'schnauzer', 'schnauser': 'schnauzer', 'snautzer': 'schnauzer', 'shnauzer': 'schnauzer', 'schnauzer mini': 'schnauzer', 'schnauzer miniatura': 'schnauzer', 'schnauzer gigante': 'schnauzer',
    'salchicha': 'teckel', 'perro salchicha': 'teckel', 'dachshund': 'teckel',
    'yorki': 'yorkshire', 'yorkie': 'yorkshire', 'yorkshire terrier': 'yorkshire',
    'pomerano': 'pomerania', 'pomeranian': 'pomerania', 'lulu': 'pomerania', 'lulu de pomerania': 'pomerania',
    'shitzu': 'shih-tzu', 'shih tzu': 'shih-tzu', 'shitsu': 'shih-tzu',
    'bulldog': 'bulldog-frances', 'bulldog frances': 'bulldog-frances', 'frenchie': 'bulldog-frances',
    'jack russell terrier': 'jack-russell', 'jack rusell': 'jack-russell',
    'cocker spaniel': 'cocker', 'cocker ingles': 'cocker',
    'border': 'border-collie', 'border collie': 'border-collie',
    'perro de agua': 'perro-agua', 'perro de agua espanol': 'perro-agua',
    'setter': 'setter', 'setter ingles': 'setter',
    'labrador retriever': 'labrador', 'golden': 'golden', 'golden retriever': 'golden',
    'pastor aleman': 'pastor-aleman', 'pastor': 'pastor-aleman',
    'husky siberiano': 'husky', 'caniche toy': 'caniche', 'poodle': 'caniche',
    'bichon': 'bichon', 'bichon maltes': 'bichon', 'maltes': 'bichon',
    'podenco andaluz': 'podenco', 'podenco ibicenco': 'podenco', 'chihuahua': 'chihuahua', 'beagle': 'beagle',
    'mestiza': 'mestizo', 'cruce': 'mestizo', 'mezcla': 'mestizo', 'no lo se': 'mestizo'
  };
  function normaliza(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function buscar(texto) {
    var t = normaliza(texto);
    if (!t) return null;
    if (ALIAS[t]) return ALIAS[t];
    for (var i = 0; i < RAZAS.length; i++) if (RAZAS[i].id !== 'otra' && normaliza(RAZAS[i].nombre) === t) return RAZAS[i].id;
    return null;
  }
  var porId = {};
  RAZAS.forEach(function (r) { porId[r.id] = r; });

  function oreja(tipo, lado, r) {
    // lado: -1 izquierda, 1 derecha. Coordenadas en viewBox 0..100 con la cabeza centrada en 50,54.
    var x = 50 + lado * 27, s = TRAZO, c = r.base, m = r.mancha;
    function espejo(d) { return lado < 0 ? d : d.replace(/(-?\d+(\.\d+)?),/g, function (_, n) { return (100 - Number(n)) + ','; }); }
    switch (tipo) {
      case 'erecta':
        return '<path d="' + espejo('M22,46 L24,12 L44,32 Z') + '" fill="' + m + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>' +
               '<path d="' + espejo('M27,40 L28,20 L39,32 Z') + '" fill="' + r.claro + '"/>';
      case 'grande':
        return '<path d="' + espejo('M26,46 L10,10 L46,30 Z') + '" fill="' + c + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>' +
               '<path d="' + espejo('M27,40 L17,18 L40,31 Z') + '" fill="#f5c6b8"/>';
      case 'murcielago':
        return '<path d="' + espejo('M24,44 C10,30 12,10 22,10 C30,12 40,24 42,32 Z') + '" fill="' + c + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>' +
               '<path d="' + espejo('M26,38 C18,28 19,16 23,16 C28,18 35,26 37,31 Z') + '" fill="#e8a99a"/>';
      case 'doblada':
        return '<path d="' + espejo('M24,44 L24,18 L42,30 Z') + '" fill="' + m + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>' +
               '<path d="' + espejo('M24,20 L33,24 L28,30 Z') + '" fill="' + m + '" stroke="' + s + '" stroke-width="2" stroke-linejoin="round"/>';
      case 'caida':
        return '<path d="' + espejo('M28,34 C14,34 12,50 15,64 C17,72 26,70 29,62 C31,54 32,44 32,38 Z') + '" fill="' + m + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>';
      case 'larga':
        return '<path d="' + espejo('M29,32 C12,32 10,52 12,72 C13,82 26,82 28,72 C30,60 32,46 32,38 Z') + '" fill="' + m + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>';
      case 'rizo':
        var cx = lado < 0 ? 20 : 80;
        return [[cx, 50, 11], [cx, 62, 10], [cx + lado * -2, 39, 9]].map(function (q) {
          return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + m + '" stroke="' + s + '" stroke-width="2.2"/>';
        }).join('');
      case 'pequena':
        return '<path d="' + espejo('M28,42 L29,20 L43,32 Z') + '" fill="' + m + '" stroke="' + s + '" stroke-width="2.4" stroke-linejoin="round"/>' +
               '<path d="' + espejo('M31,37 L31,25 L39,32 Z') + '" fill="#f5c6b8"/>';
      case 'larga-rizo':
        var lx = lado < 0 ? 19 : 81;
        return oreja('larga', lado, r) + [[lx, 56, 6], [lx, 66, 6], [lx, 75, 5.5]].map(function (q) {
          return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + r.mancha + '" stroke="' + s + '" stroke-width="1.6"/>';
        }).join('');
      case 'mixta':
        return oreja(lado < 0 ? 'erecta' : 'caida', lado, r);
    }
    return '';
  }

  function cara(id, opts) {
    var r = porId[id] || porId.mestizo;
    opts = opts || {};
    var h = r.hocico, s = TRAZO;
    var out = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + r.nombre + '" class="' + (opts.clase || 'perro') + '">';
    if (!opts.sinFondo) out += '<circle cx="50" cy="50" r="50" fill="' + r.fondo + '"/>';
    // Orejas detrás
    var delante = ['caida', 'larga', 'rizo', 'larga-rizo'];
    if (delante.indexOf(r.orejas) < 0 && r.orejas !== 'mixta') out += oreja(r.orejas, -1, r) + oreja(r.orejas, 1, r);
    if (r.orejas === 'mixta') out += oreja('erecta', -1, r);
    if (r.pelo === 'melena') {
      for (var k = 0; k < 12; k++) {
        var ang = k / 12 * Math.PI * 2, mx = 50 + Math.cos(ang) * 30, my = 56 + Math.sin(ang) * 30;
        out += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="10" fill="' + r.mancha + '" stroke="' + s + '" stroke-width="2"/>';
      }
    }
    // Pelo de nube / rizo
    if (r.pelo === 'nube' || r.pelo === 'rizo') {
      [[30, 34, 13], [50, 26, 15], [70, 34, 13], [24, 52, 12], [76, 52, 12]].forEach(function (q) {
        out += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + r.mancha + '" stroke="' + s + '" stroke-width="2.2"/>';
      });
    }
    // Cabeza
    out += '<path d="M50,26 C68,26 78,38 78,54 C78,72 66,84 50,84 C34,84 22,72 22,54 C22,38 32,26 50,26 Z" fill="' + r.base + '" stroke="' + s + '" stroke-width="2.6"/>';
    if (r.pelo === 'nube' || r.pelo === 'rizo') {
      [[38, 30, 10], [50, 27, 11], [62, 30, 10]].forEach(function (q) {
        out += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + r.claro + '"/>';
      });
    }
    // Marcas
    if (r.parche === 'franja') out += '<path d="M50,30 C46,40 44,50 42,62 L58,62 C56,50 54,40 50,30 Z" fill="' + r.claro + '"/>';
    if (r.parche === 'mascara') out += '<path d="M50,44 C62,44 70,52 70,62 C70,74 62,82 50,82 C38,82 30,74 30,62 C30,52 38,44 50,44 Z" fill="' + r.mancha + '" opacity=".9"/>';
    if (r.parche === 'ojo') out += '<ellipse cx="38" cy="50" rx="10" ry="9" fill="' + r.mancha + '"/>';
    if (r.parche === 'pecho') out += '<path d="M40,80 C44,72 56,72 60,80 Z" fill="' + r.claro + '"/>';
    if (r.parche === 'antifaz') out += '<ellipse cx="38" cy="49" rx="10" ry="10" fill="' + r.mancha + '"/><ellipse cx="62" cy="49" rx="10" ry="10" fill="' + r.mancha + '"/><path d="M50,36 L47,58 L53,58 Z" fill="' + r.base + '"/>';
    if (r.parche === 'motas') [[34, 40], [62, 38], [70, 50], [30, 56], [42, 34], [66, 62]].forEach(function (q) { out += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.4" fill="' + r.mancha + '"/>'; });
    if (r.parche === 'motas') out += '<ellipse cx="62" cy="48" rx="9" ry="8" fill="' + r.mancha + '"/>';
    if (r.parche === 'husky') out += '<path d="M50,46 C64,40 74,52 74,62 C74,76 62,84 50,84 C38,84 26,76 26,62 C26,52 36,40 50,46 Z" fill="' + r.claro + '"/><ellipse cx="39" cy="42" rx="4" ry="2.6" fill="' + r.claro + '"/><ellipse cx="61" cy="42" rx="4" ry="2.6" fill="' + r.claro + '"/><path d="M50,30 L46,46 L54,46 Z" fill="' + r.claro + '"/>';
    if (r.pelo === 'flequillo-gris') out += '<path d="M30,40 C34,28 44,24 50,24 C56,24 66,28 70,40 C64,34 58,34 50,38 C42,34 36,34 30,40 Z" fill="#8a96a6" stroke="' + s + '" stroke-width="2"/>';
    if (r.pelo === 'flequillo') out += '<path d="M38,30 C44,36 48,34 50,28 C52,34 56,36 62,30" fill="none" stroke="' + r.mancha + '" stroke-width="3" stroke-linecap="round"/>';
    // Orejas delante
    if (delante.indexOf(r.orejas) >= 0) out += oreja(r.orejas, -1, r) + oreja(r.orejas, 1, r);
    if (r.orejas === 'mixta') out += oreja('caida', 1, r);
    // Hocico
    var hy = 64 + (h - 1) * 4, hrx = 14 + (h - 1) * 6, hry = 11 + (h - 1) * 6;
    out += '<ellipse cx="50" cy="' + hy + '" rx="' + hrx + '" ry="' + hry + '" fill="' + r.claro + '" stroke="' + s + '" stroke-width="2"/>';
    // Ojos
    if (r.ojos) out += '<circle cx="39" cy="50" r="4.6" fill="' + r.ojos + '" stroke="' + s + '" stroke-width="1.4"/><circle cx="61" cy="50" r="4.6" fill="' + r.ojos + '" stroke="' + s + '" stroke-width="1.4"/>' +
      '<circle cx="39" cy="50" r="2.2" fill="' + s + '"/><circle cx="61" cy="50" r="2.2" fill="' + s + '"/>';
    else out += '<circle cx="39" cy="50" r="4.2" fill="' + s + '"/><circle cx="61" cy="50" r="4.2" fill="' + s + '"/>';
    out +=
           '<circle cx="40.4" cy="48.6" r="1.4" fill="#fff"/><circle cx="62.4" cy="48.6" r="1.4" fill="#fff"/>';
    if (r.pelo === 'barba') out += '<path d="M34,62 C34,74 40,90 50,92 C60,90 66,74 66,62 C60,66 40,66 34,62 Z" fill="' + r.claro + '" stroke="' + s + '" stroke-width="2" stroke-linejoin="round"/>';
    // Nariz y boca
    var ny = hy - hry + 6;
    out += '<path d="M44,' + ny + ' C44,' + (ny - 3) + ' 56,' + (ny - 3) + ' 56,' + ny + ' C56,' + (ny + 4) + ' 52,' + (ny + 6) + ' 50,' + (ny + 6) + ' C48,' + (ny + 6) + ' 44,' + (ny + 4) + ' 44,' + ny + ' Z" fill="' + s + '"/>';
    out += '<path d="M50,' + (ny + 6) + ' L50,' + (ny + 10) + ' M43,' + (ny + 9) + ' C46,' + (ny + 13) + ' 50,' + (ny + 12) + ' 50,' + (ny + 10) + ' C50,' + (ny + 12) + ' 54,' + (ny + 13) + ' 57,' + (ny + 9) + '" fill="none" stroke="' + s + '" stroke-width="2" stroke-linecap="round"/>';
    if (opts.lengua) out += '<path d="M47,' + (ny + 11) + ' C47,' + (ny + 18) + ' 53,' + (ny + 18) + ' 53,' + (ny + 11) + ' Z" fill="#f07a8a" stroke="' + s + '" stroke-width="1.6"/>';
    if (r.pelo === 'barba') out += '<path d="M30,46 L36,40 L46,44 Z M70,46 L64,40 L54,44 Z" fill="' + r.claro + '" stroke="' + s + '" stroke-width="1.8" stroke-linejoin="round"/>';
    if (r.lazo) out += '<path d="M50,24 L40,17 L40,31 Z M50,24 L60,17 L60,31 Z" fill="#f07a9a" stroke="' + s + '" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="24" r="3.4" fill="#f07a9a" stroke="' + s + '" stroke-width="2"/>';
    if (r.interrogacion) out += '<text x="50" y="22" text-anchor="middle" font-size="18" font-weight="800" fill="' + s + '" font-family="system-ui,sans-serif">?</text>';
    return out + '</svg>';
  }

  // ---------- Iconos de línea (24x24, currentColor) ----------
  var P = {
    gota: '<path d="M12 3c3.5 4.2 6 7.6 6 10.6A6 6 0 0 1 6 13.6C6 10.6 8.5 7.2 12 3z"/>',
    diente: '<path d="M7 4c2 0 3 1 5 1s3-1 5-1c2.5 0 3.5 2.5 3 5-.6 3-1.6 4-2 7-.3 2.5-1 4-2.2 4-1.6 0-1.3-5-3.8-5s-2.2 5-3.8 5C6 20 5.3 18.5 5 16c-.4-3-1.4-4-2-7-.5-2.5.5-5 3-5z"/>',
    luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    puerta: '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21M3 21h18M15 12h.01"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    cuenco: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>',
    pelota: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/>',
    cama: '<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5h.01"/>',
    piso: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2 21h20M8 7h.01M12 7h.01M8 11h.01M12 11h.01M8 15h.01M12 15h.01"/>',
    casa: '<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5"/><path d="M1 20h3M20 20h3"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    personas: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5"/>',
    nino: '<circle cx="12" cy="6" r="3"/><path d="M8 21v-6l-2-3 3-2h6l3 2-2 3v6M10 21v-4h4v4"/>',
    perro: '<path d="M10 5H7L4 8l1 4h3M14 5h3l3 3-1 4h-3M8 12v4a4 4 0 0 0 8 0v-4M10 5a2 2 0 0 1 4 0v3h-4zM10.5 11h.01M13.5 11h.01M11 15h2"/>',
    gato: '<path d="M5 4l3 4h8l3-4v9a7 7 0 0 1-14 0zM9.5 12h.01M14.5 12h.01M11 15h2M3 14l3 .5M3 17l3-.5M21 14l-3 .5M21 17l-3-.5"/>',
    huella: '<circle cx="6" cy="10" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="10" r="2"/><path d="M8.5 17c0-3 1.6-5 3.5-5s3.5 2 3.5 5c0 2-1.7 3-3.5 3s-3.5-1-3.5-3z"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    candado: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    corazon: '<path d="M12 20s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.5-8 11-8 11z"/>',
    estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    ley: '<path d="M12 3v18M5 21h14M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>',
    flecha: '<path d="M15 5l-7 7 7 7"/>',
    chispa: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    correa: '<circle cx="6" cy="18" r="3"/><path d="M8.5 16.5C12 13 14 8 20 4M17 3l3 1-1 3"/>',
    vacuna: '<path d="M18 2l4 4M20 4l-9.5 9.5M14 5l5 5M8.5 11.5l4 4M3 21l4-4M11 9L5 15l4 4 6-6"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    regalo: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8C9 8 7 7 7 5s2-2 3-1 2 4 2 4zM12 8c3 0 5-1 5-3s-2-2-3-1-2 4-2 4z"/>'
  };
  function icono(nombre, clase) {
    return '<svg viewBox="0 0 24 24" class="' + (clase || 'ico') + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[nombre] || '') + '</svg>';
  }

  var api = { RAZAS: RAZAS, raza: function (id) { return porId[id]; }, buscar: buscar, cara: cara, icono: icono };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PERROS = api;
})(this);
