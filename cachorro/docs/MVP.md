# MVP — Plan de tu cachorro (España)

Nov 7, 2026 · @Lukas

## Resumen

Vendemos un plan personalizado de 8 semanas para dueños primerizos de cachorro en España, por 19,99 € en pago único. Lo generamos con IA a partir de un formulario de 2 minutos. La captación entra por un test gratuito, “¿Tu perro está en regla?”, que aprovecha la confusión con la Ley 7/2023. La base de emails que deja se monetiza después con seguros.

La regla de este proyecto es no construir nada que no haya demostrado demanda antes. Hay tres puertas y solo se pasa a la siguiente si se cumple el criterio:

1. **Puerta 1, interés:** el anuncio genera clics baratos y la gente completa el formulario. Coste por formulario completado ≤ 0,75 €.
2. **Puerta 2, pago:** al menos un 5% de quienes completan el formulario paga 19,99 €, con 30 ventas como mínimo antes de decidir. Equivale a un CAC ≤ 16 €, que es la condición que manda: si el coste por formulario sale más alto, hace falta más conversión para compensarlo.
3. **Puerta 3, valor:** menos de un 5% de reembolsos y al menos 8 de cada 10 compradores dicen que el plan les ha servido, con un mínimo de 20 respuestas a la encuesta.

Las puertas 1 y 2 están ligadas: con 1 € por formulario y un 5% de compra, el CAC sería de 20 € y cada venta perdería unos 4 €. Por eso el umbral de la puerta 1 es 0,75 €.

Si una puerta falla, se cambia una sola variable (mensaje, precio u oferta) y se repite. Si falla dos veces, se cierra el proyecto. Las cifras son hipótesis de partida para el test, no datos de mercado.

## Hipótesis a validar y riesgos principales

El mayor riesgo no es técnico: es que la gente no pague por algo que cree encontrar gratis en YouTube o en apps. Por eso las hipótesis se prueban en orden de riesgo, de mayor a menor.

| # | Hipótesis | Cómo se prueba | Se da por válida si |
| --- | --- | --- | --- |
| H1 | Los dueños de cachorro en España hacen clic en un anuncio sobre un problema concreto (pis, mordiscos, noches) | Test de anuncios en Meta | CTR ≥ 1,5% y CPC ≤ 0,30 € |
| H2 | Completan un formulario de 2 minutos sobre su cachorro | Landing con formulario | ≥ 40% de quienes llegan lo completan |
| H3 | Pagan 19,99 € por un plan personalizado | Paywall real con Stripe | ≥ 5% de quienes completan el formulario compran |
| H4 | El plan les resulta útil | Encuesta a los 7 y 21 días, y reembolsos | ≥ 8/10 útil y < 5% de reembolsos |
| H5 | El test “¿En regla?” capta emails baratos | Segunda campaña con ese gancho | Coste por email ≤ 1 € |
| H6 | Una parte de esos emails pide precio de seguro | Botón “Quiero comparar seguros” en el resultado | ≥ 5% hace clic |

H5 y H6 son el negocio de fondo, pero se prueban después: sin H1–H3 no hay audiencia que monetizar.

## Cliente objetivo y sus pain points

El cliente es quien tiene su primer cachorro desde hace 0–10 semanas, vive en un piso y trabaja fuera de casa parte del día. Está cansado, duerme mal y se siente culpable si algo sale mal. Ese momento de agobio es cuando paga.

Pain points por orden de urgencia (hipótesis a confirmar con los clics del test):

1. **Pis y caca en casa:** el problema más visible y diario.
2. **Mordiscos:** manos, muebles y cables.
3. **Noches:** llora en la cama o en el transportín y nadie duerme.
4. **Quedarse solo:** llantos y destrozos cuando se va a trabajar.
5. **Rutina:** cuánto debe dormir, comer y pasear un cachorro de su edad y raza.
6. **Papeleo y salud:** vacunas, desparasitación, microchip, seguro y qué dice la ley.

Perfil secundario: dueños de perros adultos que solo quieren saber si cumplen la ley. Entran por el test “¿En regla?” y son el público de los seguros, no del plan.

## Competencia y posicionamiento

En una primera búsqueda no hemos encontrado nadie que ofrezca un plan personalizado para el cachorro concreto del usuario, en pago único y adaptado a España. Ese es el hueco.

| Alternativa | Qué ofrece | Precio | Su punto débil frente a nosotros |
| --- | --- | --- | --- |
| Apps de adiestramiento ([Woofz](https://www.businessinsider.nl/my-first-dog-was-a-handful-so-i-built-the-training-app-of-my-dreams-it-became-a-20-million-business-and-were-still-growing/), Dogo) | Lecciones y ejercicios en app; Woofz factura unos 20 M$ al año | Suscripción ([unos 1,14 € por semana en plan anual](https://www.bug.hr/appdana/woofz-mobilni-vodic-za-odgoj-i-dresuru-pasa-uz-prilagodjene-programe-vjezbanja-63820) en un mercado europeo) | Suscripción recurrente, genérica y sin la parte legal española |
| [Cursos de cachorro en Hotmart](https://hotmart.com/es/marketplace/productos/curso-de-cachorros-miradacanina/C105534921F) | Vídeos de un educador | Variable | El mismo curso para todos; hay que verlo entero |
| [Cursos de adiestramiento](https://www.educaweb.com/curso/master-educacion-animal-tecnico-experto-adiestramiento-conducta-canina-on-line-367225/) | Formación de cientos de horas | 380–1.695 € | Pensados para profesionales, no para un dueño agobiado |
| Educador canino a domicilio | Sesiones presenciales | Alto (por sesión) | Caro y con cita; nosotros somos el paso previo o un complemento |
| YouTube y blogs | Consejos gratis | 0 € | Desordenado y contradictorio; no te dice qué hacer hoy con tu perro |

Posicionamiento en una frase: “El plan de los primeros 2 meses para tu cachorro, hecho para su raza, su edad y tu casa, en 2 minutos y por menos de 20 €”.

Competimos por inmediatez y personalización, no por cantidad de contenido.

## Oferta: producto, contenido, precio, garantía y upsells

Un único producto principal a 19,99 €, con una garantía que quite el miedo a pagar y un upsell que suba el ticket medio.

**Plan de tu cachorro (19,99 €, pago único).** Una página web privada (y su PDF) generada para ese perro, con:

- **Rutina diaria por edad:** horario de siestas, comidas, paseos, juego y salidas para hacer pis, que se actualiza semana a semana durante 8 semanas.
- **Plan anti-pis en casa:** pasos día a día adaptados a piso o casa con jardín.
- **Mordiscos, noches y quedarse solo:** un protocolo corto para cada uno, con qué hacer y qué no.
- **Ventana de socialización:** checklist de experiencias por semana (ruidos, personas, otros perros).
- **Calendario de salud:** recordatorio de vacunas y desparasitación, siempre como “consulta con tu veterinario”.
- **Checklist legal de tu comunidad:** microchip, registro, seguro y estado del curso obligatorio.
- **Emails diarios durante 8 semanas** con la tarea del día; es lo que hace que el plan se cumpla.

**Garantía:** devolución del 100% en 14 días sin preguntas. Reduce la fricción al pagar y nos da el dato de valor (H4).

**Upsell tras el pago (propuesta: 9,99 €):** “Pack problema” de un comportamiento concreto en profundidad, como ansiedad por separación o tirar de la correa. Se ofrece con un clic, sin volver a meter la tarjeta.

**Más adelante, solo si se pasan las puertas:** comparador de seguros, recordatorios de salud continuos y un plan para la etapa adolescente (6–12 meses).

Lo que no entra en el MVP: app nativa, vídeos propios, chat con educador ni consejos de alimentación o salud más allá de “consulta a tu veterinario”.

## Funnel y pantallas: del anuncio a la entrega

El funnel copia la estructura que usan las apps que escalan con publicidad: formulario largo y personal antes del precio, porque cada respuesta aumenta el compromiso.

1. **Anuncio:** un problema concreto (“¿Tu cachorro sigue haciendo pis en casa?”) y CTA “Haz el test gratis”.
2. **Formulario (10–12 pantallas, una pregunta por pantalla):** nombre del cachorro, raza o tamaño adulto, edad en semanas, piso o casa con jardín, horas que pasa solo al día, tu mayor problema ahora (pis, mordiscos, noches, quedarse solo), quién vive en casa (niños, otros animales), comunidad autónoma y email.
3. **Pantalla de “preparando tu plan”** con resumen del perfil (“Luna, 10 semanas, piso, 6 h sola”).
4. **Resultado gratis:** un adelanto real y útil, que es la rutina de mañana para su cachorro y el checklist legal resumido. Debajo, el plan completo bloqueado.
5. **Paywall:** qué incluye, precio 19,99 €, garantía de 14 días y pago con tarjeta, Apple Pay o Google Pay.
6. **Upsell de un clic** tras el pago.
7. **Entrega inmediata:** página privada del plan, PDF y comienzo de los emails diarios.
8. **Quien no compra:** 3 emails en 5 días con consejos gratis y un recordatorio del plan.

El email se pide antes del resultado: aunque no compre, ese lead sirve para medir H5 y H6 más adelante.

## Economía unitaria: supuestos y CAC máximo

A 19,99 € cada comprador deja unos 16 € netos, así que necesitamos que compre al menos un 5% de quienes completan el formulario. A 14,99 € haría falta más de un 6%, que es demasiado exigente para empezar. Por eso el precio base pasa a 19,99 € y el test compara precios.

| Concepto | Supuesto | Valor por comprador |
| --- | --- | --- |
| Precio con IVA | 19,99 € | 19,99 € |
| Precio sin IVA (21%) | — | 16,52 € |
| Comisión de pago | Aprox. 1,5% + 0,25 € | −0,55 € |
| IA y emails | Menos de 0,20 € por plan | −0,20 € |
| Upsell 9,99 € | Lo compra el 15% (unos 7,90 € netos cada uno) | +1,19 € |
| Reembolsos | 5% de las ventas (la comisión de Stripe no se devuelve) | −0,85 € |
| **Ingreso neto por comprador** | — | **≈ 16,1 €** |

Con esa cifra, el coste máximo por comprador (CAC) para no perder dinero es de unos 16 €. El margen en el escenario base es de solo 1 € por comprador: el negocio del plan, por sí solo, apenas cubre la captación, y el beneficio tiene que venir de mejorar la conversión, del upsell y de la base de emails. El funnel tiene que dar algo así:

| Paso | Supuesto | Resultado |
| --- | --- | --- |
| Clic en el anuncio | CPC 0,30 € | — |
| Completa el formulario | 40% de quienes llegan | 0,75 € por formulario |
| Compra | 5% de quienes completan | CAC ≈ 15 € |

Todos estos valores son hipótesis de partida y el test sirve para sustituirlos por datos reales. Lo que no está en la cuenta es el valor de los emails de quien no compra (seguros, recordatorios): es el margen de seguridad, no la base del negocio.

## Plan de validación por fases con criterios de go/no-go

Vendemos antes de automatizar: las primeras ventas se entregan “a mano” (con Claude y revisión humana) en menos de 24 horas. Así validamos que la gente paga y que el plan sirve gastando unos 1.300–1.600 € y sin construir el producto entero. Con 600 € no llegaba: 30 ventas por precio y 2 precios son 60 ventas, unos 1.200 formularios y unos 900 € solo para la fase 1b.

| Fase | Semanas | Qué se hace | Presupuesto | Pasa si |
| --- | --- | --- | --- | --- |
| 0. Contenido base | 1 | Escribir las plantillas del plan (rutinas por edad y tamaño, protocolos) y que las revise un educador canino titulado; entrevistar a 10 dueños de cachorro | 150–300 € (revisión) | El educador valida el contenido; las entrevistas confirman el top 3 de problemas |
| 1a. Demanda | 2 | Landing, formulario y paywall real con Stripe a 19,99 €; 5 ángulos de anuncio en Meta | 300 € en anuncios | Puerta 1: ≤ 0,75 € por formulario; se eligen 1–2 ángulos ganadores |
| 1b. Pago y precio | 3–4 | Solo los ángulos ganadores; test de precio 19,99 / 24,99 € (14,99 € solo si 19,99 € no llega al 5%) | 700–1.000 € en anuncios | Puerta 2: ≥ 5% de compra y CAC ≤ 16 €, con 30 ventas por precio |
| 2. Valor | 3–6 | Entrega manual en < 24 h; emails diarios con una herramienta de email marketing; encuestas a los 7 y 21 días | 0 € extra | Puerta 3: < 5% de reembolsos y ≥ 8/10 útil |
| 3. Automatizar | 6–8 | Claude Code: generación automática del plan, página privada, secuencia de emails y upsell | Tu tiempo | Que el plan automático puntúe igual que el manual en una muestra de 10 |
| 4. Escalar y monetizar | 9 en adelante | Subir presupuesto en escalones del 20–30%; lanzar el gancho “¿En regla?” y el botón de seguros | 1.500–3.000 € al mes | CAC ≤ ingreso neto por comprador; H5 y H6 |

**Reglas para no engañarnos:**

- Se decide con un mínimo de datos: 1.000 clics por ángulo para la puerta 1, y 30 ventas por precio para la puerta 2. Una variante se puede cortar antes si con 500 clics su coste por formulario dobla el umbral.
- Solo se cambia una variable cada vez: primero el ángulo (1a), luego el precio (1b), nunca los dos a la vez.
- Si la Puerta 2 falla con los precios probados y dos ángulos de anuncio distintos, se cierra el proyecto o se pivota la oferta, no se “mejora el diseño”.
- Cada venta de la fase 1 se entrega de verdad: nada de cobrar por un producto que no existe.

## Creatividades y mensajes para el test

Cinco ángulos, uno por problema, para que los propios clics nos digan qué dolor vende más. Cada ángulo lleva dos formatos: un vídeo vertical corto (UGC grabado con un cachorro real) y una imagen estática.

| Ángulo | Gancho del anuncio | Promesa |
| --- | --- | --- |
| Pis en casa | “¿Tu cachorro sigue haciendo pis en el salón?” | Plan día a día para tu piso y su edad |
| Noches | “Si tu cachorro llora toda la noche, no es culpa suya” | Rutina de sueño para que dormáis los dos |
| Mordiscos | “Manos, sofá, cables… ¿te suena?” | Qué hacer (y qué no) cuando muerde |
| Quedarse solo | “Trabajas fuera y tu cachorro llora cuando te vas” | Plan para que aprenda a estar solo |
| Rutina | “¿Cuánto debe dormir un cachorro de 10 semanas?” | Su horario ideal de siestas, comidas y paseos |

Normas para todas las piezas:

- El CTA siempre es “Haz el test gratis”, nunca “Compra”.
- Nada de castigos ni métodos aversivos; según Woofz, [quien llega por anuncios sobre no castigar al perro retiene mejor](https://thinkwithgoogle.com/intl/en-emea/marketing-strategies/app-and-mobile/dog-training-app-awareness).
- Segmentación amplia en España, mayores de 25 años, y dejar que el algoritmo optimice al evento “formulario completado” (y luego a “compra” cuando haya 50 a la semana).
- Tu cachorra es material perfecto para los primeros vídeos.

## Riesgos legales y de producto

Ninguno de estos riesgos frena el test, pero cada uno tiene que estar resuelto antes de escalar.

| Riesgo | Por qué importa | Cómo lo cubrimos |
| --- | --- | --- |
| Consejo veterinario | Un consejo de salud o de alimentación mal dado puede hacer daño al animal | El plan solo da rutinas y educación; salud siempre como “consulta con tu veterinario”; contenido base revisado por un educador titulado |
| Calidad de la IA | Un plan generado puede contradecirse o inventar | La IA rellena plantillas revisadas, no escribe desde cero; revisión manual de una muestra cada semana |
| Información legal | La ley cambia y los reglamentos siguen pendientes ([estado a 1 de octubre de 2026](https://evitalios.com/familia/ley-bienestar-animal-perros/)) | Checklist con fecha de actualización visible y sin afirmar lo que aún no está regulado |
| Curso obligatorio | El oficial será [gratuito y telemático](https://www.elespanol.com/sociedad/20260629/vigor-ley-bienestar-animal-obliga-duenos-perros-realizar-curso-tenencia-responsable/1003744302439_0.html) | No vendemos ni insinuamos que el plan sustituya al curso oficial |
| Protección de datos | Pedimos email y datos del hogar | Aviso de privacidad, consentimiento separado para comunicaciones comerciales y para pasar datos a aseguradoras |
| Seguros | Comparar y derivar a aseguradoras es distribución de seguros | Antes de la fase 4, acuerdo con un corredor o aseguradora como colaborador; revisarlo con los abogados |
| Derecho de desistimiento | En contenido digital se pierde si el cliente lo acepta expresamente al comprar | Casilla de aceptación en el pago, aunque nuestra garantía de 14 días vaya más allá |

## Decisiones abiertas y siguientes pasos

Antes de la fase 0 hay que cerrar tres decisiones; el resto se puede hacer esta misma semana.

Decisiones abiertas:

- Nombre de marca y dominio.
- Con qué educador canino titulado trabajamos la revisión del contenido y en qué condiciones (pago fijo o porcentaje).
- Herramienta para la fase 1: una landing rápida con Claude Code y Stripe, o una herramienta de formularios tipo quiz.

Siguientes pasos:

- [ ] Elegir nombre y comprar el dominio
- [ ] Escribir las plantillas del plan para 3 tamaños de perro y 4 tramos de edad
- [ ] Encontrar al educador canino y cerrar la revisión
- [ ] Hacer 10 entrevistas cortas a dueños de cachorro
- [ ] Grabar los primeros vídeos con tu cachorra
- [ ] Montar landing, formulario y paywall para la fase 1
- [ ] Lanzar la fase 1a con 300 € y revisar a los 7 días; después la 1b con 700–1.000 €

Material preparado en este repositorio: landing con formulario y paywall (`cachorro/`), plantillas del plan, emails, anuncios, guion de entrevistas, brief para el educador y procedimiento de entrega manual. Ver `cachorro/README.md`.
