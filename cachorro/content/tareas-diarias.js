/*
 * 56 tareas diarias (8 semanas) para los emails diarios del plan.
 * BORRADOR PENDIENTE DE REVISIÓN por el educador canino.
 * {n} se sustituye por el nombre del cachorro.
 */
(function (root) {
  'use strict';
  var TAREAS = [
  // Semana 1 — Llegada y rutina
  { dia: 1,  titulo: 'Su zona segura', tarea: 'Monta la zona segura de {n}: cama, agua, empapador y un mordedor. Hoy solo descansa y explora poco a poco.' },
  { dia: 2,  titulo: 'Los 5 momentos de pis', tarea: 'Saca a {n} al despertar, después de comer, de jugar, de una emoción y antes de dormir. Apunta cada pis.' },
  { dia: 3,  titulo: 'Su nombre', tarea: 'Di "{n}" y, cuando te mire, premio. 10 veces, 3 veces al día. Nunca uses su nombre para regañar.' },
  { dia: 4,  titulo: 'Siestas', tarea: 'Cuenta cuánto duerme {n} hoy. Si está "loco" y muerde mucho, probablemente necesita una siesta.' },
  { dia: 5,  titulo: 'Manos que tocan', tarea: 'Toca patas, orejas y boca de {n} un segundo y dale un premio. Así las visitas al veterinario serán más fáciles.' },
  { dia: 6,  titulo: 'Primera ausencia', tarea: 'Sal de la habitación 10 segundos y vuelve antes de que llore. Repite 5 veces.' },
  { dia: 7,  titulo: 'Revisa la semana', tarea: 'Mira la tabla de pis: ¿a qué horas suele hacerlo? Ajusta las salidas para adelantarte.' },
  // Semana 2 — Pis y mordiscos
  { dia: 8,  titulo: 'Mordedor siempre a mano', tarea: 'Ten un mordedor en cada habitación. Cuando {n} muerda tu mano, quieto, retírala y ofrécele el mordedor.' },
  { dia: 9,  titulo: 'Sentado', tarea: 'Lleva un premio sobre su cabeza hacia atrás; cuando se siente, premio. 5 repeticiones, 3 veces.' },
  { dia: 10, titulo: 'Sonidos de casa', tarea: 'Pon la aspiradora en otra habitación mientras {n} come. Si está tranquilo, acércala un poco otro día.' },
  { dia: 11, titulo: 'Limpieza sin rastro', tarea: 'Limpia los accidentes con limpiador enzimático. Repasa los sitios donde ha repetido.' },
  { dia: 12, titulo: 'Ausencias de 1 minuto', tarea: 'Sal de casa 1 minuto con el juguete rellenable dentro. Vuelve sin fiesta.' },
  { dia: 13, titulo: 'El arnés', tarea: 'Enséñale el arnés, premio. Póntelo un segundo, premio. Quítalo. Hoy nada más.' },
  { dia: 14, titulo: 'Revisa la semana', tarea: '¿Menos accidentes que la semana pasada? Si no, adelanta 15 minutos cada salida.' },
  // Semana 3 — Noches y personas
  { dia: 15, titulo: 'Rutina de noche', tarea: 'Cena 2 horas antes de dormir, salida tranquila y a la cama. Misma hora cada día.' },
  { dia: 16, titulo: 'Personas nuevas', tarea: 'Que una persona nueva le dé un premio a {n} sin agobiarle. Si se esconde, respeta.' },
  { dia: 17, titulo: 'Ven', tarea: 'Di "ven" con voz alegre cuando ya venga hacia ti, y premio. Solo cuando sepas que vendrá.' },
  { dia: 18, titulo: 'La cama, un poco más lejos', tarea: 'Aleja su cama unos centímetros hacia donde quieres que duerma de mayor.' },
  { dia: 19, titulo: 'Visita feliz al veterinario', tarea: 'Pasa por la clínica solo para que le den un premio, si tu veterinario lo permite.' },
  { dia: 20, titulo: 'Ausencias de 5 minutos', tarea: 'Sube a 5 minutos fuera. Si llora mucho, vuelve al tiempo anterior unos días.' },
  { dia: 21, titulo: 'Revisa la semana', tarea: '¿Cuántas veces se despierta de noche? Apúntalo; debería ir bajando.' },
  // Semana 4 — Lugares
  { dia: 22, titulo: 'Coche sin arrancar', tarea: 'Siéntate 5 minutos en el coche con {n} y premios. Sin arrancar.' },
  { dia: 23, titulo: 'Correa en casa', tarea: 'Pasea por casa con la correa suelta. Premio cada vez que camine a tu lado.' },
  { dia: 24, titulo: 'Mirar el mundo', tarea: 'Siéntate con {n} 10 minutos en un portal o terraza tranquila. Solo mirar.' },
  { dia: 25, titulo: 'Quieto un segundo', tarea: 'Pídele "sentado", espera 1 segundo y premio. Sube a 3 segundos esta semana.' },
  { dia: 26, titulo: 'Superficies', tarea: 'Que pise 3 superficies nuevas: hierba, rejilla, madera. Sin forzar.' },
  { dia: 27, titulo: 'Ausencias de 15 minutos', tarea: 'Sube a 15 minutos. Antes, pis y un rato de juego.' },
  { dia: 28, titulo: 'Revisa el mes', tarea: 'Rellena la encuesta corta del plan: ¿qué ha mejorado y qué no?' },
  // Semana 5 — Otros perros
  { dia: 29, titulo: 'Un perro amigo', tarea: 'Presenta a {n} a un perro adulto tranquilo y vacunado que conozcas, en terreno neutral.' },
  { dia: 30, titulo: 'Ver sin saludar', tarea: 'Mira perros a distancia y premia a {n} cuando los mire tranquilo.' },
  { dia: 31, titulo: 'Suelta', tarea: 'Cambia un juguete por un premio diciendo "suelta". 5 veces.' },
  { dia: 32, titulo: 'Juego con pausas', tarea: 'Juega 1 minuto, pausa 10 segundos con "sentado", vuelve a jugar. Enseña a calmarse.' },
  { dia: 33, titulo: 'Clase de cachorros', tarea: 'Busca un grupo de cachorros en positivo cerca de casa si tu veterinario lo aprueba.' },
  { dia: 34, titulo: 'Ausencias de 30 minutos', tarea: 'Sube a 30 minutos con el juguete rellenable.' },
  { dia: 35, titulo: 'Revisa la semana', tarea: '¿Cómo reacciona con otros perros? Si se agobia, más distancia la próxima vez.' },
  // Semana 6 — Manejo
  { dia: 36, titulo: 'Cepillado', tarea: '30 segundos de cepillo y premio. Para antes de que se aburra.' },
  { dia: 37, titulo: 'Uñas', tarea: 'Toca una uña, premio. Solo tocar; el corte, con tu veterinario o peluquero al principio.' },
  { dia: 38, titulo: 'Dientes', tarea: 'Levanta el labio un segundo, premio.' },
  { dia: 39, titulo: 'Toalla y secador', tarea: 'Sécale con toalla y enciende el secador lejos, con premios.' },
  { dia: 40, titulo: 'Correa en la calle', tarea: 'En la calle, para cuando tire y avanza cuando la correa esté floja.' },
  { dia: 41, titulo: 'Ausencias de 1 hora', tarea: 'Sube a 1 hora si los pasos anteriores fueron bien.' },
  { dia: 42, titulo: 'Revisa la semana', tarea: '¿Se deja manipular mejor? Repite lo que más le cueste.' },
  // Semana 7 — Ciudad
  { dia: 43, titulo: 'Más tráfico', tarea: 'Pasea por una calle con más tráfico, a distancia, y vuelve a una tranquila.' },
  { dia: 44, titulo: 'Transporte', tarea: 'Si vas a usar transporte público, una parada en su transportín o en brazos.' },
  { dia: 45, titulo: 'Tienda', tarea: 'Entra en una tienda que admita perros. 2 minutos y fuera.' },
  { dia: 46, titulo: 'Ven con distracciones', tarea: 'Practica "ven" en un parque vallado con una correa larga.' },
  { dia: 47, titulo: 'Tumbado', tarea: 'Desde "sentado", baja un premio al suelo; cuando se tumbe, premio.' },
  { dia: 48, titulo: 'Rato de calma', tarea: 'Sentaos en una terraza 10 minutos. Premia que se tumbe tranquilo.' },
  { dia: 49, titulo: 'Revisa la semana', tarea: '¿Qué situación le cuesta más? Anótala para la semana que viene.' },
  // Semana 8 — Repaso
  { dia: 50, titulo: 'Repaso de pis', tarea: '¿Quedan accidentes? Vuelve a la tabla 3 días para ver el patrón.' },
  { dia: 51, titulo: 'Repaso de mordiscos', tarea: 'Comprueba que siempre tiene mordedores variados a mano.' },
  { dia: 52, titulo: 'Repaso de noches', tarea: '¿Duerme ya donde quieres? Si no, sigue alejando la cama poco a poco.' },
  { dia: 53, titulo: 'Repaso de soledad', tarea: 'Prueba la ausencia más larga que necesites en tu rutina real.' },
  { dia: 54, titulo: 'Lo que más le costó', tarea: 'Dedica hoy la socialización a la situación que anotaste el día 49.' },
  { dia: 55, titulo: 'Truco nuevo', tarea: 'Enseña algo divertido: "choca" o dar la vuelta. Solo juego.' },
  { dia: 56, titulo: '¡Lo habéis conseguido!', tarea: 'Mira cómo era {n} el primer día y cómo es hoy. Rellena la encuesta final.' }
];
  if (typeof module !== 'undefined' && module.exports) module.exports = TAREAS;
  else root.TAREAS = TAREAS;
})(this);
