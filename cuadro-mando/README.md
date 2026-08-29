# Cuadro de Mando · Patrimonio de Inversión

Handoff desde claude.ai a Claude Code, continuado y cerrado por Claude Code.

## Qué es esto

Dashboard de patrimonio personal (`index.html`, un único archivo autocontenido:
HTML + CSS + JS vanilla, sin build step). Dos pestañas:

- **Panel**: solo visualización (total, plusvalía latente/realizada/total,
  espectro de liquidez, distribución por titular, distribución por producto).
- **Movimientos**: tipo de cambio, sincronización con Supabase, formulario de
  alta de inversiones, y tablas editables por categoría (Acciones, ETF, Indexa
  Capital, Plan de Pensiones, Crowdfunding).

Cada fila de inversión tiene: Titular (Lukas personal / Whitenut / Lovicka),
Fecha, campos según categoría, Moneda (EUR/USD), Invertido, Valor actual,
Vendido (checkbox) + Fecha venta + Importe venta (para separar ganancia
latente de ganancia realizada).

## Backend: Supabase (datos — funciona)

- **Project ref**: `pnprzupnqpjqgtlqkrfd`
- **Project URL**: `https://pnprzupnqpjqgtlqkrfd.supabase.co`
- **anon/publishable key** (ya horneada dentro de `index.html`, es pública por
  diseño): `sb_publishable_KtVZaVnSCuSNVJG5qlYlUg_WAiHOoOj`
- **Tabla de datos**: `portfolio_holdings` — creada y en uso (RLS
  desactivado a propósito, es una herramienta de un solo usuario). Columnas:
  `categoria, titular, campo1, campo2, moneda, invertido, valor_actual, fecha,
  vencimiento, vendido, fecha_venta, importe_venta`.
- El dashboard sincroniza en vivo contra esa tabla vía `fetch()` directo a la
  REST API de PostgREST (`/rest/v1/portfolio_holdings`), con lógica en
  `serializeRows()` / `deserializeRows()` / `supabaseGet()` / `supabasePost()`
  dentro del `<script>` de `index.html`. Esta parte funciona sin cambios.

## Servir el dashboard como página web real — resuelto, pero no como se planeó

El plan original (tabla `app_files` + Edge Function `dashboard` sirviendo
`text/html`) **no es viable en Supabase**, y no era un problema de ejecución:
es una restricción de la plataforma. Verificado en producción:

- Confirmado en la documentación de Supabase: *"HTML content is not
  supported. GET requests that return `text/html` will be rewritten to
  `text/plain`. Edge Functions are designed for APIs and data processing,
  not serving web pages."*
- Se probó también subiendo `index.html` a un bucket público de Supabase
  Storage (`/storage/v1/object/public/...`): incluso ahí, el dominio
  compartido `*.supabase.co` reescribe el `Content-Type` a `text/plain` y
  añade `Content-Security-Policy: default-src 'none'; sandbox`. Es una
  protección anti-phishing a nivel de dominio compartido, no algo que se
  pueda desactivar sin un dominio propio (custom domain, de pago).
- Se dejó insertado el contenido real de `index.html` en la tabla
  `app_files` (name='dashboard') y la Edge Function `dashboard` desplegada
  leyendo de ahí — funciona igual de bien que cualquier otra alternativa,
  pero **sirve el HTML como texto plano, no renderizado**. Se mantiene por
  si en el futuro Supabase soporta un dominio propio; no borrarlo no cuesta
  nada, pero no es la URL a usar.
- El intento de bucket público (`site`) en Storage se revirtió por completo:
  objeto borrado, políticas de escritura/lectura pública eliminadas. Queda
  un registro de bucket vacío y sin políticas que no se pudo eliminar sin la
  `service_role` key (protegido por Supabase contra borrado accidental) —
  inofensivo, no expone nada.

### Solución real: GitHub Pages

Este repo (`lukas612/test`) ya está conectado. El dashboard está publicado
como copia estática en `docs/index.html` (más `docs/.nojekyll` para que
GitHub no lo procese con Jekyll).

**Falta un solo paso manual** (no hay API de GitHub Pages en las
herramientas disponibles para Claude Code en este entorno): en el repo, ir a
**Settings → Pages** y configurar:
- Source: `Deploy from a branch`
- Branch: la rama donde vive `docs/` (esta rama, o la rama por defecto tras
  hacer merge) + carpeta `/docs`

Tras eso, la URL pública será algo como
`https://lukas612.github.io/test/`.

Si se prefiere no depender de GitHub Pages, la otra opción real es contratar
un dominio propio y usar el [custom domain de
Supabase](https://supabase.com/docs/guides/platform/custom-domains) — de
pago, no configurado aquí.

## Seguridad — pendiente de tu parte

- Se generó por error una **clave `sb_secret_...`** (equivalente a
  `service_role`) que apareció en texto plano en un chat de claude.ai.
  **Revócala/regenérala** en Project Settings → API Keys si no lo has hecho
  ya — Claude Code no la ha usado ni la tiene.
- El `anon/publishable key` que sí está en `index.html` es seguro de exponer
  en cliente por diseño (es pública), pero como la tabla `portfolio_holdings`
  tiene RLS desactivado, esa clave permite lectura y escritura completas sobre
  esa tabla. Aceptable para una herramienta personal de un solo usuario; no
  la subas a ningún sitio realmente público.

## Migración previa (contexto)

Antes de Supabase, el dashboard usó Google Sheets vía un Web App de Apps
Script como backend (URL y token también quedaron horneados en versiones
anteriores del archivo, ya sustituidos). Esa hoja ya no se actualiza.
