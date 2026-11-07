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

## Arquitectura

Repositorio propio. Usa las mismas cuentas que Vigila:

| Pieza | Dónde | Notas |
| --- | --- | --- |
| Web y API | Render (servicio Node, `render.yaml`) | Sin dependencias. `/salud` dice qué está conectado |
| Datos | Supabase de Vigila (`wwxlzvfxlfuodikcamlq`) | Tablas `pc_*`, RLS sin políticas: solo la service_role key entra. No toca las tablas de Vigila |
| Pagos | Stripe de Vigila | Pago único con `metadata.app=cachorro`; el webhook ignora lo que no es del cachorro |
| Emails | Resend de Vigila | Con el dominio del cachorro verificado. Envío diario con GitHub Actions (`enviar-emails.yml`) |
| Panel | `/admin.html` | Puertas 1, 2 y 3 en vivo, con `ADMIN_TOKEN` |

Sin claves, todo funciona en local: datos en `data/`, pagos simulados y emails desactivados.

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

1. **Ventas:** el panel `/admin.html` muestra las puertas. Pon el gasto de Meta para ver el coste por formulario y el CAC.
2. **Entregar cada venta (< 24 h):**
   ```bash
   node scripts/generar-plan.js cliente@email.com
   ```
   Revisa el borrador en la URL que imprime (con el prompt de revisión para Claude si quieres) y envíalo:
   ```bash
   node scripts/enviar-plan.js <token>
   ```
3. **Emails:** salen solos cada mañana. Para ver qué saldría hoy sin enviar nada:
   ```bash
   node scripts/enviar-emails.js --prueba
   ```

Los scripts usan Supabase si el `.env` tiene `SUPABASE_SERVICE_ROLE_KEY`.

## Límites conscientes (no construir antes de validar)

- **Entrega del plan:** borrador automático, revisión humana y envío con un comando. Saltarse la revisión (generación y envío sin intervención) es la fase 3.
- **Pack de upsell:** no hay contenido escrito todavía; se prepara con el educador si se vende.
