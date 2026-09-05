# 03 · Arquitectura objetivo (Expo)

> 🟡 **Borrador.** Define cómo será la app nativa. Se irá concretando conforme avancemos.

## Stack

| Capa | Elección | Por qué |
|------|----------|---------|
| Framework | **React Native + Expo** (managed) | Un código → iOS + Android; DX simple |
| Lenguaje | **TypeScript** | Seguridad de tipos; el dataset y la lógica ganan robustez |
| Navegación | **Expo Router** (file-based) | Navegación por archivos, simple y estándar |
| Estado | Empezar con Context/estado local; valorar Zustand si crece | Evitar sobre-ingeniería |
| Backend/datos | **Supabase** vía `supabase-js` (pendiente confirmar) | Reutiliza lo existente |
| Tiempo real | Supabase Realtime (canal por sala) | Sustituye el WebSocket manual actual |
| Animaciones | `react-native-reanimated` + `react-native-gesture-handler` | Swipe y efectos fluidos |
| QR | Librería QR de RN (a elegir) | Sustituye `qrcodejs` |
| Build/deploy | **EAS Build + EAS Submit** | Compila iOS sin Mac; publica en stores |

## Estructura de carpetas propuesta

```
/ (raíz del repo)
├── app/                 # Pantallas (Expo Router)
│   ├── index.tsx        # Inicio (crear/unirse)
│   ├── waiting.tsx      # Sala de espera
│   ├── setup.tsx        # Filtros
│   ├── swipe.tsx        # Baraja de nombres
│   └── summary.tsx      # Resumen / matches
├── src/
│   ├── components/      # Carta de nombre, botones, etc.
│   ├── data/
│   │   └── names.ts     # Dataset extraído de NAMES_DB (tipado)
│   ├── lib/
│   │   ├── supabase.ts  # Cliente Supabase (config por env)
│   │   ├── room.ts      # Crear/unirse a sala, presencia
│   │   └── match.ts     # Lógica de match
│   ├── hooks/           # useRoom, useRealtime, useSwipe...
│   ├── theme/           # Tokens de color (claro/oscuro), tipografías
│   └── types.ts         # Tipos compartidos (Name, Vote, RoomState...)
├── assets/              # Iconos, splash, fuentes
├── app.json / app.config.ts  # Config de Expo (nombre, iconos, permisos)
├── eas.json             # Perfiles de build (dev / preview / production)
├── docs/                # Esta documentación
└── index.html           # (legado) la web original, de referencia
```

## Modelo de datos (objetivo)

Punto de partida: la tabla `votes` actual. A revisar en la fase de backend:
- Separar **presencia** de **votos** (no reutilizar el truco `__presence__`).
- Definir tabla `rooms` explícita (código, estado, filtros, creada_en).
- Añadir **RLS** para que cada quien solo acceda a su sala.
- Tipos `Name`, `Vote`, `Room` en `src/types.ts` alineados con la BD.

## Tipos base (borrador)

```ts
type Gender = 'girl' | 'boy';

interface Name {
  n: string;            // nombre
  g: Gender;            // género
  o: string;            // origen
  m: string;            // significado
  santo?: string;       // onomástica
  curioso?: string;     // dato curioso
  famosos?: string[];   // personas célebres
}

interface Vote {
  roomCode: string;
  userId: string;
  name: string;
  liked: boolean;
}
```

## Cómo se reemplaza cada pieza de la web

- **Pantallas** (`div.screen`) → rutas de Expo Router en `app/`.
- **`showScreen()`** → navegación de Expo Router.
- **CSS + animaciones** → `StyleSheet` + Reanimated/Gesture Handler.
- **`fetch` REST a Supabase** → `supabase-js` (`.from('votes')...`).
- **WebSocket manual** → `supabase.channel(...)` con suscripción a `postgres_changes`.
- **`qrcodejs`** → componente QR nativo.
- **Emojis (❤️, ✕, etc.)** → **iconos vectoriales** de Feather Icons o Heroicons (SVG, gratis).
- **Tema claro/oscuro** → tokens en `src/theme` + `useColorScheme`.

## Requisitos para publicar (pendiente detallar en el plan)

- Cuenta de Apple Developer (iOS) y de Google Play Console (Android).
- Iconos y splash screen definitivos.
- Endurecer seguridad de Supabase (RLS, secretos por entorno).
- Política de privacidad (requisito de ambas stores).

> Las decisiones abiertas de esta sección viven en [05 · Decisiones](./05-decisiones.md).
