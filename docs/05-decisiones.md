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

- **Estado:** ✅ **Aceptada** (2026-09-05).
- **Contexto:** La web usa Supabase (Postgres + Realtime) con una tabla `votes`.
- **Decisión:** Mantener **Supabase** como backend de tiempo real mediante el SDK oficial `@supabase/supabase-js`, aislando la lógica en `RoomContext`.
- **Consecuencias:** Permite sincronización inmediata entre dispositivos sin necesidad de mantener un servidor propio.

---

## ADR-003 · Seguridad de credenciales y datos

- **Estado:** ✅ **Aceptada e Implementada** (2026-09-05).
- **Contexto:** La clave anon no debe estar en el repositorio ni desprotegida en la BD.
- **Decisión:**
  - Variables de entorno en `.env` leídas por Expo (`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
  - Habilitación de **Row Level Security (RLS)** mediante el script `docs/supabase-rls.sql` para aislar los votos por `room_code`.
- **Consecuencias:** Cumplimiento de seguridad para la publicación en App Store y Google Play.

---

## ADR-004 · Futuro del easter egg (mini-juego)

- **Estado:** ✅ **Decidida** (2026-09-05).
- **Contexto:** La web incluía un mini-juego oculto de saltar obstáculos con confeti.
- **Decisión:** No incluir el mini-juego en el MVP v1.0 para mantener el bundle limpio y garantizar el cumplimiento estricto de las guías de revisión de las tiendas de apps. Se reevaluará como actualización opcional en v1.1.
- **Consecuencias:** Menor peso del bundle y foco total en la experiencia de match de nombres.

---

> Para añadir una decisión nueva: copia el formato de arriba, dale el siguiente número de
> ADR y enlázala desde donde corresponda en el resto de la documentación.
