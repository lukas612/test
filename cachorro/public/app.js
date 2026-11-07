/* Funnel: portada → preguntas → preparando → resultado gratis → paywall → pago → upsell → gracias. */
(function () {
  'use strict';
  var P = window.PLANTILLAS;
  var D = window.PERROS;
  var I = D.icono;
  var app = document.getElementById('app');
  var barra = document.getElementById('barra');
  var CONF = { precio: 1999, precioUpsell: 999, demo: false, marca: 'Plan Cachorro', pixelId: '', emailContacto: '' };

  // ---------- Almacenamiento seguro ----------
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }

  var sid = lsGet('pc_sid');
  if (!sid) { sid = (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/[-.]/g, ''); lsSet('pc_sid', sid); }

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
  function razaId() { return estado.r.razaId || 'mestizo'; }
  function burbuja(icono, color, extra) { return '<span class="burbuja b-' + color + '"' + (extra || '') + '>' + I(icono) + '</span>'; }

  function pintarBarra(modo) {
    if (modo && modo.progreso != null) {
      barra.innerHTML = '<button class="atras" id="atras" aria-label="Atrás">' + I('flecha') + '</button>' +
        '<div class="progreso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(modo.progreso * 100) + '"><div id="progreso-relleno"></div></div>' +
        (estado.r.razaId ? '<span class="mini-perro">' + D.cara(estado.r.razaId) + '</span>' : '');
      requestAnimationFrame(function () { var b = document.getElementById('progreso-relleno'); if (b) b.style.width = Math.max(4, Math.round(modo.progreso * 100)) + '%'; });
      document.getElementById('atras').onclick = modo.atras;
    } else {
      barra.innerHTML = '<span class="marca"><span class="logo">' + I('huella') + '</span>' + esc(CONF.marca) + '</span>';
    }
  }
  function pintar(html) {
    app.innerHTML = (CONF.demo ? '<div class="demo">Modo demo: los pagos se simulan.</div>' : '') + '<div class="entra">' + html + '</div>';
    window.scrollTo(0, 0);
    var f = app.querySelector('h1,h2');
    if (f) { f.tabIndex = -1; f.focus({ preventScroll: true }); }
  }

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
    pis:       { t: '¿Tu cachorro sigue haciendo pis en el salón?', s: 'Un plan día a día para tu casa y su edad.', n: ['gota', 'sky', '07:00', 'Pis nada más despertar'] },
    noches:    { t: 'Si tu cachorro llora toda la noche, no es culpa suya', s: 'Una rutina de sueño para que dormáis los dos.', n: ['luna', 'lilac', '22:30', 'Última salida, sin juego'] },
    mordiscos: { t: 'Manos, sofá, cables… ¿te suena?', s: 'Qué hacer (y qué no) cuando muerde.', n: ['diente', 'peach', 'Mordiscos', 'Retira la mano y ofrece el mordedor'] },
    solo:      { t: 'Trabajas fuera y tu cachorro llora cuando te vas', s: 'Un plan para que aprenda a quedarse en casa con calma.', n: ['puerta', 'peach', '09:00', 'Te vas sin despedidas largas'] },
    rutina:    { t: '¿Cuánto debe dormir un cachorro de 10 semanas?', s: 'Su horario de siestas, comidas y paseos, según su edad.', n: ['cama', 'lilac', '18–20 h', 'de sueño al día a las 10 semanas'] }
  };
  function portada() {
    pintarBarra(null);
    var a = ANGULOS[utm.a] || { t: 'El plan de los primeros 2 meses para tu cachorro', s: 'Hecho para su raza, su edad y tu casa.', n: ['gota', 'sky', '07:00', 'Pis nada más despertar'] };
    pintar(
      '<div class="pila-g">' +
      '<section class="pila">' +
        '<span class="eyebrow">' + I('huella') + 'Para cachorros de 8 a 26 semanas</span>' +
        '<h1>' + esc(a.t) + '</h1>' +
        '<p class="suave">' + esc(a.s) + ' Responde unas preguntas rápidas y te damos gratis la rutina de mañana para tu cachorro.</p>' +
        '<div class="escena" aria-hidden="true">' +
          '<span class="p p1">' + D.cara('labrador', { lengua: true }) + '</span>' +
          '<span class="p p2">' + D.cara('chihuahua') + '</span>' +
          '<span class="p p3">' + D.cara('bichon') + '</span>' +
          '<span class="p p4">' + D.cara('beagle') + '</span>' +
          '<span class="p p5">' + D.cara('pastor-aleman') + '</span>' +
          '<div class="nota-flot n1">' + burbuja(a.n[0], a.n[1]) + '<span><b>' + esc(a.n[2]) + '</b>' + esc(a.n[3]) + '</span></div>' +
          '<div class="nota-flot n2">' + burbuja('check', 'mint') + '<span><b>Luna · 10 sem.</b>Plan listo</span></div>' +
        '</div>' +
        '<button class="btn" id="empezar">Haz el test gratis ' + I('huella') + '</button>' +
        '<div class="micro"><span>' + I('check') + 'Gratis</span><span>' + I('check') + '2 minutos</span><span>' + I('check') + 'Sin tarjeta</span></div>' +
      '</section>' +

      '<div class="ventajas">' +
        '<div class="ventaja">' + burbuja('corazon', 'peach') + 'Educación en positivo, sin castigos</div>' +
        '<div class="ventaja">' + burbuja('perro', 'sky') + 'Para su raza, edad y casa</div>' +
        '<div class="ventaja">' + burbuja('ley', 'butter') + 'Al día con la ley española</div>' +
      '</div>' +

      '<section class="seccion"><span class="etiqueta">Cómo funciona</span><h2>De agobio a rutina en 3 pasos</h2>' +
        '<ol class="pasos">' +
          '<li><div><b>Nos cuentas cómo es</b><span>Raza, edad, tu casa y lo que más te preocupa ahora.</span></div></li>' +
          '<li><div><b>Recibes su rutina de mañana, gratis</b><span>Con horas concretas para comer, dormir, jugar y salir a hacer pis.</span></div></li>' +
          '<li><div><b>Si quieres, el plan de 8 semanas</b><span>Semana a semana y con un email cada día con la tarea del día.</span></div></li>' +
        '</ol></section>' +

      '<section class="seccion"><span class="etiqueta">El plan completo</span><h2>Todo lo que necesitas los primeros 2 meses</h2>' +
        '<div class="incluye-grid">' +
          '<div class="inc">' + burbuja('gota', 'sky') + '<b>Adiós al pis en casa</b>Pasos día a día para piso o jardín.</div>' +
          '<div class="inc">' + burbuja('diente', 'peach') + '<b>Mordiscos</b>Qué hacer y qué no cuando muerde.</div>' +
          '<div class="inc">' + burbuja('luna', 'lilac') + '<b>Noches tranquilas</b>Para que dormáis los dos.</div>' +
          '<div class="inc">' + burbuja('puerta', 'butter') + '<b>Quedarse solo</b>Poco a poco y sin llantos.</div>' +
          '<div class="inc">' + burbuja('personas', 'mint') + '<b>Socialización</b>Checklist de experiencias por semana.</div>' +
          '<div class="inc">' + burbuja('calendario', 'sky') + '<b>Salud y papeleo</b>Recordatorios y checklist legal de tu comunidad.</div>' +
        '</div></section>' +

      '<section class="seccion faq"><span class="etiqueta">Preguntas</span>' +
        '<details><summary>¿Sustituye al veterinario o a un educador?</summary><p>No. El plan te da rutinas y educación en positivo. La salud, las vacunas y la comida las decide tu veterinario.</p></details>' +
        '<details><summary>¿Y si no me sirve?</summary><p>Tienes 14 días de garantía: te devolvemos el 100% sin preguntas.</p></details>' +
        '<details><summary>¿Es una suscripción?</summary><p>No. El test es gratis y el plan completo es un pago único.</p></details>' +
      '</section>' +

      '<button class="btn" id="empezar2">Empezar el test gratis</button>' +
      '</div>'
    );
    function empezar() { evento('inicio_form'); estado.paso = 1; guardarEstado(); render(); }
    document.getElementById('empezar').onclick = empezar;
    document.getElementById('empezar2').onclick = empezar;
  }

  // ---------- Preguntas ----------
  var PREGUNTAS = [
    { id: 'nombre', t: '¿Cómo se llama tu cachorro?', s: 'Así personalizamos todo su plan.', tipo: 'nombre' },
    { id: 'raza', t: function () { return '¿De qué raza es ' + nombre() + '?'; }, s: 'Si es mestizo o no la ves, elige esa opción.', tipo: 'raza' },
    { id: 'tamano', cuando: function () { var r = D.raza(estado.r.razaId); return !r || !r.tamano; }, t: '¿Qué tamaño tendrá de adulto?', s: 'Más o menos. Si no lo sabes, elige mediano.', tipo: 'opcion',
      lista: [['pequeno', { tam: ['chihuahua', .62] }, 'Pequeño', 'Menos de 10 kg'], ['mediano', { tam: ['beagle', .82] }, 'Mediano', 'De 10 a 25 kg'], ['grande', { tam: ['labrador', 1] }, 'Grande', 'Más de 25 kg']] },
    { id: 'edadSemanas', t: function () { return '¿Cuántas semanas tiene ' + nombre() + '?'; }, tipo: 'opcion', dos: true,
      lista: [[8, ['huella', 'butter'], '8–9 semanas'], [10, ['huella', 'peach'], '10–11 semanas'], [12, ['huella', 'mint'], '12–13 semanas'], [14, ['huella', 'sky'], '14–15 semanas'], [17, ['huella', 'lilac'], '16–19 semanas'], [22, ['huella', 'butter'], '20 o más']] },
    { id: 'vivienda', t: '¿Dónde vivís?', tipo: 'opcion', dos: true,
      lista: [['piso', ['piso', 'sky'], 'Piso', 'Sin jardín'], ['jardin', ['casa', 'mint'], 'Casa con jardín', 'O patio propio']] },
    { id: 'horasSolo', t: function () { return '¿Cuántas horas al día se queda ' + nombre() + ' sin nadie en casa?'; }, tipo: 'opcion',
      lista: [[0, ['corazon', 'mint'], 'Casi nunca', 'Siempre hay alguien'], [2, ['reloj', 'sky'], '1–2 horas'], [4, ['reloj', 'butter'], '3–4 horas'], [6, ['reloj', 'peach'], '5–6 horas'], [8, ['reloj', 'lilac'], '7 horas o más']] },
    { id: 'problema', t: '¿Qué es lo que más te preocupa ahora?', s: 'Empezaremos el plan por aquí.', tipo: 'opcion', dos: true,
      lista: [['pis', ['gota', 'sky'], 'Pis y caca en casa'], ['mordiscos', ['diente', 'peach'], 'Mordiscos'], ['noches', ['luna', 'lilac'], 'Las noches'], ['solo', ['puerta', 'butter'], 'Quedarse solo']] },
    { id: 'convivientes', t: '¿Quién más vive en casa?', s: 'Marca todas las que correspondan.', tipo: 'multi',
      lista: [['solo', ['persona', 'sky'], 'Solo yo'], ['adultos', ['personas', 'mint'], 'Otros adultos'], ['ninos', ['nino', 'butter'], 'Niños'], ['perros', ['perro', 'peach'], 'Otro perro'], ['gatos', ['gato', 'lilac'], 'Gatos']], exclusivos: ['solo'] },
    { id: 'primerPerro', t: '¿Es tu primer perro?', tipo: 'opcion', dos: true,
      lista: [['si', ['estrella', 'butter'], 'Sí, es el primero'], ['no', ['corazon', 'peach'], 'Ya he tenido perro']] },
    { id: 'comunidad', t: '¿En qué comunidad autónoma vivís?', s: 'Para preparar tu checklist legal.', tipo: 'select' },
    { id: 'tiene', t: function () { return '¿Qué tiene ya ' + nombre() + '?'; }, s: 'Marca lo que ya esté hecho.', tipo: 'multi',
      lista: [['chip', ['chip', 'sky'], 'Microchip'], ['registro', ['ley', 'butter'], 'Inscripción en el registro'], ['vacunas', ['vacuna', 'mint'], 'Primeras vacunas'], ['veterinario', ['corazon', 'peach'], 'Primera visita al veterinario'], ['seguro', ['escudo', 'lilac'], 'Seguro de responsabilidad civil'], ['nada', ['chispa', 'sky'], 'Nada todavía']], exclusivos: ['nada'] },
    { id: 'email', t: function () { return '¿Dónde te enviamos el plan de ' + nombre() + '?'; }, s: 'Te mostramos el resultado ahora mismo y te guardamos una copia.', tipo: 'email' }
  ];
  function visibles() { return PREGUNTAS.filter(function (q) { return !q.cuando || q.cuando(); }); }

  function cuerpoOpcion(o) {
    var icono = o[1];
    var vis = icono.tam
      ? '<span class="tam"><span style="width:' + Math.round(icono.tam[1] * 56) + 'px">' + D.cara(icono.tam[0]) + '</span></span>'
      : burbuja(icono[0], icono[1]);
    return vis + '<span>' + esc(o[2]) + (o[3] ? '<small>' + esc(o[3]) + '</small>' : '') + '</span>';
  }

  function pregunta(i) {
    var lista = visibles();
    if (i > lista.length) { estado.paso = 'preparando'; guardarEstado(); return render(); }
    var q = lista[i - 1];
    var titulo = typeof q.t === 'function' ? q.t() : q.t;
    pintarBarra({ progreso: (i - 1) / lista.length, atras: function () { estado.paso = i - 1; guardarEstado(); render(); } });

    var html = '<div class="pila-g"><div class="cabecera-preg"><h2>' + esc(titulo) + '</h2>' + (q.s ? '<p class="suave">' + esc(q.s) + '</p>' : '') + '</div>';
    var val = estado.r[q.id];

    if (q.tipo === 'nombre') {
      html += '<div class="pila"><div class="campo-avatar"><span class="avatar">' + D.cara(estado.r.razaId || 'otra') + '</span>' +
        '<input type="text" id="campo" maxlength="30" autocomplete="off" placeholder="Por ejemplo, Luna" value="' + esc(val || '') + '"></div>' +
        '<p class="hola" id="hola"></p><button class="btn" id="sig">Continuar</button></div>';
    } else if (q.tipo === 'raza') {
      html += '<div class="razas">' + D.RAZAS.map(function (r) {
        return '<button class="raza" data-raza="' + r.id + '" aria-pressed="' + (estado.r.razaId === r.id) + '">' + D.cara(r.id) + '<span>' + esc(r.nombre) + '</span></button>';
      }).join('') + '</div>' +
        '<div class="pila" id="otra-raza"' + (estado.r.razaId === 'otra' ? '' : ' hidden') + '><input type="text" id="campo-raza" maxlength="40" placeholder="Escribe su raza" value="' + esc(estado.r.razaId === 'otra' ? estado.r.raza || '' : '') + '"><p class="hola" id="aviso-raza"></p><button class="btn" id="sig-raza">Continuar</button></div>';
    } else if (q.tipo === 'select') {
      html += '<div class="pila"><select id="campo"><option value="">Elige tu comunidad</option>' + P.COMUNIDADES.map(function (c) { return '<option' + (c === val ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
        '<button class="btn" id="sig">Continuar</button></div>';
    } else if (q.tipo === 'email') {
      var c = estado.consent || {};
      html += '<div class="pila"><div class="campo-avatar"><span class="avatar">' + D.cara(razaId(), { lengua: true }) + '</span>' +
        '<input type="email" id="campo" autocomplete="email" inputmode="email" placeholder="tu@email.com" value="' + esc(estado.email || '') + '"></div>' +
        '<label class="check"><input type="checkbox" id="c-priv"' + (c.privacidad ? ' checked' : '') + '> <span>He leído la <a href="/privacidad" target="_blank">política de privacidad</a> y acepto que tratéis mis datos para preparar mi resultado.</span></label>' +
        '<label class="check"><input type="checkbox" id="c-com"' + (c.comerciales ? ' checked' : '') + '> <span>Quiero recibir consejos y ofertas de ' + esc(CONF.marca) + ' por email (opcional).</span></label>' +
        '<label class="check"><input type="checkbox" id="c-seg"' + (c.seguros ? ' checked' : '') + '> <span>Acepto que me contactéis con ofertas de seguros para mi perro (opcional).</span></label>' +
        '<p class="error" id="err"></p><button class="btn" id="sig">Ver el resultado de ' + esc(nombre()) + '</button></div>';
    } else {
      var multi = q.tipo === 'multi';
      var sel = multi ? (val || []) : [];
      html += '<div class="opciones' + (q.dos ? ' dos' : '') + '">' + q.lista.map(function (o, k) {
        var marcado = multi ? sel.indexOf(o[0]) >= 0 : estado.r[q.id + '_idx'] === k;
        return '<button class="opcion" data-k="' + k + '" aria-pressed="' + marcado + '">' + cuerpoOpcion(o) +
          (multi ? '<span class="marca-check">' + I('check') + '</span>' : '') + '</button>';
      }).join('') + '</div>' + (multi ? '<button class="btn" id="sig"' + (sel.length ? '' : ' disabled') + '>Continuar</button>' : '');
    }
    pintar(html + '</div>');

    function avanzar() { evento('paso', q.id); estado.paso = i + 1; guardarEstado(); render(); }
    var campo = document.getElementById('campo');
    var sig = document.getElementById('sig');

    if (q.tipo === 'nombre') {
      var hola = document.getElementById('hola');
      var act = function () { var v = campo.value.trim(); sig.disabled = !v; hola.textContent = v ? '¡Hola, ' + v + '!' : ''; };
      act(); campo.focus();
      campo.oninput = act;
      campo.onkeydown = function (e) { if (e.key === 'Enter' && campo.value.trim()) sig.click(); };
      sig.onclick = function () { estado.r.nombre = campo.value.trim(); avanzar(); };
      return;
    }
    if (q.tipo === 'raza') {
      var otra = document.getElementById('otra-raza'), campoR = document.getElementById('campo-raza'), sigR = document.getElementById('sig-raza');
      app.querySelectorAll('.raza').forEach(function (b) {
        b.onclick = function () {
          var r = D.raza(b.dataset.raza);
          app.querySelectorAll('.raza').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          estado.r.razaId = r.id;
          if (r.tamano) estado.r.tamano = r.tamano;
          if (r.id === 'otra') { otra.hidden = false; campoR.focus(); sigR.disabled = !campoR.value.trim(); guardarEstado(); return; }
          otra.hidden = true; estado.r.raza = r.nombre; guardarEstado();
          setTimeout(avanzar, 200);
        };
      });
      campoR.oninput = function () { sigR.disabled = !campoR.value.trim(); };
      campoR.onkeydown = function (e) { if (e.key === 'Enter' && campoR.value.trim()) sigR.click(); };
      sigR.onclick = function () {
        var texto = campoR.value.trim(), id = D.buscar(texto);
        if (id) {
          // Era una raza que tenemos dibujada, escrita de otra forma: la usamos.
          var rz = D.raza(id);
          estado.r.razaId = id; estado.r.raza = rz.nombre;
          if (rz.tamano) estado.r.tamano = rz.tamano;
        } else estado.r.raza = texto;
        avanzar();
      };
      campoR.addEventListener('input', function () {
        var id = D.buscar(campoR.value), aviso = document.getElementById('aviso-raza');
        if (aviso) aviso.textContent = id ? 'Usaremos el dibujo de ' + D.raza(id).nombre + '.' : '';
      });
      return;
    }
    if (q.tipo === 'select') {
      sig.disabled = !campo.value;
      campo.onchange = function () { sig.disabled = !campo.value; };
      sig.onclick = function () { estado.r.comunidad = campo.value; avanzar(); };
      return;
    }
    if (q.tipo === 'opcion' || q.tipo === 'multi') {
      var botones = app.querySelectorAll('.opcion');
      botones.forEach(function (b) {
        b.onclick = function () {
          var k = Number(b.dataset.k), o = q.lista[k];
          if (q.tipo === 'multi') {
            var arr = (estado.r[q.id] || []).slice();
            var exc = q.exclusivos || [];
            var pos = arr.indexOf(o[0]);
            if (pos >= 0) arr.splice(pos, 1);
            else if (exc.indexOf(o[0]) >= 0) arr = [o[0]];
            else { arr = arr.filter(function (x) { return exc.indexOf(x) < 0; }); arr.push(o[0]); }
            estado.r[q.id] = arr;
            botones.forEach(function (x) { x.setAttribute('aria-pressed', arr.indexOf(q.lista[Number(x.dataset.k)][0]) >= 0 ? 'true' : 'false'); });
            sig.disabled = !arr.length;
            guardarEstado();
          } else {
            botones.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
            estado.r[q.id] = o[0];
            estado.r[q.id + '_idx'] = k;
            estado.r[q.id + 'Texto'] = o[2];
            setTimeout(avanzar, 200);
          }
        };
      });
      if (sig) sig.onclick = avanzar;
      return;
    }

    // Email + consentimientos
    sig.onclick = function () {
      var email = campo.value.trim();
      var consent = { privacidad: document.getElementById('c-priv').checked, comerciales: document.getElementById('c-com').checked, seguros: document.getElementById('c-seg').checked };
      var err = document.getElementById('err');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Revisa el email: parece que falta algo.'; return; }
      if (!consent.privacidad) { err.textContent = 'Para enviarte el resultado necesitamos que aceptes la política de privacidad.'; return; }
      sig.disabled = true;
      estado.email = email; estado.consent = consent;
      var r = estado.r;
      post('/api/lead', { sid: sid, email: email, consentimientos: consent, utm: utm, respuestas: { nombre: r.nombre, raza: r.raza, razaId: r.razaId, tamano: r.tamano, edadSemanas: r.edadSemanas, vivienda: r.vivienda, horasSolo: r.horasSolo, problema: r.problema, convivientes: r.convivientes, primerPerro: r.primerPerro, comunidad: r.comunidad, tiene: r.tiene } })
        .then(function () { pixel('Lead'); estado.paso = 'preparando'; guardarEstado(); render(); })
        .catch(function () { sig.disabled = false; err.textContent = 'No hemos podido guardar tus respuestas. Inténtalo de nuevo.'; });
    };
  }

  // ---------- Preparando ----------
  function preparando() {
    pintarBarra(null);
    var r = estado.r;
    var pasos = ['Rutina para sus ' + r.edadSemanas + '+ semanas', 'Plan de ' + (P.PROBLEMAS[r.problema] || '').toLowerCase(), 'Checklist legal de ' + r.comunidad];
    pintar('<div class="preparando"><div class="anillo">' + D.cara(razaId()) + '</div>' +
      '<h2>Preparando el plan de ' + esc(nombre()) + '</h2>' +
      '<ul class="checklist-carga">' + pasos.map(function (p) { return '<li>' + I('check') + esc(p) + '</li>'; }).join('') + '</ul></div>');
    var items = app.querySelectorAll('.checklist-carga li');
    [700, 1500, 2300].forEach(function (t, k) { setTimeout(function () { if (items[k]) items[k].classList.add('hecho'); }, t); });
    setTimeout(function () { estado.paso = 'resultado'; guardarEstado(); render(); }, 3100);
  }

  // ---------- Resultado gratis + paywall ----------
  function perfilPlan() { var r = estado.r; return { nombre: r.nombre, raza: r.raza, razaId: r.razaId, edadSemanas: Number(r.edadSemanas), tamano: r.tamano || 'mediano', vivienda: r.vivienda, horasSolo: Number(r.horasSolo), problema: r.problema, convivientes: r.convivientes || [] }; }
  var TIPOS = (window.PLAN_HTML && window.PLAN_HTML.TIPOS) || {};
  function tipoBloque(tipo) { return TIPOS[tipo] || ['reloj', 'sky']; }
  var ICONO_LEGAL = { chip: 'chip', registro: 'ley', rabia: 'vacuna', seguro: 'escudo', curso: 'calendario' };

  function resultado() {
    pintarBarra(null);
    evento('resultado_visto');
    var r = estado.r;
    var rut = P.rutinaDiaria(perfilPlan());
    var tiene = r.tiene || [];
    var legalItems = P.LEGAL.items.filter(function (x) { return x.id !== 'ppp'; });
    var prot = P.PROTOCOLOS[r.problema] || P.PROTOCOLOS.pis;
    var faltaSeguro = tiene.indexOf('seguro') < 0;
    var ajustes = [['perro', r.raza || 'Su raza'], ['reloj', r.edadSemanasTexto || 'Su edad'], [({ pis: 'gota', mordiscos: 'diente', noches: 'luna', solo: 'puerta' })[r.problema] || 'gota', P.PROBLEMAS[r.problema] || 'Tu problema'], [r.vivienda === 'jardin' ? 'casa' : 'piso', r.vivienda === 'jardin' ? 'Casa con jardín' : 'Piso'], ['puerta', r.horasSolo ? r.horasSoloTexto + ' sin nadie' : 'Siempre acompañado']];
    if ((r.convivientes || []).indexOf('ninos') >= 0) ajustes.push(['nino', 'Niños en casa']);
    var chips = [r.raza, r.edadSemanasTexto, r.vivienda === 'jardin' ? 'Casa con jardín' : 'Piso', r.horasSolo ? r.horasSoloTexto + ' sin nadie' : 'Casi nunca sin nadie'].filter(Boolean);

    var html =
      '<div class="pila-g">' +
      '<section class="pila"><div class="perfil"><span class="avatar">' + D.cara(razaId(), { lengua: true }) + '</span>' +
        '<div class="pila" style="gap:6px"><span class="chip ok">' + I('check') + 'Gratis para ti</span><h1 style="font-size:1.7rem">La rutina de mañana para ' + esc(nombre()) + '</h1></div></div>' +
        '<div class="ajustes"><span class="suave peq">Ajustada a:</span>' + ajustes.map(function (a) { return '<span class="chip">' + I(a[0]) + esc(a[1]) + '</span>'; }).join('') + '</div></section>' +

      '<section class="tarjeta pila"><ul class="linea-tiempo">' + rut.bloques.map(function (b) {
        var tb = tipoBloque(b[2]);
        return '<li>' + burbuja(tb[0], tb[1]) + '<div><div class="hora">' + esc(b[0]) + '</div><div class="txt">' + esc(b[1]) + '</div></div></li>';
      }).join('') + '</ul><p class="nota">' + I('chispa') + '<span>' + esc(rut.nota) + '</span></p>' +
        rut.avisosRaza.map(function (a) { return '<p class="nota raza-nota">' + I('huella') + '<span><b>Por ser ' + esc((D.raza(razaId()) || {}).nombre || 'tu perro').toLowerCase() + ':</b> ' + esc(a.charAt(0).toLowerCase() + a.slice(1)) + '</span></p>'; }).join('') + '</section>' +

      '<section class="pila"><h2>¿' + esc(nombre()) + ' está en regla?</h2>' +
        '<div class="tarjeta"><ul class="legal-lista">' + legalItems.map(function (x) {
          var hecho = tiene.indexOf(x.id) >= 0;
          return '<li>' + burbuja(ICONO_LEGAL[x.id] || 'ley', hecho ? 'mint' : 'peach') + '<div><b>' + esc(x.texto) + '</b><span class="det">' + esc(x.estado) + '</span></div>' +
            '<span class="pill ' + (hecho ? 'hecho">Hecho' : 'pend">Pendiente') + '</span></li>';
        }).join('') + '</ul><p class="peq suave" style="margin-top:8px">' + esc(P.LEGAL.aviso) + '</p>' +
        (faltaSeguro ? '<div style="margin-top:12px"><button class="btn sec" id="seguros">' + I('escudo') + 'Quiero comparar seguros</button></div>' : '') + '</div></section>' +

      '<section class="pila"><h2>Así es su plan de 8 semanas</h2>' + vistaPrevia() + '</section>' +
      paywallHtml() + '</div>';
    pintar(html);
    evento('paywall_visto');

    var bs = document.getElementById('seguros');
    if (bs) bs.onclick = function () { evento('clic_seguros'); bs.outerHTML = '<p class="chip ok">' + I('check') + 'Apuntado: te avisaremos con la comparativa</p>'; };
    activarPaywall();
  }
  function vistaPrevia() {
    var T = window.TAREAS || [];
    var n = nombre();
    var dias = T.slice(0, 7).map(function (t, k) {
      return '<li' + (k > 2 ? ' class="borroso"' : '') + '><span class="casilla"></span><span><b>Día ' + t.dia + ' · ' + esc(t.titulo) + '</b>' + esc(t.tarea.replace(/\{n\}/g, n)) + '</span></li>';
    }).join('');
    var r = estado.r, prot = P.PROTOCOLOS[r.problema] || P.PROTOCOLOS.pis;
    return '<div class="peek">' +
      '<div class="peek-hero"><span class="avatar">' + D.cara(razaId(), { lengua: true }) + '</span><div><small>Plan de 8 semanas</small><b>' + esc(n) + '</b><div class="peek-bar"><i></i></div></div></div>' +
      '<div class="peek-tabs">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '<span' + (k === 1 ? ' class="on"' : '') + '>S' + k + '<small>' + (Number(r.edadSemanas) + k - 1) + ' sem.</small></span>'; }).join('') + '</div>' +
      '<div class="peek-body"><p class="eti-peq">Semana 1 · ' + esc(P.SOCIALIZACION[0].foco) + '</p><ul class="peek-dias">' + dias + '</ul>' +
      '<div class="peek-prot">' + burbuja(({ pis: 'gota', mordiscos: 'diente', noches: 'luna', solo: 'puerta' })[r.problema] || 'gota', 'peach') + '<span><b>' + esc(prot.titulo) + '</b>' + ((r.problema === 'pis' ? prot.piso : prot.si) || prot.piso).length + ' pasos · tu prioridad</span></div>' +
      '<div class="peek-candado"><span>' + I('candado') + '56 días, 4 protocolos y la checklist de socialización</span></div></div></div>';
  }

  function paywallHtml() {
    var dia = (CONF.precio / 56 / 100).toFixed(2).replace('.', ',');
    return '<section class="tarjeta pila" id="paywall" style="gap:18px">' +
      '<div class="portada-plan"><div class="fila-p"><span class="avatar">' + D.cara(razaId()) + '</span><div><small>Plan de 8 semanas</small><h2>' + esc(nombre()) + '</h2></div></div>' +
        '<div class="semanas">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (s) { return '<span>S' + s + '</span>'; }).join('') + '</div></div>' +
      '<ul class="lista-inc">' +
        '<li>' + burbuja('calendario', 'butter') + 'Rutina diaria que se actualiza cada semana con su edad</li>' +
        '<li>' + burbuja('estrella', 'peach') + 'Empezamos por ' + esc((P.PROBLEMAS[estado.r.problema] || 'su mayor problema').toLowerCase()) + ', paso a paso</li>' +
        '<li>' + burbuja('huella', 'sky') + 'Protocolos para pis, mordiscos, noches y quedarse solo</li>' +
        '<li>' + burbuja('personas', 'mint') + 'Checklist de socialización semana a semana</li>' +
        '<li>' + burbuja('ley', 'lilac') + 'Salud y checklist legal de ' + esc(estado.r.comunidad || 'tu comunidad') + '</li>' +
        '<li>' + burbuja('correo', 'sky') + 'Un email cada día con la tarea del día</li>' +
      '</ul>' +
      '<div class="precio-fila"><span class="precio">' + euros(CONF.precio) + '</span><span class="suave">Pago único · menos de ' + dia + ' € al día</span></div>' +
      '<div class="garantia">' + I('escudo') + '<span>Garantía de 14 días: si no te sirve, te devolvemos el 100%, sin preguntas.</span></div>' +
      '<label class="check"><input type="checkbox" id="desist"> <span>Quiero recibir el plan ya. Acepto que, al empezar la entrega del contenido digital, pierdo el derecho legal de desistimiento (la garantía de 14 días sigue vigente). <a href="/condiciones" target="_blank">Condiciones</a>.</span></label>' +
      '<p class="error" id="err-pago"></p>' +
      '<button class="btn" id="pagar" disabled>Quiero el plan de ' + esc(nombre()) + '</button>' +
      '<p class="micro"><span>' + I('candado') + 'Pago seguro con Stripe</span><span>Tarjeta · Apple Pay · Google Pay</span></p>' +
      '<p class="peq suave">El plan da rutinas y educación. No sustituye al veterinario ni al curso oficial de tenencia responsable.</p></section>';
  }

  function activarPaywall() {
    var chk = document.getElementById('desist'), btn = document.getElementById('pagar'), err = document.getElementById('err-pago');
    chk.onchange = function () { btn.disabled = !chk.checked; err.textContent = ''; };
    btn.onclick = function () {
      btn.disabled = true; btn.textContent = 'Abriendo el pago…';
      pixel('InitiateCheckout', { value: CONF.precio / 100, currency: 'EUR' });
      post('/api/checkout', { sid: sid, desistimiento: true })
        .then(function (j) { location.href = j.url; })
        .catch(function (e) { err.textContent = (e && e.error) || 'No hemos podido abrir el pago. Inténtalo de nuevo.'; btn.disabled = false; btn.textContent = 'Quiero el plan de ' + nombre(); });
    };
  }

  // ---------- Vuelta del pago ----------
  function trasPago(sessionId) {
    pintarBarra(null);
    pintar('<div class="preparando"><div class="anillo">' + D.cara(razaId()) + '</div><h2>Confirmando tu pago…</h2></div>');
    fetch('/api/pedido?session_id=' + encodeURIComponent(sessionId)).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.pagado) { pintar('<div class="pila"><h2>Todavía no vemos el pago</h2><p>Si te han cobrado, escríbenos a ' + esc(CONF.emailContacto) + ' y lo resolvemos hoy.</p></div>'); return; }
      if (lsGet('pc_compra_px') !== sessionId) { pixel('Purchase', { value: j.importe / 100, currency: 'EUR' }); lsSet('pc_compra_px', sessionId); }
      if (j.upsell) upsell(sessionId); else gracias(false);
    }).catch(function () { pintar('<div class="pila"><h2>No hemos podido confirmar el pago</h2><p>Recarga la página en unos segundos.</p></div>'); });
  }

  function upsell(sessionId) {
    evento('upsell_visto');
    var packs = [
      { id: 'separacion', ic: 'puerta', c: 'butter', t: 'Pack quedarse solo', d: 'Protocolo de 3 semanas para que ' + nombre() + ' aprenda a quedarse en casa con calma, con registro de progresos.' },
      { id: 'correa', ic: 'correa', c: 'mint', t: 'Pack paseos sin tirones', d: 'Plan de 3 semanas para que aprenda a caminar con la correa floja desde el principio.' }
    ];
    if (estado.r.problema !== 'solo') packs.reverse();
    pintar('<div class="pila-g"><div class="pila"><span class="chip ok">' + I('check') + 'Pago confirmado</span>' +
      '<h1 style="font-size:1.8rem">Una cosa más antes de empezar</h1>' +
      '<p class="suave">Añade un pack en profundidad por <b>' + euros(CONF.precioUpsell) + '</b>. Se cobra en la misma tarjeta, sin volver a meter datos.</p></div>' +
      packs.map(function (p) {
        return '<div class="tarjeta pack"><div class="cab">' + burbuja(p.ic, p.c) + '<h3>' + esc(p.t) + '</h3></div><p class="suave">' + esc(p.d) + '</p>' +
          '<button class="btn" data-pack="' + p.id + '">Añadir por ' + euros(CONF.precioUpsell) + '</button></div>';
      }).join('') +
      '<p class="error" id="err-up"></p><button class="btn texto" id="no-up">No, gracias. Ir a mi plan</button></div>');
    app.querySelectorAll('[data-pack]').forEach(function (b) {
      b.onclick = function () {
        app.querySelectorAll('[data-pack]').forEach(function (x) { x.disabled = true; });
        b.textContent = 'Añadiendo…';
        post('/api/upsell', { session_id: sessionId, pack: b.dataset.pack })
          .then(function () { pixel('Purchase', { value: CONF.precioUpsell / 100, currency: 'EUR', content_name: 'upsell' }); gracias(true); })
          .catch(function (e) { document.getElementById('err-up').textContent = (e && e.error) || 'No se ha podido añadir. Tu plan no se ve afectado.'; app.querySelectorAll('[data-pack]').forEach(function (x) { x.disabled = false; }); b.textContent = 'Reintentar'; });
      };
    });
    document.getElementById('no-up').onclick = function () { evento('upsell_rechazado'); gracias(false); };
  }

  function gracias(conPack) {
    pintarBarra(null);
    var email = estado.email;
    var respuestas = estado.r;
    lsSet('pc_estado', null);
    pintar('<div class="celebra"><span class="avatar">' + D.cara(razaId(), { lengua: true }) + '<span class="sello">' + I('check') + '</span></span>' +
      '<h1 style="font-size:1.9rem">Empieza el plan de ' + esc(nombre()) + '</h1>' +
      '<p class="suave">Lo estamos preparando con sus respuestas. Te llegará a <b>' + esc(email || 'tu email') + '</b>.</p>' +
      '<ul class="proximos">' +
        '<li>' + burbuja('correo', 'sky') + '<div><b>Hoy, en menos de 24 horas</b><span>Su plan completo: página privada y PDF' + (conPack ? ', y el pack que has añadido' : '') + '.</span></div></li>' +
        '<li>' + burbuja('sol', 'butter') + '<div><b>Mañana</b><span>Primer email con la tarea del día.</span></div></li>' +
        '<li>' + burbuja('estrella', 'mint') + '<div><b>Día 7</b><span>Te preguntamos cómo vais para ajustar lo que haga falta.</span></div></li>' +
      '</ul>' +
      (window.DEMO_VER_PLAN ? '<button class="btn" id="ver-plan">' + I('calendario') + 'Ver el plan de ' + esc(nombre()) + '</button>' : '') +
      '<div class="garantia">' + I('escudo') + '<span>Tienes 14 días de garantía. Si no te sirve, responde a cualquier email y te devolvemos el dinero.</span></div></div>');
    var vp = document.getElementById('ver-plan');
    if (vp) vp.onclick = function () { verPlan(respuestas); };
  }

  function verPlan(r) {
    var html = window.PLAN_HTML.render({ respuestas: r, marca: CONF.marca, id: 'demo', volver: true });
    document.open(); document.write(html); document.close();
  }
  window.verPlanDemo = function () { verPlan(estado.r && estado.r.nombre ? estado.r : { nombre: 'Luna', raza: 'Labrador', razaId: 'labrador', tamano: 'grande', edadSemanas: 10, edadSemanasTexto: '10–11 semanas', vivienda: 'piso', horasSolo: 4, problema: 'mordiscos', convivientes: ['ninos'], primerPerro: 'si', comunidad: 'Comunidad de Madrid', tiene: ['chip'] }); };

  // ---------- Router ----------
  function render() {
    if (estado.paso === 0) return portada();
    if (typeof estado.paso === 'number') return pregunta(estado.paso);
    if (estado.paso === 'preparando') return preparando();
    if (estado.paso === 'resultado') return resultado();
    portada();
  }

  fetch('/api/config?sid=' + sid).then(function (r) { return r.json(); }).then(function (c) { CONF = c; }).catch(function () {}).then(function () {
    document.getElementById('pie-contacto').textContent = CONF.emailContacto || '';
    document.title = CONF.marca + ' · El plan para tu cachorro';
    gestionarCookies();
    if (params.get('pago') === 'ok' && params.get('session_id')) return trasPago(params.get('session_id'));
    if (params.get('pago') === 'cancelado') { evento('checkout_cancelado'); estado.paso = 'resultado'; }
    if (estado.paso === 0) evento('visita');
    render();
  });
})();
