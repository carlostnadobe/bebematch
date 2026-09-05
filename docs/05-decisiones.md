# 05 · Registro de decisiones (ADR)

Decisiones con impacto en el proyecto. Formato: contexto → decisión → estado → consecuencias.
Las decisiones **pendientes** también se listan para no perderlas de vista.

---

## ADR-001 · Stack de la app: React Native + Expo

- **Estado:** ✅ Aceptada (2026-09-05)
- **Contexto:** Hay que llevar una web (HTML/JS puro) a iOS y Android priorizando un solo
  código base, simplicidad y un proceso de desarrollo poco complejo.
- **Opciones consideradas:**
  - *Capacitor* (envolver la web): mínimo esfuerzo, pero gestos/animaciones se sienten
    menos nativos — y esta app depende mucho de ellos.
  - *React Native + Expo:* un código para ambas plataformas, lenguaje cercano (JS/TS),
    Expo simplifica compilación y publicación (EAS, sin Mac para iOS).
  - *Flutter:* excelente UI, pero exige Dart y reescritura total desde cero.
  - *PWA:* rápida pero limitada en iOS y sin presencia en las stores.
- **Decisión:** **React Native + Expo** con TypeScript.
- **Consecuencias:** Se reutilizan datos y lógica; se rehace la UI. Se depende del
  ecosistema Expo/EAS. Capacitor queda como plan B documentado.

---

## ADR-002 · Backend de la app

- **Estado:** 🟡 **Pendiente** de decisión del equipo.
- **Contexto:** La web usa Supabase (Postgres + Realtime) con una única tabla `votes` y la
  clave anon embebida. Funciona, pero el modelo es mínimo y sin seguridad para producción.
- **Opciones:**
  - *Mantener Supabase tal cual* — lo más rápido, arrastra la deuda de seguridad.
  - *Mantener Supabase y rediseñar* — separar salas/votos/presencia, añadir auth y RLS.
  - *Otro backend* — a valorar solo si aparece una razón de peso.
- **Decisión:** pendiente. Por defecto seguimos con Supabase para no bloquear la migración
  de UI; la decisión final se toma antes de la Fase 4 (multijugador).
- **Consecuencias:** El diseño de datos de [03](./03-arquitectura-objetivo.md) se marca como
  provisional hasta cerrar esta decisión.

---

## ADR-003 · Seguridad de credenciales y datos

- **Estado:** 🟡 **Pendiente / a implementar** en la migración.
- **Contexto:** Hoy la clave anon de Supabase está embebida en `index.html` y no se observa
  RLS; cualquiera podría leer/escribir en `votes`.
- **Dirección propuesta:**
  - Mover configuración a variables de entorno / `app.config.ts` (no hardcodear).
  - Activar **Row Level Security** y políticas por sala.
  - Revisar si hace falta autenticación (aunque sea anónima de Supabase).
- **Decisión:** se abordará en Fase 5 como requisito previo a publicar. Registrar aquí la
  solución final cuando se implemente.

---

## ADR-004 · Futuro del easter egg (mini-juego)

- **Estado:** 🟡 **Pendiente** (bajo impacto).
- **Contexto:** La web incluye un mini-juego oculto de "saltar obstáculos" con confeti.
- **Decisión:** decidir en Fase 5 si se porta a la app o se descarta. No bloquea nada.

---

> Para añadir una decisión nueva: copia el formato de arriba, dale el siguiente número de
> ADR y enlázala desde donde corresponda en el resto de la documentación.
