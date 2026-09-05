# 01 · Definición funcional

> Reconstruida a partir del `index.html` actual (versión **v20.1**). Es el "qué hace" de la
> app, independiente de la tecnología. Sirve de contrato para la versión nativa.

## En una frase

**BebéMatch es un "Tinder de nombres de bebé".** Deslizas (swipe) sobre nombres que te
gustan o no, y descubres tus favoritos. Su forma estrella es **en pareja**: dos personas se
conectan a la misma sala y la app avisa cuando **ambos** coinciden en el mismo nombre →
*¡Match!*. Pero también se puede usar **en solitario** para explorar y quedarte con tu lista.

## Modos de uso

BebéMatch tiene **dos modos**, y la app debe soportar ambos con naturalidad:

- **👫 En pareja (modo estrella / gancho comercial):** dos personas en la misma sala, en
  tiempo real, con detección de *match* cuando coinciden. **Es el diferenciador principal
  del producto y el foco comercial** — hay que cuidarlo especialmente.
- **🧍 En solitario:** una sola persona desliza y obtiene su lista de nombres favoritos, sin
  necesidad de sala ni de otra persona. Sirve como entrada fácil (probar la app sin fricción)
  y para quien decide el nombre por su cuenta.

> Implicación de diseño: el flujo en solitario **no debe depender** de crear/unirse a una
> sala ni de la conexión en tiempo real. La sala y el *match* son una capa que se añade
> encima del flujo básico de swipe.

## Concepto y valor

- Elegir el nombre del bebé suele ser una negociación caótica. BebéMatch lo convierte en un
  juego rápido, con datos útiles de cada nombre.
- En pareja, aporta lo que ninguna lista estática ofrece: **coincidencias en tiempo real**
  entre dos personas. Ese es el valor comercial diferencial.
- En solitario, sigue siendo útil como explorador de nombres con favoritos.

## Actores

- **Usuario en solitario:** usa la app sin sala; desliza y obtiene su lista de favoritos.
- **Anfitrión (host):** crea la sala y obtiene un código de 4 caracteres (y un QR).
- **Pareja (guest):** se une introduciendo ese código o escaneando el QR.
- No hay cuentas de usuario ni login: la identidad es un `user_id` temporal por dispositivo.

## Flujo en pareja (happy path)

1. **Inicio** — El usuario crea una sala o se une a una existente con un código.
2. **Sala de espera** — Se muestra el código/QR y se espera a que la pareja se conecte.
3. **Configuración (setup)** — Se eligen filtros: género (niño/niña/ambos) y orígenes de los
   nombres (griego, latino, hebreo, etc.).
4. **Swipe** — Cada persona ve una baraja de nombres y desliza:
   - Derecha / ❤️ = me gusta.
   - Izquierda / ✕ = no me gusta.
   - Cada carta muestra: nombre, género, origen, significado y (si existe) santo, dato
     curioso y personas famosas con ese nombre.
5. **Match** — Cuando los dos han dado "me gusta" al mismo nombre, salta la pantalla de
   *Match* (con confeti / animación).
6. **Resumen** — Al terminar la baraja se muestran los matches y los "me gusta" para revisar,
   refinar y decidir. Existen variantes de resumen (conjunto, individual, refinar).

## Flujo en solitario (happy path)

1. **Inicio** — El usuario elige empezar en solitario (sin sala).
2. **Configuración (setup)** — Elige filtros: género y orígenes.
3. **Swipe** — Desliza sobre la baraja igual que en pareja (misma carta, mismos datos).
4. **Resumen individual** — Al terminar ve su lista de favoritos (`screen-summary-solo`).
   No hay *match* porque no hay segunda persona.

> El swipe y el setup son **compartidos** entre ambos modos; lo único que añade el modo en
> pareja es la sala, la presencia, el tiempo real y la pantalla de *match*.

## Pantallas (estados de la app)

Reconstruidas desde los `id` de la web:

| Pantalla | ID en la web | Propósito |
|----------|--------------|-----------|
| Inicio | `screen-home` | Crear o unirse a una sala |
| Espera | `screen-waiting` | Mostrar código/QR y esperar a la pareja |
| Configuración | `screen-setup` | Elegir género y orígenes |
| Espera de filtros | `screen-waiting-filters` | Sincronizar filtros entre los dos |
| Espera de resumen | `screen-waiting-summary` | Sincronizar el paso al resumen |
| Swipe | `screen-swipe` | Deslizar sobre los nombres |
| Match | `screen-match` | Celebración cuando ambos coinciden |
| Favoritos | `screen-liked` | Ver los "me gusta" propios |
| Resumen (refinar) | `screen-summary-refine` | Depurar la lista final juntos |
| Resumen (solo) | `screen-summary-solo` | Resumen individual |
| Resumen | `screen-summary` | Resultado final de coincidencias |

## Reglas de negocio clave

- **Sala:** código de 4 caracteres, alfabeto sin ambigüedades (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`,
  sin I/O/0/1). Una sala "existe" si tiene al menos un registro en la base de datos.
- **Match:** se produce cuando existe un "me gusta" del usuario A **y** uno del usuario B
  para el **mismo nombre**.
- **Presencia:** al entrar, cada usuario inserta un registro especial `__presence__` para
  anunciarse; así la pareja sabe que el otro está conectado.
- **Sincronización en tiempo real:** los votos del otro llegan al instante (ver arquitectura).
- **Sin persistencia de cuenta:** si cierras la app, la identidad se pierde; la sala vive
  mientras existan sus datos.

## Contenido: el dataset de nombres

Es el corazón de la app. Hoy vive embebido en el JS como `NAMES_DB`.

- **≈473 entradas** de nombres. Aproximadamente **200 de niña** y **210 de niño**.
- **Orígenes disponibles** (con su nº aproximado de nombres):
  calorró (56), sudamérica (55), hebreo (44), germánico (43), español (43), inglés (40),
  griego (40), reyes (37), clásico (27), latino (26), moderno (23).
- **Campos de cada nombre:**
  - `n` — nombre
  - `g` — género (`girl` / `boy`)
  - `o` — origen
  - `m` — significado
  - `santo` — onomástica (opcional)
  - `curioso` — dato curioso (opcional)
  - `famosos` — lista de personas célebres con ese nombre (opcional)

> En la migración, este dataset se extrae del HTML a un archivo de datos propio
> (JSON/TS) para poder mantenerlo, ampliarlo y versionarlo con facilidad.

## Extras y detalles de experiencia

- **Tema claro/oscuro** (paleta salmón sobre fondo oscuro por defecto).
- **Animaciones:** partículas de corazón, confeti en el match, transiciones entre pantallas.
- **Código QR** para unirse a la sala (librería `qrcodejs` en la web).
- **Easter egg:** un mini-juego oculto de "saltar obstáculos" accesible desde el inicio.
  (A decidir si se mantiene en la app — ver [ADR](./05-decisiones.md)).

## Fuera de alcance (por ahora)

- Cuentas de usuario / login persistente.
- Guardar el historial de nombres entre sesiones.
- Compartir resultados fuera de la app.

> Estos puntos pueden entrar más adelante; se registrarán como decisiones cuando toque.
