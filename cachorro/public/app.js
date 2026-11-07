/* Funnel: portada → 12 preguntas → preparando → resultado gratis → paywall → pago → upsell → gracias. */
(function () {
  'use strict';
  var P = window.PLANTILLAS;
  var app = document.getElementById('app');
  var CONF = { precio: 1999, precioUpsell: 999, demo: false, marca: 'Plan Cachorro', pixelId: '' };

  // ---------- Almacenamiento seguro ----------
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }

  var sid = lsGet('pc_sid');
  if (!sid) { sid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/-/g, ''); lsSet('pc_sid', sid); }

  var params = new URLSearchParams(location.search);
  var utm = lsGet('pc_utm') || {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'a', 'fbclid'].forEach(function (k) { if (params.get(k)) utm[k] = params.get(k).slice(0, 100); });
  lsSet('pc_utm', utm);

  var estado = lsGet('pc_estado') || { paso: 0, r: {} };
  function guardarEstado() { lsSet('pc_estado', estado); }

  // ---------- Utilidades ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function euros(c) { return (c / 100).toFixed(2).replace('.', ',') + ' €'; }
  function post(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); });
  }
  function evento(tipo, paso) { post('/api/evento', { tipo: tipo, sid: sid, paso: paso, utm: utm }).catch(function () {}); }
  function nombre() { return estado.r.nombre || 'tu cachorro'; }
  function progreso(frac) {
    var b = document.getElementById('progreso');
    b.hidden = frac == null;
    if (frac != null) document.getElementById('progreso-relleno').style.width = Math.round(frac * 100) + '%';
  }
  function pintar(html) { app.innerHTML = (CONF.demo ? '<div class="demo">Modo demo: los pagos se simulan.</div>' : '') + html; window.scrollTo(0, 0); var f = app.querySelector('h1,h2'); if (f) { f.tabIndex = -1; f.focus({ preventScroll: true }); } }

  // ---------- Meta Pixel (solo con consentimiento) ----------
  var pixelListo = false;
  function cargarPixel() {
    if (pixelListo || !CONF.pixelId) return;
    pixelListo = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', CONF.pixelId);
    window.fbq('track', 'PageView');
  }
  function pixel(ev, datos) { if (pixelListo && window.fbq) window.fbq('track', ev, datos || {}); }
  function gestionarCookies() {
    var c = lsGet('pc_cookies');
    if (c === 'si') return cargarPixel();
    if (c === 'no' || !CONF.pixelId) return;
    var caja = document.getElementById('cookies');
    caja.hidden = false;
    document.getElementById('cookies-si').onclick = function () { lsSet('pc_cookies', 'si'); caja.hidden = true; cargarPixel(); };
    document.getElementById('cookies-no').onclick = function () { lsSet('pc_cookies', 'no'); caja.hidden = true; };
  }

  // ---------- Portada (adaptada al ángulo del anuncio) ----------
  var ANGULOS = {
    pis:       { t: '¿Tu cachorro sigue haciendo pis en el salón?', s: 'Un plan día a día para tu casa y su edad.' },
    noches:    { t: 'Si tu cachorro llora toda la noche, no es culpa suya', s: 'Una rutina de sueño para que dormáis los dos.' },
    mordiscos: { t: 'Manos, sofá, cables… ¿te suena?', s: 'Qué hacer (y qué no) cuando muerde.' },
    solo:      { t: 'Trabajas fuera y tu cachorro llora cuando te vas', s: 'Un plan para que aprenda a estar solo.' },
    rutina:    { t: '¿Cuánto debe dormir un cachorro de 10 semanas?', s: 'Su horario ideal de siestas, comidas y paseos.' }
  };
  function portada() {
    progreso(null);
    var a = ANGULOS[utm.a] || { t: 'El plan de los primeros 2 meses para tu cachorro', s: 'Hecho para su raza, su edad y tu casa.' };
    pintar(
      '<section class="hero">' +
      '<h1>' + esc(a.t) + '</h1>' +
      '<p class="suave">' + esc(a.s) + ' Responde 12 preguntas rápidas y te damos gratis la rutina de mañana para tu cachorro.</p>' +
      '<ul><li>2 minutos, una pregunta por pantalla</li><li>Rutina de mañana y checklist legal, gratis</li><li>Educación en positivo, sin castigos</li></ul>' +
      '<button class="btn" id="empezar">Haz el test gratis</button>' +
      '</section>'
    );
    document.getElementById('empezar').onclick = function () { evento('inicio_form'); estado.paso = 1; guardarEstado(); render(); };
  }

  // ---------- Preguntas ----------
  function opciones(lista, multiple) { return { tipo: multiple ? 'multi' : 'opcion', lista: lista }; }
  var PREGUNTAS = [
    { id: 'nombre', t: '¿Cómo se llama tu cachorro?', campo: 'text', ph: 'Por ejemplo, Luna', req: true },
    { id: 'raza', t: function () { return '¿De qué raza es ' + nombre() + '?'; }, campo: 'text', ph: 'Mestizo, labrador, caniche…', ayuda: 'Si no lo sabes, escribe "mestizo".', req: true },
    { id: 'tamano', t: '¿Qué tamaño tendrá de adulto?', o: opciones([['pequeno', '🐾', 'Pequeño', 'Menos de 10 kg'], ['mediano', '🐕', 'Mediano', 'De 10 a 25 kg'], ['grande', '🐕‍🦺', 'Grande', 'Más de 25 kg'], ['mediano', '❓', 'No lo sé', 'Usaremos tamaño mediano']]) },
    { id: 'edadSemanas', t: function () { return '¿Cuántas semanas tiene ' + nombre() + '?'; }, o: opciones([[8, '', '8–9 semanas'], [10, '', '10–11 semanas'], [12, '', '12–13 semanas'], [14, '', '14–15 semanas'], [17, '', '16–19 semanas'], [22, '', '20 semanas o más']]) },
    { id: 'vivienda', t: '¿Dónde vivís?', o: opciones([['piso', '🏢', 'Piso', 'Sin jardín'], ['jardin', '🏡', 'Casa con jardín', 'O patio propio']]) },
    { id: 'horasSolo', t: function () { return '¿Cuántas horas al día se queda ' + nombre() + ' solo?'; }, o: opciones([[0, '', 'Casi nunca'], [2, '', '1–2 horas'], [4, '', '3–4 horas'], [6, '', '5–6 horas'], [8, '', '7 horas o más']]) },
    { id: 'problema', t: '¿Cuál es tu mayor problema ahora mismo?', o: opciones([['pis', '💧', 'Pis y caca en casa'], ['mordiscos', '🦷', 'Mordiscos'], ['noches', '🌙', 'Las noches'], ['solo', '🚪', 'Quedarse solo']]) },
    { id: 'convivientes', t: '¿Quién más vive en casa?', ayuda: 'Marca todas las que correspondan.', o: opciones([['solo', '🙋', 'Solo yo'], ['adultos', '👥', 'Otros adultos'], ['ninos', '🧒', 'Niños'], ['perros', '🐶', 'Otro perro'], ['gatos', '🐱', 'Gatos']], true) },
    { id: 'primerPerro', t: '¿Es tu primer perro?', o: opciones([['si', '', 'Sí, es el primero'], ['no', '', 'No, ya he tenido perro']]) },
    { id: 'comunidad', t: '¿En qué comunidad autónoma vivís?', ayuda: 'Para tu checklist legal.', campo: 'select' },
    { id: 'tiene', t: function () { return '¿Qué tiene ya ' + nombre() + '?'; }, ayuda: 'Marca lo que ya esté hecho.', o: opciones([['chip', '', 'Microchip'], ['registro', '', 'Inscripción en el registro'], ['vacunas', '', 'Primeras vacunas'], ['veterinario', '', 'Primera visita al veterinario'], ['seguro', '', 'Seguro de responsabilidad civil'], ['nada', '', 'Nada todavía']], true) },
    { id: 'email', t: function () { return '¿Dónde te enviamos el plan de ' + nombre() + '?'; }, campo: 'email' }
  ];
  var TOTAL = PREGUNTAS.length;

  function pregunta(i) {
    var q = PREGUNTAS[i - 1];
    progreso((i - 1) / TOTAL);
    var titulo = typeof q.t === 'function' ? q.t() : q.t;
    var val = estado.r[q.id];
    var html = '<p class="suave peq">Pregunta ' + i + ' de ' + TOTAL + '</p><h2>' + esc(titulo) + '</h2>' + (q.ayuda ? '<p class="suave">' + esc(q.ayuda) + '</p>' : '');

    if (q.campo === 'text') {
      html += '<input type="text" id="campo" maxlength="40" autocomplete="off" placeholder="' + esc(q.ph) + '" value="' + esc(val || '') + '">' +
        '<button class="btn" id="sig">Continuar</button>';
    } else if (q.campo === 'select') {
      html += '<select id="campo"><option value="">Elige tu comunidad</option>' + P.COMUNIDADES.map(function (c) { return '<option' + (c === val ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
        '<button class="btn" id="sig">Continuar</button>';
    } else if (q.campo === 'email') {
      var c = estado.consent || {};
      html += '<input type="email" id="campo" autocomplete="email" inputmode="email" placeholder="tu@email.com" value="' + esc(estado.email || '') + '">' +
        '<label class="check"><input type="checkbox" id="c-priv"' + (c.privacidad ? ' checked' : '') + '> <span>He leído la <a href="/privacidad" target="_blank">política de privacidad</a> y acepto que tratéis mis datos para preparar mi resultado.</span></label>' +
        '<label class="check"><input type="checkbox" id="c-com"' + (c.comerciales ? ' checked' : '') + '> <span>Quiero recibir consejos y ofertas de ' + esc(CONF.marca) + ' por email (opcional).</span></label>' +
        '<label class="check"><input type="checkbox" id="c-seg"' + (c.seguros ? ' checked' : '') + '> <span>Acepto que me contactéis con ofertas de seguros para mi perro (opcional).</span></label>' +
        '<p class="error" id="err"></p><button class="btn" id="sig">Ver el resultado de ' + esc(nombre()) + '</button>';
    } else {
      var multi = q.o.tipo === 'multi';
      var sel = multi ? (val || []) : [val];
      html += '<div class="opciones">' + q.o.lista.map(function (o, k) {
        var marcado = estado.r[q.id + '_idx'] === k || (multi && sel.indexOf(o[0]) >= 0);
        return '<button class="opcion" data-k="' + k + '" aria-pressed="' + (marcado ? 'true' : 'false') + '">' +
          (o[1] ? '<span class="ico" aria-hidden="true">' + o[1] + '</span>' : '') +
          '<span>' + esc(o[2]) + (o[3] ? '<small>' + esc(o[3]) + '</small>' : '') + '</span></button>';
      }).join('') + '</div>' + (multi ? '<button class="btn" id="sig"' + (sel.length ? '' : ' disabled') + '>Continuar</button>' : '');
    }
    if (i > 1) html += '<button class="btn sec" id="atras">Atrás</button>';
    pintar(html);

    var atras = document.getElementById('atras');
    if (atras) atras.onclick = function () { estado.paso = i - 1; guardarEstado(); render(); };
    var campo = document.getElementById('campo');
    var sig = document.getElementById('sig');

    function avanzar() { evento('paso', q.id); estado.paso = i + 1; guardarEstado(); render(); }

    if (q.o) {
      var botones = app.querySelectorAll('.opcion');
      botones.forEach(function (b) {
        b.onclick = function () {
          var o = q.o.lista[Number(b.dataset.k)];
          if (q.o.tipo === 'multi') {
            var arr = (estado.r[q.id] || []).slice();
            var exclusivos = ['solo', 'nada'];
            var pos = arr.indexOf(o[0]);
            if (pos >= 0) arr.splice(pos, 1);
            else if (exclusivos.indexOf(o[0]) >= 0) arr = [o[0]];
            else { arr = arr.filter(function (x) { return exclusivos.indexOf(x) < 0; }); arr.push(o[0]); }
            estado.r[q.id] = arr;
            botones.forEach(function (x) { x.setAttribute('aria-pressed', arr.indexOf(q.o.lista[Number(x.dataset.k)][0]) >= 0 ? 'true' : 'false'); });
            sig.disabled = !arr.length;
            guardarEstado();
          } else {
            estado.r[q.id] = o[0];
            estado.r[q.id + '_idx'] = Number(b.dataset.k);
            if (q.id === 'tamano') estado.r.tamanoTexto = o[2];
            if (q.id === 'edadSemanas') estado.r.edadTexto = o[2];
            if (q.id === 'horasSolo') estado.r.horasTexto = o[2];
            setTimeout(avanzar, 150);
          }
        };
      });
      if (sig) sig.onclick = avanzar;
      return;
    }

    if (campo && q.campo !== 'email') {
      campo.focus();
      var listo = function () { return campo.value.trim().length > 0; };
      sig.disabled = !listo();
      campo.oninput = campo.onchange = function () { sig.disabled = !listo(); };
      campo.onkeydown = function (e) { if (e.key === 'Enter' && listo()) sig.click(); };
      sig.onclick = function () { estado.r[q.id] = campo.value.trim(); avanzar(); };
      return;
    }

    // Email + consentimientos
    sig.onclick = function () {
      var email = campo.value.trim();
      var consent = { privacidad: document.getElementById('c-priv').checked, comerciales: document.getElementById('c-com').checked, seguros: document.getElementById('c-seg').checked };
      var err = document.getElementById('err');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Revisa el email.'; return; }
      if (!consent.privacidad) { err.textContent = 'Necesitamos que aceptes la política de privacidad para enviarte el resultado.'; return; }
      sig.disabled = true;
      estado.email = email; estado.consent = consent;
      var r = estado.r;
      post('/api/lead', { sid: sid, email: email, consentimientos: consent, utm: utm, respuestas: { nombre: r.nombre, raza: r.raza, tamano: r.tamano, edadSemanas: r.edadSemanas, vivienda: r.vivienda, horasSolo: r.horasSolo, problema: r.problema, convivientes: r.convivientes, primerPerro: r.primerPerro, comunidad: r.comunidad, tiene: r.tiene } })
        .then(function () { pixel('Lead'); estado.paso = 'preparando'; guardarEstado(); render(); })
        .catch(function () { sig.disabled = false; err.textContent = 'No hemos podido guardar tus respuestas. Inténtalo de nuevo.'; });
    };
  }

  // ---------- Preparando ----------
  function preparando() {
    progreso(1);
    var r = estado.r;
    var perfil = [r.nombre, r.edadTexto, r.vivienda === 'jardin' ? 'casa con jardín' : 'piso', r.horasSolo ? r.horasTexto + ' solo' : 'casi nunca solo'].join(' · ');
    pintar('<div class="cargando"><h2>Preparando el plan de ' + esc(nombre()) + '</h2><p class="chip">' + esc(perfil) + '</p>' +
      '<div class="barra-carga"><div></div></div>' +
      '<p style="animation-delay:.4s">Ajustando la rutina a sus ' + esc(r.edadSemanas) + '+ semanas…</p>' +
      '<p style="animation-delay:1.3s">Preparando el plan de ' + esc(P.PROBLEMAS[r.problema] || '').toLowerCase() + '…</p>' +
      '<p style="animation-delay:2.2s">Revisando el checklist legal de ' + esc(r.comunidad) + '…</p></div>');
    setTimeout(function () { estado.paso = 'resultado'; guardarEstado(); render(); }, 3400);
  }

  // ---------- Resultado gratis + paywall ----------
  function perfilPlan() { var r = estado.r; return { nombre: r.nombre, edadSemanas: Number(r.edadSemanas), tamano: r.tamano || 'mediano', vivienda: r.vivienda, horasSolo: Number(r.horasSolo) }; }

  function resultado() {
    progreso(null);
    evento('resultado_visto');
    var r = estado.r;
    var rut = P.rutinaDiaria(perfilPlan());
    var tiene = r.tiene || [];
    var legalItems = P.LEGAL.items.filter(function (x) { return x.id !== 'ppp'; });
    var prot = P.PROTOCOLOS[r.problema];
    var faltaSeguro = tiene.indexOf('seguro') < 0;

    var html =
      '<h1>La rutina de mañana para ' + esc(nombre()) + '</h1>' +
      '<p class="suave">Cachorro ' + esc(rut.tamano) + ' de ' + esc(rut.tramo) + ', ' + (r.vivienda === 'jardin' ? 'casa con jardín' : 'piso') + '. Pruébala mañana tal cual.</p>' +
      '<div class="tarjeta"><ul class="rutina">' + rut.bloques.map(function (b) { return '<li><b>' + esc(b[0]) + '</b><span>' + esc(b[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="peq suave" style="margin-top:10px">' + esc(rut.nota) + '</p></div>' +

      '<h3>¿' + esc(nombre()) + ' está en regla?</h3>' +
      '<div class="tarjeta"><ul class="legal">' + legalItems.map(function (x) {
        var hecho = tiene.indexOf(x.id) >= 0;
        return '<li><span class="' + (hecho ? 'ok">✓ ' : 'pend">○ ') + '</span>' + esc(x.texto) + '<br><span class="peq suave">' + esc(x.estado) + '</span></li>';
      }).join('') + '</ul><p class="peq suave">' + esc(P.LEGAL.aviso) + '</p>' +
      (faltaSeguro ? '<button class="btn sec" id="seguros">Quiero comparar seguros para ' + esc(nombre()) + '</button>' : '') + '</div>' +

      '<h3>El plan completo de 8 semanas</h3>' +
      '<div class="bloqueado"><ul>' +
      '<li>' + esc(prot.titulo) + ': ' + esc((prot.piso || prot.si)[0]) + '</li>' +
      '<li>Semana 1 de socialización: ' + esc(P.SOCIALIZACION[0].items.join(', ')) + '</li>' +
      '<li>Rutina de la semana 2, ajustada a su edad</li>' +
      '<li>Calendario de salud para preguntar a tu veterinario</li></ul>' +
      '<div class="candado"><span>🔒 Incluido en el plan</span></div></div>' +
      paywallHtml();
    pintar(html);
    evento('paywall_visto');

    var bs = document.getElementById('seguros');
    if (bs) bs.onclick = function () { evento('clic_seguros'); bs.outerHTML = '<p class="peq ok">Apuntado. Te avisaremos cuando tengamos la comparativa de seguros.</p>'; };
    activarPaywall();
  }

  function paywallHtml() {
    return '<div class="tarjeta" id="paywall">' +
      '<h2>Plan de 8 semanas para ' + esc(nombre()) + '</h2>' +
      '<ul class="incluye">' +
      '<li>Rutina diaria por edad que se actualiza cada semana</li>' +
      '<li>Plan de ' + esc((P.PROBLEMAS[estado.r.problema] || 'su mayor problema').toLowerCase()) + ' paso a paso</li>' +
      '<li>Protocolos para pis, mordiscos, noches y quedarse solo</li>' +
      '<li>Checklist de socialización semana a semana</li>' +
      '<li>Calendario de salud y checklist legal de ' + esc(estado.r.comunidad || 'tu comunidad') + '</li>' +
      '<li>Un email cada día con la tarea del día, durante 8 semanas</li>' +
      '<li>Página privada y PDF</li></ul>' +
      '<p class="precio">' + euros(CONF.precio) + ' <small>pago único, IVA incluido</small></p>' +
      '<div class="garantia">Garantía de 14 días: si no te sirve, te devolvemos el 100%, sin preguntas.</div>' +
      '<label class="check"><input type="checkbox" id="desist"> <span>Quiero recibir el plan ya. Acepto que, al empezar la entrega del contenido digital, pierdo el derecho legal de desistimiento (la garantía de 14 días sigue vigente). <a href="/condiciones" target="_blank">Condiciones</a>.</span></label>' +
      '<p class="error" id="err-pago"></p>' +
      '<button class="btn" id="pagar" disabled>Quiero el plan de ' + esc(nombre()) + '</button>' +
      '<p class="peq suave" style="text-align:center;margin-top:8px">Tarjeta, Apple Pay o Google Pay. Pago seguro con Stripe.</p>' +
      '<p class="peq suave">El plan da rutinas y educación. No sustituye al veterinario ni al curso oficial de tenencia responsable.</p></div>';
  }

  function activarPaywall() {
    var chk = document.getElementById('desist'), btn = document.getElementById('pagar'), err = document.getElementById('err-pago');
    chk.onchange = function () { btn.disabled = !chk.checked; };
    btn.onclick = function () {
      btn.disabled = true; btn.textContent = 'Abriendo el pago…';
      pixel('InitiateCheckout', { value: CONF.precio / 100, currency: 'EUR' });
      post('/api/checkout', { sid: sid, desistimiento: true })
        .then(function (j) { location.href = j.url; })
        .catch(function (e) { err.textContent = (e && e.error) || 'No hemos podido abrir el pago.'; btn.disabled = false; btn.textContent = 'Quiero el plan de ' + nombre(); });
    };
  }

  // ---------- Vuelta del pago ----------
  function trasPago(sessionId) {
    progreso(null);
    pintar('<div class="cargando"><h2>Confirmando tu pago…</h2></div>');
    fetch('/api/pedido?session_id=' + encodeURIComponent(sessionId)).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.pagado) { pintar('<h2>No vemos el pago todavía</h2><p>Si te han cobrado, escríbenos a ' + esc(CONF.emailContacto) + ' y lo resolvemos hoy.</p>'); return; }
      var marcado = lsGet('pc_compra_px');
      if (marcado !== sessionId) { pixel('Purchase', { value: j.importe / 100, currency: 'EUR' }); lsSet('pc_compra_px', sessionId); }
      if (j.upsell) upsell(sessionId); else gracias(false);
    }).catch(function () { pintar('<h2>No hemos podido confirmar el pago</h2><p>Recarga la página en unos segundos.</p>'); });
  }

  function upsell(sessionId) {
    evento('upsell_visto');
    var problema = estado.r.problema;
    var packs = [
      { id: 'separacion', t: 'Ansiedad por separación', d: 'Protocolo de 3 semanas para que ' + nombre() + ' aprenda a quedarse en casa con calma, con registro de progresos.' },
      { id: 'correa', t: 'Paseos sin tirones', d: 'Plan de 3 semanas para que aprenda a caminar con la correa floja desde el principio.' }
    ];
    if (problema !== 'solo') packs.reverse();
    pintar('<p class="chip">✓ Pago confirmado</p>' +
      '<h1>Una cosa más antes de empezar</h1>' +
      '<p>Añade un pack en profundidad por solo <b>' + euros(CONF.precioUpsell) + '</b>. Se cobra en la misma tarjeta, sin volver a meter datos.</p>' +
      packs.map(function (p) { return '<div class="tarjeta"><h3 style="margin-top:0">' + esc(p.t) + '</h3><p class="suave">' + esc(p.d) + '</p><button class="btn" data-pack="' + p.id + '">Añadir por ' + euros(CONF.precioUpsell) + '</button></div>'; }).join('') +
      '<p class="error" id="err-up"></p><button class="btn sec" id="no-up">No, gracias</button>');
    app.querySelectorAll('[data-pack]').forEach(function (b) {
      b.onclick = function () {
        app.querySelectorAll('[data-pack]').forEach(function (x) { x.disabled = true; });
        b.textContent = 'Añadiendo…';
        post('/api/upsell', { session_id: sessionId, pack: b.dataset.pack })
          .then(function () { pixel('Purchase', { value: CONF.precioUpsell / 100, currency: 'EUR', content_name: 'upsell' }); gracias(true); })
          .catch(function (e) { document.getElementById('err-up').textContent = (e && e.error) || 'No se ha podido añadir.'; app.querySelectorAll('[data-pack]').forEach(function (x) { x.disabled = false; }); b.textContent = 'Reintentar'; });
      };
    });
    document.getElementById('no-up').onclick = function () { evento('upsell_rechazado'); gracias(false); };
  }

  function gracias(conPack) {
    lsSet('pc_estado', null);
    pintar('<p class="chip">✓ Todo listo</p><h1>Ya está: empieza el plan de ' + esc(nombre()) + '</h1>' +
      '<p>Estamos preparando su plan personalizado. Lo recibirás en <b>' + esc(estado.email || 'tu email') + '</b> en menos de 24 horas, con el enlace a su página privada y el PDF.</p>' +
      (conPack ? '<p>También te llegará el pack que has añadido.</p>' : '') +
      '<p>Mañana empiezan los emails diarios con la tarea de cada día.</p>' +
      '<div class="garantia">Recuerda: tienes 14 días de garantía. Si no te sirve, responde a cualquier email y te devolvemos el dinero.</div>' +
      '<p class="suave">Mientras tanto, prueba mañana la rutina que te hemos dado gratis.</p>');
  }

  // ---------- Router ----------
  function render() {
    if (estado.paso === 0) return portada();
    if (typeof estado.paso === 'number' && estado.paso <= TOTAL) return pregunta(estado.paso);
    if (estado.paso === 'preparando') return preparando();
    if (estado.paso === 'resultado' || estado.paso > TOTAL) return resultado();
    portada();
  }

  fetch('/api/config?sid=' + sid).then(function (r) { return r.json(); }).then(function (c) { CONF = c; }).catch(function () {}).then(function () {
    document.getElementById('marca').textContent = CONF.marca;
    document.getElementById('pie-contacto').textContent = CONF.emailContacto || '';
    document.title = CONF.marca + ' · El plan para tu cachorro';
    gestionarCookies();
    if (params.get('pago') === 'ok' && params.get('session_id')) return trasPago(params.get('session_id'));
    if (params.get('pago') === 'cancelado') { evento('checkout_cancelado'); estado.paso = 'resultado'; }
    if (estado.paso === 0) evento('visita');
    render();
  });
})();
