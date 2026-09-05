# 🔧 Stack de tecnologías

> Detalle de cada librería, versión recomendada y por qué.

---

## Frontend

### React Native + Expo
- **Versión:** Expo SDK 52+ (o latest)
- **Uso:** Framework principal para iOS + Android
- **Por qué:** Un código base, managed workflow, sin necesidad de Mac para compilar iOS
- **Docs:** https://docs.expo.dev

### TypeScript
- **Versión:** 5.x
- **Uso:** Lenguaje de tipado (previene bugs)
- **Por qué:** El dataset de nombres y la lógica de matches ganan robustez con tipos
- **Config:** `tsconfig.json` en raíz

### Expo Router
- **Versión:** Latest (integrado en Expo SDK 50+)
- **Uso:** Navegación file-based (como Next.js)
- **Por qué:** Estándar moderno, no requiere importar explícitamente
- **Estructura:** `app/` → pantallas automáticamente ruteadas
- **Docs:** https://expo.github.io/router

### Reanimated + Gesture Handler
- **Versión:** Reanimated 3.x, Gesture Handler 2.x
- **Uso:** Animaciones suaves (60fps) y gestos táctiles (swipe)
- **Por qué:** Necesario para swipe fluido de tarjetas (no es posible con Animated nativo)
- **Instalación:** Requiere config en `app.json` (Expo plugins)

### Feather Icons (o Heroicons)
- **Librería:** `feather-icons` (SVG) o `react-native-heroicons`
- **Versión:** Latest
- **Uso:** Iconografía vectorial
- **Por qué:** Gratis, accesible, NO emojis (requisito del proyecto)

### Supabase Client (supabase-js)
- **Versión:** 2.x
- **Uso:** Cliente para Supabase (REST API + Realtime WebSocket)
- **Por qué:** Misma BD que la web actual, facilita migración
- **Instalación:** `npm install @supabase/supabase-js`

### AsyncStorage
- **Versión:** `@react-native-async-storage/async-storage` v1.x
- **Uso:** Guardar datos localmente (favoritos, último estado)
- **Por qué:** Simple, built-in en Expo

---

## Backend (Cloud)

### Supabase
- **Host:** myakshqgodbvwnbnvjjn.supabase.co (ya configurado)
- **BD:** PostgreSQL 15+
- **Autenticación:** Anónima (pendiente confirmar en ADR-003)
- **Realtime:** Canales de WebSocket por sala

---

## DevOps / Build

### EAS Build
- **Versión:** Latest
- **Uso:** Compilar iOS + Android en la nube
- **Por qué:** iOS sin Mac, Android sin Android Studio
- **Configuración:** `eas.json` en raíz

### EAS Submit
- **Versión:** Latest
- **Uso:** Publicar directamente en App Store e Google Play

### GitHub Actions
- **Uso:** CI/CD (tests, linting, builds automáticos)
- **Ubicación:** `.github/workflows/`

---

## Linting / Formatting

### ESLint
- **Versión:** 9.x
- **Configuración:** `.eslintrc.json`

### Prettier
- **Versión:** 3.x
- **Configuración:** `.prettierrc`

### TypeScript compiler
- **Uso:** Chequeo de tipos (`tsc --noEmit`)

---

**Última actualización:** 2026-09-05
