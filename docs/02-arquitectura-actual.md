# 02 · Arquitectura actual (web)

> Ingeniería inversa del `index.html` (v20.1). Documenta cómo funciona **hoy** para saber
> qué se reutiliza y qué se rehace en la app nativa.

## Vista general

BebéMatch hoy es una **SPA de un solo archivo**: todo (HTML, CSS y JS) vive dentro de
`index.html`. No hay framework, ni bundler, ni proceso de build.

```
index.html  ──►  navegador
   │
   ├── HTML: las ~11 pantallas (divs .screen, se muestran/ocultan)
   ├── CSS:  variables de tema (claro/oscuro), estilos de cartas, animaciones
   └── JS:   estado de la app + dataset de nombres + integración Supabase
                                  │
                                  ▼
                        Supabase (backend como servicio)
                          ├── Postgres: tabla `votes`
                          └── Realtime: WebSocket de cambios
```

Dependencias externas cargadas por CDN:
- `qrcodejs` — generación del código QR de la sala.
- Google Fonts — tipografías `Inter` e `Instrument Serif`.

## Frontend

- **Navegación:** una máquina de estados sencilla. Cada pantalla es un `div.screen`; se
  activa con la clase `.active` (`showScreen(...)`). No hay router.
- **Estado:** un objeto global `state` en memoria (sala, `myId`, votos propios y de la
  pareja, si es host, etc.). Se pierde al recargar.
- **Datos de nombres:** constante `NAMES_DB` (array de objetos) embebida en el JS.
- **Estilos:** CSS con variables (`--salmon`, `--bg`, ...). Tema claro con `body.light`.
- **Interacción:** swipe con eventos táctiles/puntero; animaciones con CSS y `<canvas>`
  (confeti, partículas de corazón, mini-juego del easter egg).

## Backend: Supabase

Todo el multijugador se apoya en Supabase, con la clave **anon** embebida en el cliente.

### Modelo de datos

Una única tabla: **`votes`**. Cada fila es un voto (o una señal de presencia).

| Campo | Tipo (inferido) | Descripción |
|-------|-----------------|-------------|
| `room_code` | texto | Código de la sala (4 caracteres) |
| `user_id` | texto | Identidad temporal del dispositivo |
| `name` | texto | Nombre votado, o `__presence__` para anunciar conexión |
| `liked` | booleano | `true` = me gusta, `false` = no me gusta / presencia |

### Acceso a datos (REST)

Se usa la API REST de Supabase directamente con `fetch`:

- **Insertar voto** — `POST /rest/v1/votes` (`dbInsert`).
- **Borrar voto** — `DELETE /rest/v1/votes?room_code=eq.<code>&name=eq.<name>` (`dbDelete`).
- **Leer votos de la sala** — `GET /rest/v1/votes?room_code=eq.<code>` (`dbFetchVotes`).

### Tiempo real (Realtime)

- Se abre un **WebSocket** a `wss://<proyecto>.supabase.co/realtime/v1/websocket`
  (`connectRealtime`).
- Se suscribe a los `INSERT` de la tabla `votes` **filtrados por `room_code`**.
- Con cada inserto del otro usuario se dispara `onPartnerVote(record)`:
  - Marca a la pareja como conectada.
  - Guarda su "me gusta" y llama a `checkMatch(name)`.
- **Heartbeat** cada 25 s y **reconexión** automática a los 5 s si se cae.
- Además hay un **polling** de respaldo (`startPartnerPoll`) para detectar a la pareja.

### Lógica de sala

- `genCode()` genera el código de 4 caracteres (alfabeto sin caracteres ambiguos).
- `createRoom()` — el host inserta su `__presence__` y abre el realtime.
- `joinRoom()` — el guest comprueba que la sala existe, inserta su `__presence__`, carga
  los votos previos y abre el realtime.

## Detección de match

Cuando llega un voto de la pareja con `liked = true`, `checkMatch(name)` comprueba si el
usuario local también dio "me gusta" a ese mismo nombre. Si coinciden → pantalla de Match.

## Qué se reutiliza vs. qué se rehace en la app

| Elemento | En la migración a Expo |
|----------|------------------------|
| Dataset `NAMES_DB` | ✅ **Se reutiliza** (se extrae a JSON/TS) |
| Lógica de match y de sala | ✅ **Se reutiliza** (se porta a TS) |
| Integración Supabase (REST + Realtime) | ✅ Se reutiliza vía SDK oficial `supabase-js` |
| HTML de las pantallas | ♻️ **Se rehace** con componentes React Native |
| CSS / animaciones | ♻️ **Se rehacen** con estilos y librerías de animación nativas |
| `qrcodejs` (QR) | 🔁 Se sustituye por una librería de QR de React Native |

## Riesgos / deuda técnica detectada

- 🔐 **Clave anon de Supabase embebida** en el cliente y **sin RLS visible**: cualquiera
  con la clave puede leer/escribir en `votes`. Hay que endurecer seguridad antes de
  publicar (ver [ADR-003](./05-decisiones.md)).
- 🧩 **Sin autenticación**: la identidad es un `user_id` improvisado; colisiones posibles.
- 🗃️ **Modelo de datos mínimo**: presencia y votos comparten tabla con el truco
  `__presence__`; conviene revisarlo para producción.
- 📦 **Todo en un archivo**: imposible de testear o mantener a escala; la migración lo
  resuelve por diseño.
