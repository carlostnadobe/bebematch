# 🏗️ CONTEXTO BASE — Arquitectura y decisiones del proyecto

> **Este es el archivo de referencia permanente.** Léelo antes de cada consulta de desarrollo.
> Última actualización: 2026-09-05

---

## 📌 Proyecto: BebéMatch

**Descripción:** App nativa para iOS y Android. "Tinder de nombres de bebé" — modo en pareja (match en tiempo real) y modo solitario (exploración personal).

**Repositorio:** https://github.com/carlostnadobe/bebematch  
**Rama de trabajo:** `transform-to-app` (desarrollo)  
**Rama estable:** `main` (web original)

---

## 🎯 Decisiones técnicas (inmutables)

| Decisión | Valor | Reasoning |
|----------|-------|-----------|
| **Framework** | React Native + Expo | Un código → iOS + Android sin duplicar |
| **Lenguaje** | TypeScript | Tipado fuerte, seguridad en datos |
| **Navegación** | Expo Router | File-based, estándar moderno |
| **Estado** | Context API + Zustand (si escala) | Comienza simple, escala si es necesario |
| **Animaciones** | Reanimated + Gesture Handler | Swipe fluido, 60fps |
| **Backend** | Supabase (Postgres + Realtime) | Multijugador en tiempo real |
| **Iconografía** | Feather Icons / Heroicons | Vectorial, gratis, NO emojis |
| **Estilos** | ITCSS + BEM | Organización clara, reutilizable |
| **Build/Deploy** | EAS Build + EAS Submit | Compila iOS sin Mac, publica en stores |

---

## 📂 Stack de desarrollo

```
Frontend:
  - React Native (UI nativa)
  - Expo (tooling, managed workflow)
  - TypeScript (lenguaje)
  - Reanimated v3 (animaciones)
  - Gesture Handler (gestos)
  - React Navigation / Expo Router (navegación)

Backend:
  - Supabase (host: myakshqgodbvwnbnvjjn.supabase.co)
  - PostgreSQL (BD)
  - Supabase Realtime (WebSocket, multijugador)
  - PostgREST (REST API)

DevOps:
  - EAS Build (compilación iOS/Android en cloud)
  - EAS Submit (publicación en stores)
  - GitHub Actions (CI/CD)

Linting/Format:
  - ESLint
  - Prettier
  - TypeScript compiler
```

---

## 🏢 Estructura de carpetas (Expo Router)

```
C:\Proyectos\bebematch\
├── .github/                    ← Artefactos internos (ESTE ARCHIVO)
│   ├── CONTEXT.md             ← Tú estás aquí
│   ├── PROJECT.md
│   ├── ARCHITECTURE/
│   │   ├── stack.md
│   │   ├── data-model.md
│   │   └── decisions.md
│   └── DEVELOPMENT/
│       ├── workflows.md
│       └── conventions.md
│
├── docs/                        ← Documentación pública
│   ├── 00-checklist-construccion.md
│   ├── 01-definicion-funcional.md
│   ├── 02-arquitectura-actual.md
│   ├── 03-arquitectura-objetivo.md
│   ├── 04-plan-migracion.md
│   ├── 05-decisiones.md
│   ├── 06-backlog-ideas.md
│   ├── 07-analisis-ui-mejoras.md
│   ├── 08-referencias-apps-visuales.md
│   └── assets/                 ← Capturas de referencias
│
├── app/                         ← Pantallas (Expo Router)
│   ├── index.tsx              ← Home (crear/unirse a sala)
│   ├── waiting.tsx            ← Sala de espera
│   ├── setup.tsx              ← Filtros (género, origen, duración)
│   ├── swipe.tsx              ← Baraja de nombres
│   ├── summary.tsx            ← Resumen / matches
│   └── _layout.tsx            ← Navigador principal
│
├── src/
│   ├── components/            ← Componentes reutilizables
│   │   ├── Card/              ← Tarjeta de nombre
│   │   ├── Button/            ← Botones (primary, secondary, etc.)
│   │   ├── Pills/             ← Filtros
│   │   └── ...
│   │
│   ├── data/
│   │   ├── names.ts           ← Dataset tipado (473 nombres)
│   │   └── constants.ts       ← Constantes (códigos válidos, etc.)
│   │
│   ├── lib/
│   │   ├── supabase.ts        ← Cliente Supabase
│   │   ├── room.ts            ← Crear/unirse a sala
│   │   ├── match.ts           ← Lógica de match
│   │   ├── auth.ts            ← Autenticación anónima
│   │   └── realtime.ts        ← Tiempo real
│   │
│   ├── hooks/
│   │   ├── useRoom.ts         ← Estado de la sala
│   │   ├── useSwipe.ts        ← Lógica de swipe
│   │   ├── useRealtime.ts     ← Suscripciones
│   │   └── ...
│   │
│   ├── contexts/
│   │   ├── RoomContext.ts     ← Contexto de sala
│   │   └── UserContext.ts     ← Contexto de usuario
│   │
│   ├── theme/
│   │   ├── colors.ts          ← Tokens de color (claro/oscuro)
│   │   ├── typography.ts      ← Tipografías
│   │   ├── spacing.ts         ← Espaciados
│   │   └── styles.ts          ← Estilos base
│   │
│   ├── types.ts               ← Tipos TS compartidos
│   └── utils/                 ← Utilidades
│
├── assets/
│   ├── icons/                 ← Feather Icons (SVG)
│   ├── splash.png             ← Splash screen
│   ├── app-icon.png           ← App icon
│   └── fonts/                 ← Inter, Instrument Serif
│
├── .env.example               ← Variables de entorno (template)
├── .gitignore                 ← Archivos ignorados
├── app.json                   ← Config Expo (nombre, versión, permisos)
├── app.config.ts              ← Config avanzada (variables de entorno)
├── eas.json                   ← Perfiles EAS (dev, preview, production)
├── tsconfig.json              ← Configuración TypeScript
├── eslintrc.json              ← Linter
├── .prettierrc                ← Formateador
├── package.json               ← Dependencias
├── index.html                 ← (LEGADO) Web original, de referencia
└── README.md                  ← Este proyecto
```

---

## 🎮 Flujos principales de la app

### Flujo en pareja (gancho comercial)
```
Home → Crear sala (genera código + QR)
     ↓
Waiting → Esperar a pareja (realtime)
     ↓
Setup → Ambos eligen filtros (sincronizado)
     ↓
Swipe → Cada uno desliza sobre nombres (realtime)
     ↓
Match ← Cuando ambos votan el mismo nombre (celebración + confeti)
     ↓
Summary → Resumen de matches y favoritos
```

### Flujo en solitario
```
Home → Modo un jugador
     ↓
Setup → Elegir filtros (local, sin sala)
     ↓
Swipe → Deslizar sobre nombres (local)
     ↓
Summary-Solo → Tu lista de favoritos
```

---

## 🗂️ Modelo de datos (Supabase)

### Tabla: `votes`
```typescript
interface Vote {
  id: uuid;                // PK
  room_code: string;       // FK a rooms
  user_id: string;         // ID temporal del dispositivo
  name: string;            // Nombre votado (o "__presence__" para anunciar)
  liked: boolean;          // true = me gusta, false = no me gusta
  created_at: timestamp;
}
```

### Tabla: `rooms` (futura, si se necesita)
```typescript
interface Room {
  code: string;            // PK (4 caracteres, alfanumérico)
  created_at: timestamp;
  updated_at: timestamp;
  status: "waiting" | "active" | "done";
}
```

---

## 🎨 Paleta de colores (CSS variables)

```css
/* Temas */
--salmon: #E8735A           /* Primario, salmón */
--secondary: #9B6FA1        /* Secundario, púrpura */
--success: #4ADE80          /* Verde, éxito *)
--warning: #FCD34D          /* Amarillo, atención */
--error: #FF6B9D            /* Rosa/coral, error *)

/* Fondos */
--bg: #0A0A0A               /* Fondo principal (oscuro) */
--surface: #141414          /* Superficie 1 */
--surface2: #1C1C1C         /* Superficie 2 */
--surface3: #242424         /* Superficie 3 */

/* Texto */
--text: #F5F5F5             /* Texto principal */
--text2: #A0A0A0            /* Texto secundario */
--text3: #606060            /* Texto terciario */

/* Otros */
--border: rgba(255,255,255,.08)     /* Bordes sutiles */
--glass: rgba(255,255,255,.04)      /* Efecto cristal */
```

---

## 📋 Convenciones de código

### TypeScript
- Nombres de tipos: `PascalCase` (ej: `User`, `Vote`)
- Nombres de variables/funciones: `camelCase` (ej: `getUserVotes`, `roomCode`)
- Constantes: `UPPER_SNAKE_CASE` (ej: `MAX_NAME_LENGTH`)
- Interfaces: prefijo `I` (ej: `IVote`, `IRoom`)

### Componentes
- Nombrados en `PascalCase` (ej: `CardName.tsx`, `PillFilter.tsx`)
- Un componente por archivo
- Estilos colocados en `styles.ts` al lado

### Estilos (ITCSS + BEM)
- No usar emojis en clases
- Nombres globales: `.card`, `.button`, `.button--primary`, `.card__header`
- No nombres de acciones: NO `.swipe-right`, SÍ `.card--active`

### Git
- Ramas: `feat/x`, `fix/x`, `docs/x`
- Commits: imperativo, presente ("add feature" no "added feature")
- Final: `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`

---

## 🚀 Fases de desarrollo (del plan de migración)

| Fase | Objetivo | Estado |
|------|----------|--------|
| **0** | Preparación + documentación | ✅ Hecho |
| **1** | Andamiaje Expo + Expo Router | 🟡 Próximo |
| **2** | Datos + tema + componentes | 🔴 Pendiente |
| **3** | Flujo solitario (sin red) | 🔴 Pendiente |
| **4** | Multijugador + Supabase | 🔴 Pendiente |
| **5** | Pulir + seguridad + assets | 🔴 Pendiente |
| **6** | Publicación en stores | 🔴 Pendiente |

---

## 📚 Documentación relacionada

- **Definición funcional:** [docs/01-definicion-funcional.md](../../docs/01-definicion-funcional.md)
- **Arquitectura actual (web):** [docs/02-arquitectura-actual.md](../../docs/02-arquitectura-actual.md)
- **Arquitectura objetivo (Expo):** [docs/03-arquitectura-objetivo.md](../../docs/03-arquitectura-objetivo.md)
- **Plan de migración:** [docs/04-plan-migracion.md](../../docs/04-plan-migracion.md)
- **Análisis UI/UX:** [docs/07-analisis-ui-mejoras.md](../../docs/07-analisis-ui-mejoras.md)
- **Checklist de construcción:** [docs/00-checklist-construccion.md](../../docs/00-checklist-construccion.md)

---

## 🔑 Decisiones bloqueantes (por resolver)

1. **Backend definitivo** — Mantener Supabase o cambiar (ver [ADR-002](../../docs/05-decisiones.md))
2. **Autenticación** — ¿Anónima de Supabase o custom?
3. **Easter egg** — ¿Migrar mini-juego a Expo o descartar?

---

## ✅ Definición de "hecho"

Una funcionalidad se considera **hecho** cuando:
- ✅ Funciona en iOS y Android (probado en Expo Go o build de desarrollo)
- ✅ Paridad funcional con la web (o diferencia documentada)
- ✅ Sin claves ni secretos en el código
- ✅ Estados de carga/error/sin-conexión implementados
- ✅ Documentación afectada actualizada
- ✅ Tests si es crítico

---

**Usa este archivo como referencia antes de cada consulta de desarrollo. Mantén este contexto en mente siempre.**
