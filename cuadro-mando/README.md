# Cuadro de Mando · Patrimonio de Inversión

Handoff desde claude.ai a Claude Code, continuado y cerrado por Claude Code.

## Qué es esto

Dashboard de patrimonio personal (`index.html`, un único archivo autocontenido:
HTML + CSS + JS vanilla, sin build step). Dos pestañas:

- **Panel**: solo visualización (total, plusvalía latente/realizada/total,
  espectro de liquidez, distribución por titular, distribución por producto,
  evolución del patrimonio en el tiempo).
- **Movimientos**: tipo de cambio, sincronización con Supabase, formulario de
  alta de inversiones, y tablas editables por categoría (Acciones, ETF, Indexa
  Capital, Crypto, Plan de Pensiones, Crowdfunding).

Cada fila de inversión tiene: Titular (Lukas personal / Lukas & Adriana /
Whitenut / Lovicka), Fecha, campos según categoría, Moneda (EUR/USD),
Invertido, Valor actual, Vendido (checkbox) + Fecha venta + Importe venta
(para separar ganancia latente de ganancia realizada).

## Acceso — protegido con login

El dashboard vive detrás de un login (Supabase Auth, email + contraseña).
Sin iniciar sesión no se ve ni se descarga ningún dato: la pantalla de acceso
tapa la página antes de que se pinte nada, y aunque alguien se saltara eso,
las políticas RLS de la base de datos bloquean cualquier lectura/escritura
que no venga autenticada como la cuenta autorizada.

- Cuenta única compartida (Lukas + Adriana), email `lukas@lukasochoa.com`.
- Backend: Supabase Auth (`sbClient.auth.signInWithPassword`), vía el SDK
  `@supabase/supabase-js` cargado desde jsDelivr.
- Botón "Cerrar sesión" en el footer de Movimientos.

## Backend: Supabase

- **Project ref**: `pnprzupnqpjqgtlqkrfd`
- **Project URL**: `https://pnprzupnqpjqgtlqkrfd.supabase.co`
- **anon/publishable key** (ya horneada dentro de `index.html`, es pública por
  diseño): `sb_publishable_KtVZaVnSCuSNVJG5qlYlUg_WAiHOoOj`. Ya no basta por
  sí sola para leer ni escribir nada — ver RLS abajo.
- **Tabla de datos**: `portfolio_holdings`. Columnas:
  `categoria, titular, campo1, campo2, moneda, invertido, valor_actual, fecha,
  vencimiento, vendido, fecha_venta, importe_venta`.
  **RLS activado** — solo la cuenta autenticada autorizada
  (`auth.uid() = '42175299-66d9-43d2-a3f3-d2b28c55e44f'`) puede leer o
  escribir. El anon key por sí solo ya no obtiene nada (verificado: devuelve
  `[]`).
- **Tabla de histórico**: `portfolio_snapshots`
  (`fecha` PK, `valor_total`, `invertido_total`, `plusvalia_latente`,
  `plusvalia_realizada`, `breakdown` jsonb con desglose por categoría y
  titular). Misma política RLS que `portfolio_holdings`. Cada vez que el
  dashboard carga o guarda, hace upsert de la fila de hoy (`fecha` como clave,
  `Prefer: resolution=merge-duplicates`) — así se acumula un punto por día
  sin necesidad de ningún cron ni proceso aparte.
- **`app_files`**: ya no se usa para servir nada (ver sección de hosting).
  RLS activado sin ninguna política — completamente cerrada, ni lectura ni
  escritura desde el cliente.
- El dashboard sincroniza en vivo contra `portfolio_holdings` vía `fetch()`
  directo a la REST API de PostgREST, con lógica en `serializeRows()` /
  `deserializeRows()` / `supabaseGet()` / `supabasePost()` dentro del
  `<script>` de `index.html`. Las cabeceras de autenticación (`authHeaders()`)
  usan el `access_token` de la sesión activa, no la anon key a secas.

## Hosting: GitHub Pages

El plan original (tabla `app_files` + Edge Function sirviendo `text/html`)
**no es viable en Supabase** — no es un problema de ejecución, es una
restricción de plataforma confirmada en producción: tanto Edge Functions
como Storage público reescriben cualquier respuesta HTML a `text/plain` en
el dominio compartido `*.supabase.co` (protección anti-phishing; solo se
evita con un dominio propio de pago). El contenido de referencia se dejó en
`app_files`/Edge Function por si algún día hay dominio propio, pero no es la
URL a usar.

El dashboard se sirve como página estática real desde `docs/index.html` vía
GitHub Pages, ya configurado: **https://lukas612.github.io/test/**
(Source: rama `claude/cuadro-mando-handoff-4t0j3b`, carpeta `/docs`).

## Novedades sobre la versión inicial

- **Login obligatorio** (ver arriba) — antes cualquiera con la URL y la anon
  key tenía lectura/escritura total; ahora hace falta la cuenta autorizada.
- **Nuevo titular**: "Lukas & Adriana" (titularidad conjunta), junto a Lukas
  personal, Whitenut y Lovicka.
- **Nueva categoría**: Crypto (Activo + Exchange/Wallet), contabilizada como
  líquida en el espectro de liquidez.
- **Evolución del patrimonio**: gráfico de línea en el Panel con el histórico
  de `valor_total` guardado en `portfolio_snapshots`. Con menos de 2 puntos
  muestra un aviso de "aún no hay histórico" en vez de un gráfico vacío.
- El panel "Sincronización con Supabase" ya no permite pegar una URL/clave a
  mano (ya no tenía sentido con RLS atado a una cuenta fija); solo queda
  "Sincronizar ahora".
- El fallback de guardado local pasó de `window.storage` (una API que solo
  existe dentro del entorno de artifacts de claude.ai, nunca funcionó fuera
  de ahí) a `localStorage` real del navegador.

## Seguridad — pendiente de tu parte

- Se generó por error una **clave `sb_secret_...`** (equivalente a
  `service_role`) que apareció en texto plano en un chat de claude.ai.
  **Revócala/regenérala** en Project Settings → API Keys si no lo has hecho
  ya — Claude Code no la ha usado ni la tiene.
- Cambia la contraseña de login si la compartiste por un canal que no
  quieras que quede como el definitivo.

## Migración previa (contexto)

Antes de Supabase, el dashboard usó Google Sheets vía un Web App de Apps
Script como backend (URL y token también quedaron horneados en versiones
anteriores del archivo, ya sustituidos). Esa hoja ya no se actualiza.
