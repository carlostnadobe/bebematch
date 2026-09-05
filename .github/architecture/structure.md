# 📂 Estructura de carpetas

> Cómo está organizado el proyecto y por qué.

---

## Árbol completo

```
C:\Proyectos\bebematch\
│
├── .github/
│   ├── context.md             ← ⭐ Contexto base (LÉELO SIEMPRE)
│   ├── readme.md              ← Guía de navegación
│   ├── project.md             ← Overview del proyecto
│   ├── architecture/
│   │   ├── stack.md
│   │   ├── structure.md
│   │   ├── data-model.md
│   │   └── decisions.md
│   ├── development/
│   │   ├── workflows.md
│   │   ├── conventions.md
│   │   └── checklist.md
│   └── workflows/             ← GitHub Actions (auto-generated)
│
├── docs/                       ← Documentación pública
│   └── ... (9 documentos)
│
├── app/                        ← Pantallas (Expo Router)
│   ├── index.tsx
│   ├── waiting.tsx
│   ├── setup.tsx
│   ├── swipe.tsx
│   └── summary.tsx
│
├── src/
│   ├── components/            ← Componentes reutilizables
│   ├── data/                  ← Dataset (473 nombres)
│   ├── lib/                   ← Integraciones (Supabase, room, match)
│   ├── hooks/                 ← Lógica reutilizable
│   ├── contexts/              ← Estado global
│   ├── theme/                 ← Tokens de diseño
│   ├── types.ts               ← Tipos TS compartidos
│   └── utils/                 ← Utilidades
│
├── assets/
│   ├── icons/                 ← Feather Icons (SVG)
│   ├── splash.png
│   ├── app-icon.png
│   └── fonts/
│
└── [configuración]
    ├── app.json
    ├── eas.json
    ├── tsconfig.json
    ├── eslintrc.json
    ├── .prettierrc
    └── package.json
```

---

## Convenciones

### Naming
- **Componentes:** PascalCase (CardName.tsx)
- **Archivos:** camelCase o kebab-case (useRoom.ts, data-model.md)
- **Carpetas:** lowercase (src/, components/, lib/)

### Estilos
- ITCSS + BEM
- StyleSheet colocado junto a componente (styles.ts)
- Nombres globales (`.card`, `.button--primary`)

### Imports
- Usar path aliases: `@/components`, `@/types`
- Definido en tsconfig.json

---

**Última actualización:** 2026-09-05
