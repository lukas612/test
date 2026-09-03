# Cuadro de Mando · Patrimonio de Inversión

Handoff desde claude.ai a Claude Code, continuado y cerrado por Claude Code.

## Qué es esto

Dashboard de patrimonio personal (`index.html`, un único archivo autocontenido:
HTML + CSS + JS vanilla, sin build step). Cuatro pestañas:

- **Panel**: solo visualización (patrimonio neto, plusvalía latente/realizada/total,
  espectro de liquidez, distribución por titular, distribución por producto,
  evolución del patrimonio en el tiempo).
- **Movimientos**: tipo de cambio, sincronización con Supabase, formulario de
  alta de inversiones, tablas editables por categoría (Acciones, ETF, Indexa
  Capital, Crypto, Plan de Pensiones, Crowdfunding) y Pasivos.
- **Inmuebles**: ficha por propiedad y registro mensual de alquiler/gastos.
- **Informe**: informe diario centrado solo en inversión, sin inmuebles.

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
- **Tabla de inmuebles**: `properties` (`titular, nombre, fecha_compra,
  precio_compra, valor_actual, movimientos` jsonb). Misma política RLS.
- **Tabla de pasivos**: `liabilities` (`titular, nombre, tipo, saldo_pendiente,
  cuota_mensual, inmueble_vinculado, fecha`). Misma política RLS. El vínculo
  con un inmueble es por nombre (texto libre, no una FK) para poder seguir
  borrando y reinsertando todas las filas en cada guardado, igual que ya se
  hacía con `properties` — si renombras el inmueble, el desplegable de
  "Inmueble vinculado" se refresca solo.
- **`app_files`**: ya no se usa para servir nada (ver sección de hosting).
  RLS activado sin ninguna política — completamente cerrada, ni lectura ni
  escritura desde el cliente.
- **Tabla de ajustes**: `app_settings` (`key` PK, `value` jsonb,
  `updated_at`). Misma política RLS. Genérica a propósito — de momento solo
  guarda `target_allocation` (objetivo % de Líquido/Jubilación/A plazo,
  ver más abajo), pero sirve para cualquier ajuste futuro sin migrar nada.
  Se escribe con `Prefer: resolution=merge-duplicates` (upsert por `key`).
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
- **Patrimonio de inversión e Inmuebles, separados en la cabecera del
  Panel**: como el valor de los inmuebles (ilíquido, normalmente el bloque
  más grande) mezclado con el de la cartera de inversión hacía el número
  "Patrimonio total" poco útil de un vistazo, ahora la cabecera muestra el
  total combinado en pequeño arriba y, debajo, dos bloques independientes —
  "Patrimonio de inversión" (Acciones, ETF, Indexa, Crypto, Efectivo,
  Pensiones, Crowdfunding) y "Patrimonio inmobiliario" (Inmuebles) — cada
  uno con su propio invertido/comprado y su propia plusvalía en € y %. El
  bloque "Rendimiento" de debajo (Plusvalía latente/realizada/Retorno total)
  pasa a referirse solo a la inversión (los inmuebles ya tienen su plusvalía
  en su propio bloque arriba), por eso ahora se titula "Rendimiento de la
  inversión".
- **Pasivos y Patrimonio neto**: nueva tarjeta "Pasivos" en Movimientos
  (Titular, Nombre, Tipo — Hipoteca/Préstamo/Otro —, Inmueble vinculado
  opcional, Saldo pendiente, Cuota mensual). La cifra principal del Panel
  pasa a llamarse "Patrimonio neto" = activos − pasivos, con una línea
  "Bruto X € · Pasivos −Y €" debajo cuando hay algún pasivo, y un tercer
  bloque "Pasivos" junto a Inversión/Inmobiliario (solo visible si el saldo
  pendiente es mayor que 0). Las distribuciones por titular/producto y el
  espectro de liquidez siguen siendo sobre activos brutos — el neto solo se
  calcula en la cifra de cabecera, para no liar el reparto por categoría con
  una deuda que no pertenece a ninguna.
- **Aportado acumulado vs. rentabilidad de mercado**: el gráfico de
  evolución (modo "Total") ahora pinta dos líneas — el valor total de
  siempre y el aportado acumulado (suma de `invertido`/`precioCompra` de
  cada fila e inmueble según su fecha de alta, reconstruido sobre los datos
  que ya existían, sin tabla nueva). Encima del gráfico, un resumen del
  periodo separa la variación en "Aportado" (dinero nuevo metido) y
  "Rentabilidad de mercado" (el resto) — así un mes con una aportación
  grande ya no se confunde con una buena rentabilidad. Las filas metidas a
  mano hace tiempo sin fecha (algunas de las pensiones de Bankinter, algún
  proyecto de Crowdfunding) ya no desaparecen del cómputo por no tener
  fecha — antes se descartaban en silencio y el aportado salía por debajo
  del real; ahora, a falta de una fecha mejor, cuentan desde hoy.
- **Selector de periodo y desglose en el gráfico de evolución**: botones
  7D/1M/YTD/1A/Todo filtran el histórico mostrado (si no hay suficientes
  días para el periodo elegido, se avisa y se enseña todo el histórico
  disponible). Dos modos más, "Por categoría" y "Por titular", pintan un
  área apilada usando el desglose que `portfolio_snapshots.breakdown` ya
  guarda cada día — no ha hecho falta tocar el backend, solo leer un dato
  que ya se guardaba y no se usaba.
- **"Indexa (histórico completo)"**: cuarto modo del gráfico de evolución
  que no depende de `portfolio_snapshots` (que solo tiene un punto por día
  desde que arrancó el cron) sino de `indexa_history` — así se ve el
  recorrido real de las cuentas de Indexa desde que se abrieron (la
  conjunta, desde 2022), no solo las últimas semanas. Enseña dos líneas
  (valor total y aportado acumulado, sumando las 4 cuentas de Indexa +
  Pensiones) igual que el modo "Total", pero a años vista en vez de
  semanas. El resto de categorías (IB, manuales, inmuebles) no tienen este
  histórico largo — por eso el gráfico principal ("Total") sigue acotado a
  lo que hay en `portfolio_snapshots`, y esta pestaña es la manera de ver
  más atrás para la parte que sí lo permite.
- **Rentabilidad diaria**: debajo del Patrimonio neto, "Desde el [fecha]:
  ±X € (±Y%)" compara el snapshot más reciente con el anterior.
- **Qué se movió, no solo el total**: debajo de esa línea, una fila de
  categorías ("Indexa Capital +300 €", "Acciones −300 €"...) con el delta
  de cada categoría entre esos dos mismos snapshots (`categoryDailyDeltas()`,
  restando `breakdown.categorias` del snapshot de hoy menos el de ayer, más
  Inmuebles aparte), ordenadas de mayor a menor movimiento absoluto y
  ocultando las que no se movieron. Antes solo se veía el neto del día; con
  varias categorías compensándose entre sí (una sube, otra baja) el número
  general no decía nada de qué había pasado realmente.
- **Frescura de los datos por fuente**: en el panel de Sincronización,
  "Indexa + IB: dato del DD/MM (hace Nd)" a partir de la fecha más reciente
  entre las filas que reconocidamente vienen de la sincronización automática
  (por su Broker/Concepto/Entidad), y un desplegable con las filas metidas a
  mano que llevan más de 90 días sin tocarse.
- **Alertas de vencimiento**: si algún proyecto de Crowdfunding tiene un
  Vencimiento (mm/aaaa) a menos de 30 días, o ya pasado y sin marcar como
  Vendido, aparece un aviso en la parte superior del Panel.
- **TIR anualizada (XIRR)**: nueva tarjeta en "Rendimiento de la inversión"
  con el retorno real anualizado — a diferencia del % de plusvalía (que es
  solo valor/coste, sin tener en cuenta cuándo entró cada euro), esto sí
  usa la fecha exacta de cada aportación (`contributionEvents(false)`, el
  mismo histórico ya reconstruido para "Aportado") más el valor actual como
  si se liquidase hoy, y resuelve la tasa por Newton-Raphson (`xirr()`). Si
  todo el histórico cabe en un solo día, o Newton no converge, muestra "—"
  en vez de un número inventado.
- **Exposición por divisa**: nuevo espectro en el Panel, "Exposición por
  divisa — de la inversión", con cuánto del valor de la inversión está en
  EUR vs. USD (`currencyTotals()`, por la moneda nativa de cada fila, no
  por dónde vive el bróker). Deja fuera los inmuebles a propósito — siempre
  son EUR aquí, y solo diluirían el %.
- **Resumen fiscal por año** (pestaña Informe): agrupa las plusvalías
  realizadas (filas "Vendido") por año de `fechaVenta` y estima el IRPF con
  los tramos agregados de la base del ahorro españoles (19/21/23/27/28%).
  Es una aproximación: solo mete la ganancia patrimonial de este dashboard,
  sin dividendos, intereses ni otras rentas — lo dice el propio aviso en
  la pestaña.
- **Objetivo de asignación y aviso de desviación**: en Movimientos, un
  panel nuevo para fijar el % objetivo de Líquido/Jubilación/A plazo (sobre
  la inversión, igual base que "Patrimonio de inversión" — no coincide con
  el % del "Espectro de liquidez", que sí incluye inmuebles). Guardado en
  una tabla nueva `app_settings` (key/value, mismo patrón de RLS que el
  resto). Cuando hay objetivo fijado, el "Espectro de liquidez" del Panel
  muestra la desviación en puntos porcentuales, y si supera 5pp
  (`ALLOC_ALERT_THRESHOLD`) aparece también en la barra de alertas junto a
  los vencimientos de Crowdfunding.
- **Pestaña "Informe"**: informe diario centrado solo en inversión — los
  inmuebles quedan fuera a propósito. Arriba, tres cifras: valor de
  inversión actual, aportado histórico y rentabilidad de mercado histórica
  (ambas calculadas igual que el "Aportado"/"Rentabilidad de mercado" del
  gráfico de evolución, pero sin la parte de `contributionEvents()` que
  añade los inmuebles — `aportadoSeriesFor(dates, false)`). Debajo, una
  tabla con un día por fila (el más reciente arriba): valor de inversión,
  variación respecto al día anterior (€ y %), aportado acumulado,
  rentabilidad de mercado acumulada y su %. El valor de cada día sale de
  sumar `portfolio_snapshots.breakdown.categorias` (que nunca incluyó
  inmuebles) en vez de `valor_total` (que sí los incluye). Botón propio
  "Exportar informe CSV" con las mismas columnas que la tabla.
- **Exportar CSV**: botón en el footer de Movimientos, descarga todas las
  filas de todas las categorías (`;` como separador, BOM UTF-8, pensado para
  Excel en español).
- **Fix: el "% global" de arriba no coincidía con el "Patrimonio de
  inversión"**. `heroTotalPct` salía de `totalPatrimonio()`, que mezcla la
  base de coste de la inversión con la de los inmuebles. Un inmueble
  heredado (coste 0 €, como Modesto Lafuente) hace que esa base de coste
  total sea casi solo la de la inversión, y el `(valor-coste)/coste` da un
  porcentaje absurdo (>800%) que no tiene nada que ver con el rendimiento
  real. Ahora el pill de arriba usa `grandTotals()` (el mismo cálculo que el
  bloque "Patrimonio de inversión" de abajo) y el texto pasó de "global" a
  "en inversión" para que quede claro qué mide — un inmueble no tiene un
  "% de rentabilidad" con sentido cuando su coste es 0, así que no se
  intenta blendearlo en una sola cifra.
- **Fix: "Actualizar Indexa + IB" vaciaba inmuebles y pasivos en memoria**.
  Ese botón hacía `state = deserializeRows(rows)` (que arranca desde
  `defaultState()`, con `inmuebles`/`pasivos` vacíos) y nunca los volvía a
  cargar — a diferencia de "Sincronizar ahora", que sí lo hacía. No se veía
  en el DOM porque ese botón tampoco repintaba las tarjetas de inmuebles ni
  pasivos, pero `renderSummary()` sí usaba el `state` ya vaciado, así que el
  hero mostraba "Patrimonio inmobiliario" y "Pasivos" en 0 € hasta recargar
  la página entera. Encontrado al cablear la carga del objetivo de
  asignación (mismo problema le habría pasado). Arreglado recargando
  inmuebles/pasivos/ajustes en los dos botones de sincronización, no solo
  en la carga inicial.
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

### Histórico real de aportaciones (`indexa_history`)

La API de `performance` que ya se consultaba para el valor actual también
devuelve `portfolios` (una entrada por día desde que se abrió la cuenta) y
`net_amounts` (el neto aportado acumulado — aportes menos retiradas — por
fecha, en formato `YYYYMMDD`). Antes esto se descartaba y solo se usaba el
último día; ahora la función guarda el histórico completo en la tabla
`indexa_history` (`account_number, fecha` como clave, `total_amount`,
`net_amount`, `cash_amount`, `instruments_cost`) en cada sincronización, vía
`upsert` — así una cuenta que lleva años abierta (827W4IP3 tiene histórico
desde 2022-09-28, 1433 días) no pierde ese recorrido, y una resincronización
diaria simplemente añade el día nuevo sin tocar el resto.

El dashboard usa esto para el **aportado acumulado** del gráfico de
evolución: para las filas de Indexa/Pensiones que tienen histórico
(reconocidas por el número de cuenta entre paréntesis en el Concepto/Plan),
ya no asume que todo el `invertido` se aportó el día del último sync —
reconstruye la fecha real de cada aportación a partir de los saltos en
`net_amount` día a día. El resto de filas (Acciones, ETF, Crypto,
Crowdfunding, inmuebles, y las posiciones de IB) siguen usando su propia
fecha de alta, que sí es la fecha real porque la escribes tú a mano.

`cash_amount` (cuánto de cada cuenta está en efectivo sin invertir, que la
API de Indexa ya devolvía junto a `total_amount` pero antes se descartaba)
ahora también se guarda y se lee. En Movimientos, bajo el Concepto/Plan de
cada fila de Indexa o Pensiones-vía-Indexa que tiene histórico, aparece
"de los cuales X € en efectivo" con el dato del día más reciente
(`latestIndexaCash()`) — solo informativo, no cambia ningún total ni resta
de "Invertido"/"Valor". Los planes de Bankinter metidos a mano (sin número
de cuenta entre paréntesis) no lo muestran porque no hay ese dato para ellos.

**Interactive Brokers no tiene esto todavía**: la Flex Query actual
("panel") solo pide `EquitySummaryByReportDateInBase` y `OpenPosition` con
periodo "Último día hábil" — trae el NAV de los dos últimos días, nada de
histórico de movimientos ni de cuándo se metió cada euro. Para tener lo
mismo que con Indexa haría falta, desde la propia cuenta de IB (Informes →
Consultas Flex → editar la consulta "panel"): ampliar el rango de fechas
(p. ej. "Desde la apertura de la cuenta" o un rango custom) y añadir una
sección de **Cash Transactions** (o **Trades**) al informe — algo que solo
se puede hacer desde el portal web de IB, no vía API. Mientras tanto, las
posiciones de IB en el gráfico de "aportado" usan la fecha del último sync
como aproximación, igual que antes.

**Fix: `indexa_history` se estaba cortando en 1000 filas**. PostgREST (la
API REST de Supabase) devuelve como máximo 1000 filas por request si no se
pagina, y `indexa_history` ya tiene más de 3200 (varios años de histórico
diario en 4 cuentas). `loadIndexaHistory()` pedía todo con un único
`fetch(...&order=fecha.asc)`, así que solo llegaban las filas más antiguas
— hasta el 2024-10-27 — y todo lo posterior se perdía en silencio: las
cuentas que empezaron después de esa fecha (los planes de pensión vía Caser)
desaparecían del todo, y las dos cuentas de Indexa quedaban "congeladas" en
su valor de 2024. Esto hacía que "Aportado" (evolución, Indexa histórico
completo, pestaña Informe) saliera muy por debajo de "Invertido" del hero —
detectado porque el usuario reportó "76.617 € aportado" cuando debía ser
101.613 €, y la resta cuadraba exactamente con lo que esas dos cuentas
habían dejado de aportar desde 2024. Arreglado paginando con la cabecera
`Range` (1000 filas por página, hasta que una página vuelve incompleta).
Mismo riesgo, aunque aún lejos, en `portfolio_snapshots` (una fila por día,
tardará ~3 años en pasar de 1000) — si algún día el histórico se ve corto
por el principio, es la primera sospecha.

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

## Pasivos y el snapshot diario — qué no cambió

Los pasivos son deliberadamente manuales y en vivo, no forman parte del
snapshot diario ni de la función `indexa-sync`: `valor_total` en
`portfolio_snapshots` sigue siendo el patrimonio bruto de siempre, calculado
igual que antes. El "Patrimonio neto" del Panel se calcula siempre en el
cliente, restando los pasivos actuales al bruto del momento — así el
histórico de la evolución del patrimonio no cambia de significado con
pasivos que no existían cuando se guardó cada punto antiguo.

## Qué se quedó fuera de esta pasada (a propósito)

Del estudio "Qué le falta al panel", esto es lo que NO se ha construido
todavía, con el motivo:

- **Aviso de límite de aportación a planes de pensiones**: las filas de
  Pensiones guardan el saldo total acumulado del plan, no un histórico de
  aportaciones por año — no hay dato suficiente para calcular cuánto se ha
  aportado *este año natural* sin añadir un campo o tabla nueva para
  registrarlo. Se dejó fuera hasta decidir cómo quieres llevar ese registro.
- **Comparación con un benchmark** (MSCI World/S&P500 con las mismas
  aportaciones en las mismas fechas): necesita una fuente de precios
  históricos externa (Yahoo Finance/stooq no tienen API oficial estable, y
  habría que decidir si se consulta al cargar la página o se cachea vía la
  Edge Function) — se dejó pendiente de decidir el enfoque contigo antes de
  implementarlo.

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
