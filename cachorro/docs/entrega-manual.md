# Procedimiento de entrega manual (fases 1 y 2)

Objetivo: cada venta se entrega en menos de 24 horas, revisada por una persona. Tiempo estimado: unos 10 minutos por plan.

## Cada mañana y cada tarde

1. **Mira las ventas nuevas:**
   ```bash
   grep '"tipo":"plan"' data/pedidos.jsonl | tail
   ```
   Comprueba que también aparecen en el panel de Stripe (Pagos).

2. **Genera el borrador:**
   ```bash
   node scripts/generar-plan.js cliente@email.com
   ```
   El comando imprime la URL privada (`/plan/<token>`) y un prompt de revisión.

3. **Revisa el borrador:**
   - Ábrelo en el navegador y léelo como si fueras el cliente.
   - Pega en Claude el prompt de revisión junto al HTML (`data/planes/<token>.html`). Aplica solo los cambios que tengan sentido y nunca añadas consejos de salud.
   - Comprueba en concreto: que el nombre es correcto, que los horarios son posibles con las horas que pasa solo, y que la sección prioritaria es su problema.
   - Si hay que editar, edita el HTML directamente.

4. **Genera el PDF:** abre la URL privada y usa "Imprimir → Guardar como PDF".

5. **Envía el email de entrega** (`content/emails.md`, sección B) con el enlace y el PDF adjunto.

6. **Da de alta al cliente en la secuencia diaria:**
   ```bash
   node scripts/exportar-leads.js compradores > compradores.csv
   ```
   Importa el CSV en la herramienta de email marketing.

7. **Si compró el pack de upsell:** envíalo también. En la fase 1 se prepara a mano con el educador; si aún no está listo, avisa al cliente de que le llega en 72 horas.

## Reembolsos

- Cualquier petición en los 14 días: reembolsa en Stripe sin preguntas. El webhook lo registra en `data/reembolsos.jsonl`.
- Pregunta, opcionalmente: "¿Qué esperabas que no encontraste?". Anota la respuesta: es el mejor dato de la fase 2.
- Da de baja al cliente de la secuencia diaria.

## Cada semana

- Ejecuta `node scripts/metricas.js` y anota los resultados en el documento del MVP.
- Revisa una muestra de 3 planes enviados con el educador.
