# Emails

Variables: `{{nombre_cachorro}}`, `{{problema}}`, `{{enlace_plan}}`, `{{enlace_test}}`, `{{marca}}`.
Todos los emails terminan con la firma, el enlace de baja y "Responde a este email si necesitas algo".

---

## A. Quien no compra (3 emails en 5 días)

Solo a quien marcó el consentimiento comercial (`node scripts/exportar-leads.js no-compradores`).

### Día 0, al momento · El resultado de {{nombre_cachorro}}

**Asunto:** La rutina de mañana para {{nombre_cachorro}}
**Preheader:** Pruébala mañana tal cual

Hola:

Aquí tienes la rutina que te hemos preparado para {{nombre_cachorro}}. Pruébala mañana tal cual, sin cambiar nada, y fíjate en una cosa: cuántos pis hace en el sitio bueno.

[Ver la rutina de {{nombre_cachorro}}]({{enlace_test}})

Un truco que funciona desde el primer día: sácale siempre en los 5 momentos clave (al despertar, después de comer, después de jugar, después de una emoción y antes de dormir).

### Día 2 · Consejo sobre su problema

**Asunto:** Lo que casi todo el mundo hace mal con {{problema}}
**Preheader:** Y lo que funciona en su lugar

Hola:

Nos dijiste que lo que más te preocupa es {{problema}}. El error más común es reaccionar después: regañar cuando ya ha pasado. A un cachorro eso no le enseña nada, solo le asusta.

Lo que sí funciona es adelantarse: [3 pasos del protocolo, sacados de `plantillas.js` según el problema].

Esto es una parte del plan de 8 semanas de {{nombre_cachorro}}. El plan completo lo tienes aquí: [Ver el plan]({{enlace_test}})

### Día 5 · Último recordatorio

**Asunto:** El plan de {{nombre_cachorro}} sigue aquí
**Preheader:** 8 semanas, un email al día, garantía de 14 días

Hola:

Las primeras 8 semanas en casa son las que más cuentan. Lo que aprende ahora (dónde hacer pis, qué se puede morder, cómo estar solo) se queda.

El plan de {{nombre_cachorro}} incluye su rutina semana a semana, los 4 protocolos, la socialización y un email cada día con la tarea del día. Si no te sirve, te devolvemos el dinero en 14 días, sin preguntas.

[Quiero el plan de {{nombre_cachorro}}]({{enlace_test}})

---

## B. Compradores

### Entrega (< 24 h tras el pago, a mano en la fase 2)

**Asunto:** El plan de {{nombre_cachorro}} está listo
**Preheader:** Empieza hoy por la semana 1

Hola:

Ya tienes el plan de 8 semanas de {{nombre_cachorro}}:

[Abrir el plan de {{nombre_cachorro}}]({{enlace_plan}})

Te recomendamos empezar por la sección de {{problema}}, que es tu prioridad. Desde mañana te llegará cada día un email corto con la tarea del día: es lo que hace que el plan se cumpla.

Para guardarlo en PDF, abre el plan y usa "Imprimir → Guardar como PDF".

Recuerda: tienes 14 días de garantía. Si no te sirve, responde a este email.

### Diario (días 1–56)

Las tareas están en `content/tareas-diarias.js`, con `{n}` como nombre del cachorro.

**Asunto:** Día {{dia}}: {{titulo}}
**Preheader:** 5 minutos hoy con {{nombre_cachorro}}

Hola:

**Tarea de hoy: {{titulo}}**
{{tarea}}

¿Te atascas? Responde a este email y te ayudamos.

[Ver el plan completo]({{enlace_plan}})

### Encuestas (H4)

**Día 7 · Asunto:** ¿Os está sirviendo el plan? (1 clic)
Pregunta: "Del 1 al 10, ¿cuánto te está sirviendo el plan de {{nombre_cachorro}}?" con 10 enlaces de un clic (por ejemplo, a un formulario con la nota precargada) y un campo opcional: "¿Qué cambiarías?".

**Día 21 · Asunto:** 3 semanas con el plan: ¿cómo va {{nombre_cachorro}}?
Repite la misma pregunta del 1 al 10 y añade: "¿Ha mejorado {{problema}}? Sí / Un poco / No".

Se cuenta como "útil" una nota de 8 o más. Hacen falta al menos 20 respuestas para decidir la puerta 3.
