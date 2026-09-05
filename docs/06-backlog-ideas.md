# 06 · Backlog de funcionalidades e ideas

> Lista viva de funcionalidades e ideas para incluir **en el futuro**. No es un compromiso ni
> un orden de prioridad: es el "cajón de ideas". Cuando una idea se decide y se planifica,
> pasa al [plan de migración](./04-plan-migracion.md) y, si tiene calado, se registra en el
> [ADR](./05-decisiones.md).

Estado de cada idea: 💡 idea · 🔎 en estudio · ✅ aprobada (a planificar) · ❌ descartada

---

## Ideas pendientes

### 💡 Añadir nombres propios a la baraja
Permitir que los usuarios **incluyan sus propios nombres** en la lista para que entren en el
juego (además de los del dataset).

- A definir: ¿los nombres añadidos son solo para esa partida/sala o se guardan?
- A definir: en modo pareja, ¿los ve también la otra persona y pueden hacer match con ellos?
- A definir: campos mínimos de un nombre añadido (¿solo el nombre, o también género/origen?).
- A tener en cuenta: moderación / contenido inapropiado si algún día se comparte.

### 💡 Elegir el número máximo de nombres del juego
Permitir **seleccionar el número máximo de nombres** que entran en la partida (p. ej. 20, 50,
100...) para hacer sesiones más cortas o más largas.

- A definir: valores/preset disponibles y valor por defecto.
- A definir: cómo se eligen esos N nombres (aleatorio, por relevancia, respetando filtros).
- A definir: en pareja, ambos juegan con la **misma** baraja (mismo N y mismos nombres).

### 💡 Más nombres y más tipologías de nombres (extras)
Ampliar el contenido: **más nombres** y **nuevas tipologías/categorías** de nombres como
extras (además de los orígenes actuales: griego, latino, hebreo, etc.).

- Ejemplos de posibles tipologías: nombres compuestos, unisex, cortos, mitológicos,
  literarios, por temática, tendencias por país/año...
- A definir: cómo se organizan (¿nuevos "orígenes" o una dimensión aparte de "categoría"?).
- A tener en cuenta: si son "extras", ¿desbloqueables, opcionales o incluidos por defecto?
- Enlaza con el modelo de datos del dataset (ver [03 · Arquitectura objetivo](./03-arquitectura-objetivo.md)).

---

## Cómo se usa este backlog

- Añade ideas nuevas como una entrada `### 💡 <título>` con un par de líneas de contexto.
- Cuando una idea se estudia, cámbiale el estado y anota decisiones/dudas debajo.
- Al aprobarse, muévela (o enlázala) al plan de migración con su fase correspondiente.
