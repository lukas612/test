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
- **Nuevas categorías**: Crypto (Activo + Exchange/Wallet) y Efectivo —
  ambas cuentan como líquidas en el espectro de liquidez. Al marcar una fila
  como Vendida (con Importe venta > 0) se genera automáticamente una fila en
  Efectivo por ese importe, para que el dinero de una venta no desaparezca
  del patrimonio total.
- **Pestaña Inmuebles**: ficha por propiedad (precio de compra, valor
  actual) + registro mensual de alquiler/gastos por inmueble. El valor de
  cada inmueble suma al patrimonio total y tiene su propio bucle
  "Bloqueado · inmobiliario" en el espectro de liquidez.
- **Evolución del patrimonio**: gráfico de línea en el Panel con el histórico
  de `valor_total` guardado en `portfolio_snapshots`. Con menos de 2 puntos
  muestra un aviso de "aún no hay histórico" en vez de un gráfico vacío.
- **Ganancia/pérdida en €**: además del % que ya había, tanto la cabecera de
  cada categoría (Acciones, ETF, Indexa, Crypto...) como cada fila individual
  muestran ahora el importe absoluto de plusvalía/minusvalía. Por fila, se
  calcula como Valor actual − Invertido (o Importe venta − Invertido si la
  fila está marcada como Vendida), convertido a EUR si la fila es en USD; se
  actualiza en vivo al editar Invertido/Valor/Importe venta/Moneda o al
  cambiar el tipo de cambio.
- **Ganancia/pérdida también en el Panel, por titular y por producto**: el
  Panel principal se había quedado corto — solo enseñaba % en el bloque de
  Rendimiento (global). Ahora "Distribución por titular" añade una línea con
  el importe y % de plusvalía de cada titular (Lukas solo, Lukas & Adriana
  conjunta, Whitenut, Lovicka — sumando también sus inmuebles), y
  "Distribución por producto" añade una columna con el importe de cada
  categoría (incluye Inmuebles). Es la misma plusvalía latente (no vendida)
  que ya se ve en cada tarjeta de Movimientos, solo que agregada por titular
  en vez de por categoría.
- **Plusvalía realizada también por titular y por producto**: además de la
  latente, si un titular o una categoría tiene alguna fila marcada como
  Vendida, se muestra también su ganancia/pérdida realizada (Importe venta −
  Invertido) en € y %, en una segunda línea — solo aparece cuando hay algo
  vendido, para no ensuciar la vista en el caso normal. Las tarjetas de cada
  categoría en Movimientos también muestran ahora "Realizada" junto a
  "Ganancia" (latente) cuando aplica. Los inmuebles no tienen este concepto
  (no se modela la venta de una propiedad).
- **Exportar CSV**: botón en el footer de Movimientos, descarga todas las
  filas de todas las categorías (`;` como separador, BOM UTF-8, pensado para
  Excel en español).
- **Sincronización automática con Indexa Capital e Interactive Brokers**,
  diaria + botón manual "Actualizar Indexa + IB" — ver secciones propias más
  abajo.
- El panel "Sincronización con Supabase" ya no permite pegar una URL/clave a
  mano (ya no tenía sentido con RLS atado a una cuenta fija); solo queda
  "Sincronizar ahora".
- El fallback de guardado local pasó de `window.storage` (una API que solo
  existe dentro del entorno de artifacts de claude.ai, nunca funcionó fuera
  de ahí) a `localStorage` real del navegador.

## Sincronización con Indexa Capital (manual + automática diaria)

Indexa publica un token personal de solo lectura (Configuración de usuario →
Aplicaciones en indexacapital.com) pensado justo para esto. El dashboard lo
usa para traer valor actual + invertido de las 2 cuentas "mutual" y las 2 de
pensiones/plan de empleo, sin que haya que teclearlos a mano.

- **Edge Function `indexa-sync`**: guarda el token de Indexa del lado del
  servidor (nunca en el HTML público), consulta
  `GET /accounts/{account_number}/performance` de la API de Indexa para cada
  cuenta, y escribe directamente en `portfolio_holdings` (usando la
  `service_role` key, que solo existe dentro de la función) emparejando por
  el número de cuenta entre paréntesis en el Concepto/Plan — así una
  re-sincronización actualiza la fila existente en vez de duplicarla.
- **Botón manual**: "Actualizar desde Indexa" en Movimientos, llama a la
  función con la sesión del usuario logueado.
- **Cron diario**: `pg_cron` (extensión activada) llama a la misma función
  todos los días a las **06:00 UTC**, sin necesidad de tener el dashboard
  abierto. El job se llama `indexa-daily-sync`
  (`select * from cron.job where jobname = 'indexa-daily-sync';` para verlo,
  `select cron.alter_job(job_id, schedule => '...')` para cambiar la
  frecuencia — cualquier expresión cron vale, p. ej. `0 6 */3 * *` para cada
  3 días).
- **Autenticación del cron**: como no hay usuario logueado disparando el
  cron, la función acepta también un secreto compartido
  (`X-Cron-Secret`) guardado cifrado en Supabase Vault
  (`vault.decrypted_secrets`, nombre `indexa_cron_secret`) además de la
  sesión de usuario normal. Verificado: sin credenciales → 403; secreto
  incorrecto → 403; secreto correcto o sesión real → 200 y escribe en la
  tabla.
- Los planes de pensión de Bankinter que ya tenías metidos a mano no se
  tocan — el emparejamiento es solo por el número de cuenta de Indexa entre
  paréntesis, así que conviven sin pisarse.

## Sincronización con Interactive Brokers (Flex Web Service)

Misma función `indexa-sync`, mismo botón, mismo cron — IB se añadió como un
bloque más, entre el de Indexa y el del snapshot final (ver más abajo).

- **Credenciales**: Token + Query ID del *Flex Web Service* de IB
  (Informes → Consultas Flex → engranaje de "Envío de consultas Flex" →
  activar el servicio web). Solo visibles desde la cuenta **Maestra** si hay
  cuentas vinculadas. Guardados en el código de la función, igual que el
  token de Indexa — no en Vault ni en el cliente.
- **Flujo** (protocolo Flex Web Service v3, dos pasos):
  1. `SendRequest` con Token + Query ID → devuelve un `ReferenceCode`.
  2. `GetStatement` con ese código (reintentos cada 4s hasta 5 veces, IB
     tarda unos segundos en generar el informe) → XML con `EquitySummaryByReportDateInBase`
     (NAV en EUR, moneda base) y `OpenPositions` (coste de cada posición,
     en la moneda original — de momento se asume USD, que es lo único que
     hay en las 3 cuentas actuales) por cuenta.
  3. El XML se parsea con regex sobre los atributos de las etiquetas
     (autocontenidas, sin librería externa) en vez de un parser XML completo.
- **Cuentas mapeadas** (`IB_ACCOUNTS` en la función): `U9489695` e
  `U15958681` → Lukas personal; `U7366051` (alias "Conjunta" en IB) →
  Lukas & Adriana.
- **Una fila por posición, no por cuenta**: cada `OpenPosition` del XML
  genera su propia fila en **Acciones** (p. ej. `KO (U9489695)`,
  `OCGN (U15958681)`), con Invertido = `costBasisMoney` y Valor actual =
  `positionValue`, ambos convertidos a EUR con el tipo de cambio guardado.
  El campo Broker/Concepto (`campo2`) lleva el nombre de la cuenta (`IB
  Personal Long`, etc.) para poder identificar de qué cartera viene cada
  acción. Se emparejan por símbolo + número de cuenta, así que una
  resincronización actualiza cada posición existente en vez de duplicarla.
- **Efectivo no invertido**: la NAV de una cuenta de IB no es solo la suma
  de sus posiciones — también hay saldo en efectivo sin invertir. Para que
  el patrimonio total no baje al desglosar por posición, cada cuenta genera
  además una fila en **Efectivo** (`Efectivo IB Personal Long (U9489695)`,
  etc., campo2 `Interactive Brokers`) con ese saldo, tomado directamente del
  atributo `cash` del resumen `EquitySummaryByReportDateInBase` (ya viene en
  la moneda base del informe, sin necesidad de conversión).
- **Limpieza automática**: en cada sincronización, cualquier fila de
  Acciones o Efectivo que "pertenezca" a IB (por su campo Broker/Concepto)
  pero ya no aparezca en el informe actual se borra — cubre tanto posiciones
  vendidas/cerradas como, en la primera ejecución tras este cambio, las
  filas agregadas por cuenta del formato anterior.
- Verificado con datos reales: 3 cuentas, informe XML de ~93 KB, 28
  posiciones individuales + 3 filas de efectivo creadas correctamente, y el
  snapshot del día cuadra con la suma de todas ellas.

## Snapshot diario encadenado

Al final de la misma ejecución (después de escribir los datos de Indexa e
IB, no en un cron aparte que pudiera pisarse con éste), la función
recalcula el patrimonio total — con la misma lógica que
`totalPatrimonio()`/`realizedTotals()` del dashboard (conversión USD→EUR
con el tipo de cambio guardado, exclusión de filas vendidas del total
activo, inmuebles incluidos) — y hace upsert en `portfolio_snapshots` para
la fecha de hoy. Así el gráfico de evolución del Panel tiene un punto todos
los días aunque nadie abra el dashboard. Si se añade alguna fuente más en
el futuro, su sincronización va antes de este bloque, en la misma función,
para que el snapshot del día siempre sea posterior a todas las fuentes
automáticas.

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
