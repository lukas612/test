/*
 * Plantillas del "Plan de tu cachorro".
 *
 * ESTADO: BORRADOR PENDIENTE DE REVISIÓN por un educador canino titulado (fase 0).
 * Nada de este archivo se publica a clientes sin esa revisión.
 *
 * Reglas de contenido:
 *  - Solo rutinas y educación en positivo. Nada de castigos ni métodos aversivos.
 *  - Salud y alimentación: siempre "consulta con tu veterinario". Sin dosis, marcas ni diagnósticos.
 *  - Legal: sin afirmar lo que aún no está regulado. Fecha de revisión visible.
 *
 * Funciona en navegador (window.PLANTILLAS) y en Node (require).
 */
(function (root) {
  'use strict';

  var REVISADO = '2026-11-07';

  // ---------- Tamaños (peso adulto estimado) ----------
  var TAMANOS = {
    pequeno: { nombre: 'pequeño', rango: 'menos de 10 kg de adulto' },
    mediano: { nombre: 'mediano', rango: 'de 10 a 25 kg de adulto' },
    grande:  { nombre: 'grande',  rango: 'más de 25 kg de adulto' }
  };

  // ---------- Tramos de edad (semanas) ----------
  var TRAMOS = [
    { id: 't1', desde: 0,  hasta: 11, nombre: '8–11 semanas' },
    { id: 't2', desde: 12, hasta: 15, nombre: '12–15 semanas' },
    { id: 't3', desde: 16, hasta: 19, nombre: '16–19 semanas' },
    { id: 't4', desde: 20, hasta: 99, nombre: '20–26 semanas' }
  ];

  function tramoPorEdad(semanas) {
    for (var i = 0; i < TRAMOS.length; i++) {
      if (semanas >= TRAMOS[i].desde && semanas <= TRAMOS[i].hasta) return TRAMOS[i];
    }
    return TRAMOS[TRAMOS.length - 1];
  }

  // ---------- Parámetros por tramo y tamaño ----------
  // horasSueno: total diario aproximado. aguantePis: horas máx. de referencia DE DÍA (regla orientativa).
  // comidas: nº de tomas (la cantidad la marca el veterinario y el fabricante del pienso).
  // minPaseo: minutos por paseo estructurado (referencia prudente; no hay una cifra "oficial").
  var PARAMS = {
    t1: {
      pequeno: { horasSueno: '18–20', aguantePis: 1.5, comidas: 4, minPaseo: 5 },
      mediano: { horasSueno: '18–20', aguantePis: 2,   comidas: 4, minPaseo: 5 },
      grande:  { horasSueno: '18–20', aguantePis: 2,   comidas: 4, minPaseo: 5 }
    },
    t2: {
      pequeno: { horasSueno: '17–19', aguantePis: 2,   comidas: 4, minPaseo: 10 },
      mediano: { horasSueno: '17–19', aguantePis: 2.5, comidas: 3, minPaseo: 10 },
      grande:  { horasSueno: '17–19', aguantePis: 3,   comidas: 3, minPaseo: 10 }
    },
    t3: {
      pequeno: { horasSueno: '16–18', aguantePis: 3, comidas: 3, minPaseo: 15 },
      mediano: { horasSueno: '16–18', aguantePis: 3, comidas: 3, minPaseo: 15 },
      grande:  { horasSueno: '16–18', aguantePis: 4, comidas: 3, minPaseo: 15 }
    },
    t4: {
      pequeno: { horasSueno: '15–17', aguantePis: 4, comidas: 3, minPaseo: 20 },
      mediano: { horasSueno: '15–17', aguantePis: 4, comidas: 3, minPaseo: 20 },
      grande:  { horasSueno: '15–17', aguantePis: 5, comidas: 2, minPaseo: 20 }
    }
  };

  // ---------- Rutina diaria base ----------
  // Bloques de un día laborable. {n} = nombre del cachorro.
  // "salida" se adapta a piso (calle/empapador según vacunas) o jardín.
  var HORARIOS_COMIDA = {
    4: ['07:30', '12:00', '16:30', '20:30'],
    3: ['07:30', '13:30', '20:00'],
    2: ['07:30', '19:30']
  };

  // ---------- Rasgos por raza (PENDIENTE DE REVISIÓN por el educador) ----------
  // energia: baja | media | alta. actividad: el juego del día que más encaja con la raza.
  // cuidado: precaución física general (sin consejo veterinario).
  var ACTIVIDADES = {
    olfato:  { icono: 'huella', txt: 'Juego de olfato 10 minutos: esconde 5 premios por el salón y deja que los busque. A los perros de nariz como {raza} les cansa más que correr.' },
    pensar:  { icono: 'chispa', txt: 'Juego de pensar 10 minutos: un premio bajo uno de 3 vasos, o un juguete rellenable. {raza} necesita trabajar la cabeza, no solo correr.' },
    calma:   { icono: 'corazon', txt: 'Rato de mimos y manipulación 5 minutos: cepillo suave, tocar patas y orejas con premio. A {raza} le ayuda a estar tranquilo y a dejarse cuidar.' },
    buscar:  { icono: 'pelota', txt: 'Juego de "trae" 5 minutos con una pelota blanda, en casa o en un sitio seguro. A {raza} le encanta llevar cosas en la boca: aprovéchalo.' },
    cuerda:  { icono: 'pelota', txt: 'Juego de tira y afloja suave 5 minutos con una cuerda, con pausas de "suelta". Le enseña a controlar la boca.' }
  };
  var RASGOS = {
    mestizo:          { energia: 'media', actividad: 'olfato' },
    otra:             { energia: 'media', actividad: 'olfato' },
    caniche:          { energia: 'media', actividad: 'pensar', nota: 'Los caniches aprenden muy rápido: 2 sesiones cortas al día le cundirán mucho.' },
    teckel:           { energia: 'media', actividad: 'olfato', cuidado: 'Evita que suba y baje del sofá o la cama de un salto y las escaleras largas: su espalda lo agradecerá. Cógele en brazos con una mano bajo el pecho y otra bajo el culete.' },
    chihuahua:        { energia: 'media', actividad: 'calma', cuidado: 'Es muy pequeño: cuidado con las caídas desde el sofá o los brazos, y con que le pisen en casa.' },
    yorkshire:        { energia: 'media', actividad: 'pensar', cuidado: 'Es muy pequeño: cuidado con las caídas y acostúmbrale pronto al cepillado diario.' },
    schnauzer:        { energia: 'media', actividad: 'pensar', cuidado: 'Su barba y sus cejas necesitan cuidado: acostúmbrale ya a que le cepillen la cara y le limpien la barba después de comer, con premio.', nota: 'Suele avisar con ladridos de todo lo que pasa: premia cuando se calla, no cuando ladra.' },
    bichon:           { energia: 'media', actividad: 'calma', cuidado: 'Su pelo necesita cepillado frecuente: empieza ya con sesiones muy cortas y premios.' },
    pomerania:        { energia: 'media', actividad: 'pensar', cuidado: 'Es muy pequeño: cuidado con las caídas. Cepillado corto cada día desde ya.' },
    'shih-tzu':       { energia: 'baja', actividad: 'calma', cuidado: 'Tiene el hocico corto: evita el juego intenso y las horas de calor, y fíjate si respira con dificultad.' },
    'bulldog-frances':{ energia: 'baja', actividad: 'calma', cuidado: 'Tiene el hocico corto: nada de ejercicio intenso ni paseos en las horas de calor. Si respira muy fuerte, para y descansa.' },
    'jack-russell':   { energia: 'alta', actividad: 'cuerda', nota: 'Tiene mucha energía: si no la gasta con juego y olfato, la gastará en tus muebles.' },
    beagle:           { energia: 'media', actividad: 'olfato', nota: 'Su nariz manda: en la calle, siempre con correa en zonas no valladas.' },
    cocker:           { energia: 'media', actividad: 'buscar', cuidado: 'Revisa y seca sus orejas largas después del paseo, con premio.' },
    'border-collie':  { energia: 'alta', actividad: 'pensar', nota: 'Es de las razas que más necesitan trabajar la cabeza. Mejor 3 juegos cortos de pensar que un paseo largo.' },
    'perro-agua':     { energia: 'alta', actividad: 'buscar', cuidado: 'Su pelo rizado se enreda: acostúmbrale pronto a que le toquen y cepillen.' },
    podenco:          { energia: 'alta', actividad: 'olfato', nota: 'Es cazador de vista y olfato: la llamada ("ven") es su asignatura más importante. En la calle, siempre con correa.' },
    setter:           { energia: 'alta', actividad: 'olfato', nota: 'Tiene mucha energía y mucha nariz: combina juego de olfato y paseos tranquilos.' },
    labrador:         { energia: 'alta', actividad: 'buscar', nota: 'Los labradores suelen comer muy rápido: dale parte de la comida en un juguete rellenable.', cuidado: 'Es un perro grande en crecimiento: nada de saltos altos ni carreras largas todavía.' },
    golden:           { energia: 'alta', actividad: 'buscar', cuidado: 'Es un perro grande en crecimiento: nada de saltos altos ni carreras largas todavía.' },
    'pastor-aleman':  { energia: 'alta', actividad: 'pensar', cuidado: 'Es un perro grande en crecimiento: nada de saltos altos ni carreras largas todavía.' },
    husky:            { energia: 'alta', actividad: 'cuerda', nota: 'Es independiente y muy activo: trabaja mucho la llamada y no le sueltes en zonas abiertas.', cuidado: 'Lleva mal el calor: en verano, juego y paseos a primera hora y al anochecer.' }
  };
  var JUEGO_MIN = { baja: 5, media: 10, alta: 15 };

  function hhmm(h) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh++; mm = 0; } return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; }
  function aHoras(t) { return parseInt(t, 10) + parseInt(t.slice(3), 10) / 60; }

  function rutinaDiaria(perfil) {
    var tramo = tramoPorEdad(perfil.edadSemanas);
    var p = PARAMS[tramo.id][perfil.tamano] || PARAMS[tramo.id].mediano;
    var comidas = HORARIOS_COMIDA[p.comidas];
    var jardin = perfil.vivienda === 'jardin';
    var n = perfil.nombre || 'tu cachorro';
    var horasSolo = Number(perfil.horasSolo) || 0;
    var rasgo = RASGOS[perfil.razaId] || RASGOS.mestizo;
    var nombreRaza = perfil.raza && perfil.razaId !== 'mestizo' && perfil.razaId !== 'otra' ? 'un ' + perfil.raza.toLowerCase() : n;
    var problema = perfil.problema;
    var conv = perfil.convivientes || [];
    var juegoMin = JUEGO_MIN[rasgo.energia];
    var salidaCasa = 9, vuelta = salidaCasa + Math.min(horasSolo, 9);
    var fuera = function (x) { return horasSolo > 0 && x >= salidaCasa && x < vuelta; };
    var lugarPis = jardin ? 'al jardín, siempre al mismo rincón' : 'a hacer pis (calle o empapador, según te diga tu veterinario por las vacunas)';
    var bloques = [];
    function add(h, tipo, txt) { bloques.push({ hora: typeof h === 'number' ? hhmm(h) : h, tipo: tipo, txt: txt }); }

    // Momentos fijos de pis
    var pis = [7];
    add(7, 'despertar', 'Nada más despertar: salida ' + lugarPis + '. Premio en cuanto termine.');
    comidas.forEach(function (h, i) {
      var x = aHoras(h), nombreComida = i === 0 ? 'Desayuno' : 'Comida ' + (i + 1);
      if (fuera(x)) { add(h, 'comida', nombreComida + ': como estarás fuera, déjasela dentro de un juguete rellenable o pide a alguien que se la dé.'); return; }
      var extra = conv.indexOf('perros') >= 0 ? ' Que coma separado del otro perro.' : '';
      add(h, 'comida', nombreComida + ' en su sitio de siempre.' + extra + ' A los 10–15 minutos, salida a hacer pis.');
      pis.push(x + 0.25);
    });

    // Juego de mañana según raza y problema
    var juegoTxt = 'Juego tranquilo ' + juegoMin + ' minutos con un mordedor y después siesta en su zona de descanso.';
    if (problema === 'mordiscos') juegoTxt = 'Juego ' + juegoMin + ' minutos siempre con un juguete entre tu mano y su boca. Si muerde la mano: quieto, retírala y ofrécele el mordedor. Después, siesta: muchos mordiscos son de sueño.';
    add(8.25, 'juego', juegoTxt);
    pis.push(8.5);

    // Ausencia o mañana en casa
    if (horasSolo > 0) {
      if (problema === 'solo') add(8.75, 'solo', 'Antes de irte: pis, 5 minutos de juego tranquilo y 5 de calma. Prepárale el juguete rellenable que solo tiene cuando te vas.');
      add(salidaCasa, 'solo', 'Te vas: deja a ' + n + ' en su zona segura con agua, empapador y un juguete rellenable. Salida sin despedidas largas.');
      if (horasSolo > p.aguantePis) add(salidaCasa + horasSolo / 2, 'pis', 'Con ' + horasSolo + ' h fuera, ' + n + ' no puede aguantar sin hacer pis: el empapador en su zona es imprescindible. Si puedes, que alguien pase a sacarle ahora.');
      add(vuelta, 'solo', 'Vuelves: saludo tranquilo y salida a hacer pis inmediata, antes de nada más.');
      pis.push(vuelta);
    } else {
      add(10.5, 'aprender', 'Sesión de 5 minutos: aprender su nombre y "sentado" con premios.');
      if (problema === 'solo') add(11.25, 'solo', 'Práctica de soledad: sal de la habitación 3 veces, de 30 segundos a 2 minutos, mientras tiene su juguete rellenable. Vuelve antes de que llore.');
    }

    // Actividad de la raza
    var act = ACTIVIDADES[rasgo.actividad];
    var horaAct = horasSolo > 0 ? Math.max(vuelta + 1, 16) : 12.75;
    add(horaAct, 'raza', act.txt.replace(/(^|\. )\{raza\}/, function (m, p1) { return p1 + nombreRaza.charAt(0).toUpperCase() + nombreRaza.slice(1); }).replace('{raza}', nombreRaza));

    add(17, 'social', 'Socialización del día (checklist de la semana): ' + p.minPaseo + ' minutos como máximo, sin forzar.' + (conv.indexOf('gatos') >= 0 ? ' Hoy, un rato tranquilo cerca del gato con premios.' : ''));
    pis.push(17.5);
    if (conv.indexOf('ninos') >= 0) add(18, 'familia', 'Momento con los niños: sentados en el suelo, que le den premios cuando se siente. Sin perseguirle ni cogerle en brazos.');
    var juegoTarde = 'Juego activo ' + juegoMin + ' minutos y siesta. Un cachorro de esta edad necesita dormir ' + p.horasSueno + ' horas al día.';
    if (rasgo.energia === 'alta') juegoTarde += ' Aunque tenga mucha energía, la siesta no se negocia.';
    add(18.5, 'juego', juegoTarde);
    pis.push(19);
    if (problema === 'mordiscos') add(19.5, 'mordiscos', 'Mordedor congelado 10 minutos (un trapo húmedo anudado o un juguete de goma del congelador): alivia las encías justo cuando más suele morder.');
    if (problema === 'pis') add(21, 'pis', 'Repasa la tabla de pis de hoy: apunta dónde y cuándo. En 3 días verás su patrón y podrás adelantarte.');
    if (problema === 'noches') add(21.5, 'noches', 'Empieza la calma: luces bajas, nada de juego activo y un mordedor tranquilo. Que llegue a la cama con sueño, no excitado.');
    add(22.5, 'pis', 'Última salida a hacer pis, con calma y sin juego.');
    pis.push(22.5);
    add(23, 'dormir', problema === 'noches'
      ? 'A dormir: su cama o transportín pegado a tu cama, con una prenda con tu olor. Si llora, una mano cerca y voz tranquila; si ya ha hecho pis, no le saques a jugar.'
      : 'A dormir en su cama o transportín, cerca de vuestra habitación las primeras semanas.');
    if (tramo.id === 't1' || tramo.id === 't2') add(3, 'noche', 'Salida nocturna: sin luces fuertes, sin hablar, sin jugar. Pis y de vuelta a la cama. Esta salida suele dejar de hacer falta hacia las ' + (tramo.id === 't1' ? '14–16' : '16') + ' semanas.');

    // Salidas extra de pis para no pasar de su aguante (solo cuando hay alguien en casa)
    pis.sort(function (a, b) { return a - b; });
    var extras = 0;
    for (var i = 0; i < pis.length - 1; i++) {
      var a = pis[i], b = pis[i + 1];
      while (b - a > p.aguantePis + 0.25) {
        a += p.aguantePis;
        var hueco = hhmm(a), mismo = bloques.filter(function (x) { return x.hora === hueco; })[0];
        if (mismo && !fuera(a)) { mismo.txt = 'Primero, salida a hacer pis. Después: ' + mismo.txt.charAt(0).toLowerCase() + mismo.txt.slice(1); extras++; }
        else if (!fuera(a) && a < 22) { add(a, 'pis', 'Salida a hacer pis' + (jardin ? ' al jardín' : '') + ', aunque no lo pida. A su edad aguanta unas ' + String(p.aguantePis).replace('.', ',') + ' h.'); extras++; }
      }
    }

    bloques.sort(function (x, y) { return x.hora < y.hora ? -1 : x.hora > y.hora ? 1 : 0; });
    var avisos = [];
    if (rasgo.cuidado) avisos.push(rasgo.cuidado);
    if (rasgo.nota) avisos.push(rasgo.nota);
    return {
      tramo: tramo.nombre,
      tamano: TAMANOS[perfil.tamano] ? TAMANOS[perfil.tamano].nombre : 'mediano',
      parametros: p,
      energia: rasgo.energia,
      bloques: bloques.map(function (x) { return [x.hora, x.txt, x.tipo]; }),
      salidasPis: bloques.filter(function (x) { return /pis/i.test(x.txt) && x.tipo !== 'comida'; }).length + pis.length - extras,
      avisosRaza: avisos,
      nota: 'Entre salidas de día, no más de unas ' + String(p.aguantePis).replace('.', ',') + ' h a su edad. Además, saca a ' + n + ' siempre al despertar, después de comer y después de jugar.'
    };
  }

  // ---------- Protocolos ----------
  var PROTOCOLOS = {
    pis: {
      titulo: 'Plan anti-pis en casa',
      piso: [
        'Elige un único sitio de pis (empapador en un rincón fijo o un punto concreto en la calle cuando el veterinario lo permita) y no lo cambies.',
        'Sácale en los 5 momentos clave: al despertar, después de comer, después de jugar, después de una emoción (visitas) y antes de dormir.',
        'Cuando haga pis en el sitio bueno: premio de comida en los 2 segundos siguientes y una palabra fija ("muy bien, pis").',
        'Si le pillas haciéndolo dentro: sin gritos ni regañinas. Le coges con calma y le llevas al sitio bueno. Si ya está hecho, no digas nada.',
        'Limpia con un limpiador enzimático, no con lejía ni amoniaco: el olor le invita a repetir.',
        'Cuando no puedas vigilarle, que esté en su zona segura (parque o habitación pequeña con empapador).',
        'Apunta los pis en la tabla del plan durante 7 días: verás su patrón y podrás adelantarte.'
      ],
      jardin: [
        'Elige un rincón del jardín y llévale siempre allí con correa al principio, aunque la puerta esté abierta.',
        'Sácale en los 5 momentos clave: al despertar, después de comer, después de jugar, después de una emoción y antes de dormir.',
        'Quédate con él hasta que termine y prémiale en el momento, en el jardín (no al volver a entrar).',
        'Si hace pis dentro: sin regañinas. Le llevas al jardín con calma. Si ya está hecho, limpia y sigue.',
        'Limpia con un limpiador enzimático.',
        'Por la noche y cuando estés fuera, zona segura con empapador hasta que aguante más horas.',
        'Apunta los pis 7 días para ver su patrón.'
      ],
      no: ['Restregarle el hocico', 'Gritarle o castigarle después', 'Dejarle suelto por toda la casa sin vigilancia', 'Quitarle el agua para que haga menos pis']
    },
    mordiscos: {
      titulo: 'Mordiscos: manos, muebles y cables',
      si: [
        'Morder es normal: está cambiando los dientes y explora con la boca. El objetivo es redirigir, no eliminar.',
        'Ten siempre un mordedor a mano. Cuando muerda tu mano, quédate quieto, retira la mano y ofrécele el mordedor.',
        'Si sigue, termina el juego 20–30 segundos (te levantas y te vas). Vuelve con calma.',
        'Muchos mordiscos son de sueño: si está muy "loco", probablemente necesita una siesta. Llévale a su zona.',
        'Protege cables y patas de muebles (canaletas, protectores) y quita de su alcance lo que no pueda morder.',
        'Varía los mordedores (texturas distintas) y usa juguetes rellenables congelados para las encías.'
      ],
      no: ['Darle golpecitos en el hocico', 'Cerrarle la boca a la fuerza', 'Jugar con las manos desnudas', 'Usar sprays o collares que asustan']
    },
    noches: {
      titulo: 'Noches: que dormáis los dos',
      si: [
        'Las primeras semanas, su cama o transportín cerca de tu cama: que te oiga y te huela.',
        'Una prenda con tu olor y una bolsa de agua tibia envuelta en una toalla le dan seguridad.',
        'Última salida a hacer pis justo antes de acostaros y cena al menos 2 horas antes.',
        'Si llora de noche, primero descarta el pis: sácale sin hablar ni jugar y de vuelta a la cama.',
        'Si ya ha hecho pis y llora, una mano cerca o una voz tranquila; no le saques a jugar.',
        'Cada pocas noches, aleja la cama unos centímetros hacia donde queráis que duerma de mayor.',
        'De día, siestas en el mismo sitio para que asocie la cama con descanso.'
      ],
      no: ['Dejarle llorar solo en otra habitación desde la primera noche', 'Encender luces y jugar a las 3 de la mañana', 'Cansarle mucho justo antes de dormir']
    },
    solo: {
      titulo: 'Quedarse solo sin llantos',
      si: [
        'Empieza con ausencias de segundos: sales de la habitación, vuelves antes de que llore. Sube poco a poco.',
        'Prepara una zona segura (parque o habitación) con agua, cama, empapador y un juguete rellenable.',
        'Dale el juguete rellenable solo cuando te vas: que tu salida anuncie algo bueno.',
        'Salidas y llegadas aburridas: nada de despedidas largas ni fiestas al volver.',
        'Antes de irte: pis, un rato de juego y algo de calma. Un cachorro cansado y tranquilo lo lleva mejor.',
        'Si va a estar solo muchas horas, organiza que alguien pase a sacarle a media jornada.',
        'Si los llantos o destrozos son intensos y duran semanas, consulta con un educador canino.'
      ],
      no: ['Irte a escondidas', 'Regañarle al volver por lo que ha roto', 'Dejarle de golpe toda la jornada el primer día']
    }
  };

  // ---------- Socialización (8 semanas de plan) ----------
  var SOCIALIZACION = [
    { semana: 1, foco: 'Casa y familia', items: ['Conocer a todos los de casa con calma', 'Ruidos de casa: aspiradora lejos, lavadora, timbre', 'Que le toquen patas, orejas y boca con premio', 'Superficies: suelo, alfombra, toalla, baldosa'] },
    { semana: 2, foco: 'Sonidos', items: ['Ruidos de calle desde casa o en brazos', 'Grabaciones de tráfico, truenos y petardos a volumen bajo mientras come', 'Ascensor y escalera en brazos', 'Ver gente con gorra, paraguas y gafas'] },
    { semana: 3, foco: 'Personas', items: ['3 personas nuevas que le den un premio', 'Niños tranquilos (siempre supervisados)', 'Ver bicicletas y patinetes a distancia', 'Visita al veterinario solo para dar premios'] },
    { semana: 4, foco: 'Lugares', items: ['Un café con terraza tranquilo, en brazos o en su manta', 'Coche: 5 minutos sentado sin arrancar y luego un trayecto corto', 'Portal y calle a horas tranquilas', 'Arnés y correa en casa con premios'] },
    { semana: 5, foco: 'Otros perros', items: ['Un perro adulto vacunado y equilibrado que conozcas', 'Clase o grupo de cachorros si tu veterinario lo aprueba', 'Ver perros a distancia sin saludar', 'Cortar el saludo si alguien se agobia'] },
    { semana: 6, foco: 'Manejo', items: ['Cepillado corto con premio', 'Tocarle las uñas', 'Revisarle los dientes', 'Secarle con toalla y secador a distancia'] },
    { semana: 7, foco: 'Ciudad', items: ['Una calle con más tráfico, a distancia', 'Transporte público si lo vas a usar', 'Sentarse a mirar el mundo 10 minutos', 'Tiendas que admitan perros'] },
    { semana: 8, foco: 'Repaso', items: ['Repite lo que más le costó', 'Un sitio nuevo cada día, poco rato', 'Juego con otro cachorro', 'Celebra lo aprendido'] }
  ];

  // ---------- Calendario de salud (sin pauta veterinaria) ----------
  var SALUD = {
    aviso: 'Este calendario es un recordatorio, no una pauta veterinaria. Las vacunas, la desparasitación y la alimentación las decide tu veterinario.',
    items: [
      'Primera visita al veterinario en la primera semana en casa, aunque venga vacunado.',
      'Lleva su cartilla o pasaporte: el veterinario te dirá qué vacunas y desparasitaciones tocan y cuándo.',
      'Pregunta cuándo puede pisar la calle y relacionarse con otros perros.',
      'Pregunta por la vacuna antirrábica: es obligatoria en la mayoría de comunidades autónomas.',
      'Pregunta qué cantidad de comida le corresponde por edad y tamaño.',
      'Apunta en el calendario la fecha de cada próxima cita en cuanto salgas de la consulta.'
    ]
  };

  // ---------- Checklist legal ----------
  // Prudente a propósito: los reglamentos de la Ley 7/2023 siguen pendientes.
  var LEGAL = {
    revisado: REVISADO,
    aviso: 'Revisado el ' + REVISADO + '. La Ley 7/2023 de bienestar animal tiene partes que aún dependen de reglamentos. Confirma los detalles con tu veterinario o tu ayuntamiento.',
    items: [
      { id: 'chip', texto: 'Microchip puesto por un veterinario e inscrito a tu nombre', estado: 'Obligatorio en todas las comunidades autónomas.' },
      { id: 'registro', texto: 'Inscripción en el registro de animales de tu comunidad o ayuntamiento', estado: 'Obligatoria. Suele hacerla el veterinario al poner el chip; compruébalo.' },
      { id: 'rabia', texto: 'Vacuna antirrábica', estado: 'Obligatoria en la mayoría de comunidades. Tu veterinario te dirá cuándo.' },
      { id: 'seguro', texto: 'Seguro de responsabilidad civil', estado: 'Lo prevé la Ley 7/2023; su desarrollo reglamentario está pendiente. Infórmate antes de contratar.' },
      { id: 'curso', texto: 'Curso de tenencia responsable', estado: 'Lo prevé la ley. El curso oficial será gratuito y telemático; este plan no lo sustituye.' },
      { id: 'ppp', texto: 'Si es de una raza considerada potencialmente peligrosa, licencia y seguro específicos', estado: 'Depende de la normativa de tu comunidad.' }
    ]
  };

  var COMUNIDADES = ['Andalucía', 'Aragón', 'Asturias', 'Islas Baleares', 'Canarias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Comunidad de Madrid', 'Comunidad Valenciana', 'Extremadura', 'Galicia', 'La Rioja', 'Murcia', 'Navarra', 'País Vasco', 'Ceuta', 'Melilla'];

  var PROBLEMAS = { pis: 'Pis y caca en casa', mordiscos: 'Mordiscos', noches: 'Las noches', solo: 'Quedarse solo' };

  var api = {
    REVISADO: REVISADO, TAMANOS: TAMANOS, TRAMOS: TRAMOS, PARAMS: PARAMS,
    PROTOCOLOS: PROTOCOLOS, SOCIALIZACION: SOCIALIZACION, SALUD: SALUD, LEGAL: LEGAL,
    COMUNIDADES: COMUNIDADES, PROBLEMAS: PROBLEMAS,
    tramoPorEdad: tramoPorEdad, rutinaDiaria: rutinaDiaria, RASGOS: RASGOS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PLANTILLAS = api;
})(this);
