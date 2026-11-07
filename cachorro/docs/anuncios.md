# Anuncios para la fase 1a (Meta)

Cinco ángulos, uno por problema. Cada ángulo lleva un vídeo vertical (UGC con un cachorro real) y una imagen estática. El CTA siempre es **"Haz el test gratis"**. Nunca castigos ni métodos aversivos.

## Configuración de campaña

- **Objetivo:** Clientes potenciales optimizando al evento `Lead` del Pixel, que se dispara al completar el formulario. Cuando haya 50 compras a la semana, se pasa a optimizar a `Purchase`.
- **Estructura:** 1 campaña, 5 conjuntos de anuncios (uno por ángulo) con el mismo presupuesto (unos 60 € cada uno en la fase 1a). Así el gasto por ángulo es comparable.
- **Público:** España, mayores de 25 años, segmentación amplia y sin intereses. Ubicaciones Advantage+.
- **URL de destino**, con `a` = ángulo (la landing adapta el titular para que encaje con el anuncio):

```
https://TU-DOMINIO/?a=pis&utm_source=meta&utm_medium=paid&utm_campaign=fase1a&utm_content=pis_{{ad.name}}
```

Cambia `a=pis` por `noches`, `mordiscos`, `solo` o `rutina` en cada conjunto.

- **Gasto por ángulo:** cópialo de Ads Manager a `data/gasto.json` para que `node scripts/metricas.js` calcule el coste por formulario de cada uno.

## Ángulo 1 · Pis en casa (`a=pis`)

**Texto principal:** ¿Tu cachorro sigue haciendo pis en el salón? No es que no aprenda: a su edad aguanta muy poco y necesita salir en momentos concretos. Responde 12 preguntas y te damos gratis su rutina de mañana, con las horas exactas para sacarle.
**Titular:** El plan anti-pis para tu piso y su edad
**Descripción:** Test gratis · 2 minutos
**Vídeo (15–20 s):**
1. (0–3 s) Plano del empapador vacío y un charco al lado. Texto: "¿Otra vez?"
2. (3–10 s) Tú en el móvil haciendo el test; capturas de "¿Cuántas semanas tiene?" y "¿Piso o casa con jardín?".
3. (10–17 s) Pantalla de la rutina: "07:00 pis · 07:30 desayuno · 07:45 pis…". Texto: "Su rutina, hecha para su edad".
4. (17–20 s) Cachorro haciendo pis en el sitio bueno y premio. CTA: "Haz el test gratis".

**Estática:** foto del cachorro junto a un charco, con cara de culpable. Texto: "¿Sigue haciendo pis en casa? Su rutina de mañana, gratis".

## Ángulo 2 · Noches (`a=noches`)

**Texto principal:** Si tu cachorro llora toda la noche, no es culpa suya: acaba de separarse de su madre y no sabe dormir solo. Hay una forma de que dormáis los dos. Haz el test y recibe gratis su rutina adaptada a su edad.
**Titular:** Rutina de sueño para que dormáis los dos
**Vídeo:** reloj a las 3:12 y audio del cachorro llorando, luego tu cara de cansancio y "lo que nadie te cuenta del primer mes". Después, el test en el móvil, la rutina con la "última salida a las 22:30" y el cachorro dormido en su cama. CTA.
**Estática:** cachorro mirando a cámara de noche. Texto: "Las 3 de la mañana y sigue llorando".

## Ángulo 3 · Mordiscos (`a=mordiscos`)

**Texto principal:** Manos, sofá, cables… ¿te suena? Morder es normal: está cambiando los dientes. El truco no es castigar, sino redirigir. Haz el test gratis y descubre qué hacer (y qué no) con tu cachorro.
**Titular:** Qué hacer cuando tu cachorro muerde
**Vídeo:** montaje rápido de mordiscos (mano, zapatilla, cable). Texto: "¿Te suena?". Luego el test y el cachorro mordiendo un mordedor. CTA.
**Estática:** pata de sofá mordida. Texto: "Manos, sofá, cables…".

## Ángulo 4 · Quedarse solo (`a=solo`)

**Texto principal:** Trabajas fuera y tu cachorro llora cuando te vas. Se puede enseñar a estar solo, poco a poco y sin sufrir. Cuéntanos cuántas horas pasa solo y te damos un plan hecho para tu horario.
**Titular:** Un plan para que aprenda a estar solo
**Vídeo:** te pones el abrigo, el cachorro te mira y cierras la puerta. Desde fuera se oye el llanto. Texto: "Cada mañana igual". Luego el test con la pregunta "¿Cuántas horas se queda solo?" y el cachorro tranquilo con un juguete rellenable. CTA.
**Estática:** cachorro detrás de la puerta. Texto: "¿Llora cuando te vas a trabajar?".

## Ángulo 5 · Rutina (`a=rutina`)

**Texto principal:** ¿Cuánto debe dormir un cachorro de 10 semanas? (Spoiler: muchísimo más de lo que crees). Su horario de siestas, comidas y salidas depende de su edad y su tamaño. Haz el test y recibe el suyo gratis.
**Titular:** Su horario ideal, según su edad
**Vídeo:** pregunta en pantalla "¿Cuánto duerme un cachorro de 10 semanas?", con opciones 8 h, 12 h y 18 h. Revelación: unas 18–20 h. Luego el test y la rutina. CTA.
**Estática:** cachorro dormido. Texto: "¿Cuánto debe dormir un cachorro de 10 semanas?".

## Grabación con tu cachorra

- Graba en vertical (9:16), con luz natural y sonido real. Que no parezca un anuncio.
- 3–4 tomas por ángulo; los primeros 2 segundos son lo que más importa.
- Graba también reacciones tuyas a cámara ("esto me pasó a mí la primera semana").
- Nada que muestre al perro en una situación de estrés real prolongada.
