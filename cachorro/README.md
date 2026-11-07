# Plan de tu cachorro: MVP fase 0–2

Todo lo necesario para validar las puertas 1, 2 y 3 del [documento del MVP](docs/MVP.md), sin construir el producto automático.

## Qué hay

| Archivo | Para qué |
| --- | --- |
| `docs/MVP.md` | Plan del MVP, con las puertas, el presupuesto y la fase 1 corregidos |
| `docs/fase0.md` | Brief para el educador canino y guion de las 10 entrevistas |
| `docs/anuncios.md` | 5 ángulos con textos, guiones de vídeo, estáticas, configuración de Meta y URLs |
| `docs/entrega-manual.md` | Procedimiento para entregar cada venta en < 24 h y gestionar reembolsos |
| `content/plantillas.js` | Plantillas del plan (3 tamaños × 4 tramos de edad), protocolos, socialización, salud y checklist legal. **Borrador pendiente del educador** |
| `content/tareas-diarias.js` | Las 56 tareas de los emails diarios |
| `content/emails.md` | Emails para quien no compra (3 en 5 días), de entrega, diarios y encuestas de los días 7 y 21 |
| `server.js` + `public/` | Landing adaptada al ángulo, formulario de 12 pantallas, resultado gratis, paywall con Stripe, upsell de un clic y página privada del plan |
| `scripts/generar-plan.js` | Borrador del plan de un comprador, más un prompt de revisión para Claude |
| `scripts/metricas.js` | Funnel por ángulo y por precio, comparado con las puertas |
| `scripts/exportar-leads.js` | CSV para la herramienta de email (compradores, no compradores y seguros), respetando los consentimientos |

## Arrancar

Requiere Node 18 o superior y no tiene dependencias.

```bash
cp .env.example .env
```

```bash
node server.js
```

Sin `STRIPE_SECRET_KEY` arranca en **modo demo**: los pagos se simulan y puedes recorrer el funnel entero. Prueba los titulares de cada ángulo con `http://localhost:3000/?a=pis` (o `noches`, `mordiscos`, `solo`, `rutina`).

## Poner en producción (fase 1a)

1. **Dominio y hosting:** cualquier servidor con Node (Render, Railway, Fly.io, un VPS…) y disco persistente para `data/`. Pon `BASE_URL` con tu dominio.
2. **Stripe:**
   - Prueba primero con `sk_test_...`.
   - Activa Apple Pay y Google Pay en Configuración → Métodos de pago.
   - Crea un webhook a `https://TU-DOMINIO/api/webhook` con los eventos `checkout.session.completed` y `charge.refunded`, y copia su secreto a `STRIPE_WEBHOOK_SECRET`.
   - El upsell guarda la tarjeta (`setup_future_usage=off_session`) y la cobra sin volver a pedirla.
3. **Meta Pixel:** pon `META_PIXEL_ID`. Se carga solo si el visitante acepta las cookies y envía `Lead` (formulario completado), `InitiateCheckout` y `Purchase`.
4. **Legal:**
   - `public/privacidad.html` y `public/condiciones.html` son **borradores**: revísalos con los abogados.
   - Rellena `TITULAR` y `EMAIL_CONTACTO`.
   - El paywall exige la casilla de renuncia al desistimiento y la guarda en el pedido.
5. **Precios:**
   - Fase 1a: `PRECIOS=1999`.
   - Fase 1b: `PRECIOS=1999,2499`. Cada visitante ve siempre el mismo precio, y `metricas.js` separa los resultados por precio.

## Día a día

```bash
node scripts/metricas.js
```

```bash
node scripts/generar-plan.js cliente@email.com
```

```bash
node scripts/exportar-leads.js compradores > compradores.csv
```

Para las métricas, copia antes el gasto por ángulo de Meta a `data/gasto.json`.

## Límites conscientes (no construir antes de validar)

- **Almacenamiento:** archivos JSONL en `data/`, suficiente para cientos de leads. Se pasa a una base de datos en la fase 3.
- **Entrega del plan:** manual, con borrador automático y revisión humana. La generación con IA y los emails automáticos son la fase 3.
- **Emails:** se envían desde tu herramienta de email marketing importando los CSV. No hay integración directa.
- **Pack de upsell:** no hay contenido escrito todavía; se prepara con el educador si se vende.
