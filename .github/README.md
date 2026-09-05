# 🏗️ .github — Artefactos internos de desarrollo

Organización de la documentación interna, contexto técnico y workflows del proyecto BebéMatch.

## 📄 Archivos principales

### **[CONTEXT.md](./CONTEXT.md)** ⭐ **EMPIEZA POR AQUÍ**
El archivo de referencia permanente. Contiene:
- Stack de tecnologías (Expo, TypeScript, Supabase, etc.)
- Decisiones técnicas inmutables
- Estructura de carpetas
- Convenciones de código
- Modelo de datos
- Paleta de colores
- Definición de "hecho"

**Lee esto antes de cada sesión de desarrollo.**

### **[PROJECT.md](./PROJECT.md)** (próximo)
Overview del proyecto:
- Qué es BebéMatch
- Modos (pareja + solitario)
- MVP scope
- Timeline estimado

### 📊 Riesgos
Los riesgos del proyecto (matriz, severidad, timeline de resolución) están documentados en:
**[docs/09-riesgos.md](../docs/09-riesgos.md)** — Lista completa a monitorear y trabajar durante el desarrollo.

### ARCHITECTURE/ (próximo)
Documentación técnica profunda:
- `stack.md` — Detalle de cada librería y por qué
- `data-model.md` — Schema Supabase, tipos TS
- `decisions.md` — ADR (Architecture Decision Records)

### DEVELOPMENT/ (próximo)
Guías de desarrollo:
- `conventions.md` — Estándares de código, naming, commits
- `workflows.md` — Cómo trabajar con EAS, CI/CD
- `checklist.md` — Antes de un PR, antes de publicar

---

## 🚀 Cómo empezar a desarrollar

1. **Lee [CONTEXT.md](./CONTEXT.md)** — Entiende el stack y decisiones
2. **Rama:** Trabaja en `transform-to-app` (no en `main`)
3. **Commits:** Sigue convenciones (`feat/x`, `fix/x`, `docs/x`)
4. **Final:** Lee el checklist antes de hacer PR

---

## 📂 Estructura

```
.github/
├── README.md             ← Tú estás aquí
├── CONTEXT.md            ← Contexto base (LÉELO SIEMPRE)
├── PROJECT.md            ← Overview del proyecto
├── ARCHITECTURE/
│   ├── stack.md
│   ├── data-model.md
│   └── decisions.md
├── DEVELOPMENT/
│   ├── conventions.md
│   ├── workflows.md
│   └── checklist.md
└── workflows/            ← GitHub Actions (auto-generated)
```

---

## 🔗 Links importantes

| Recurso | Ubicación |
|---------|-----------|
| **Checklist de construcción** | [docs/00-checklist-construccion.md](../docs/00-checklist-construccion.md) |
| **Definición funcional** | [docs/01-definicion-funcional.md](../docs/01-definicion-funcional.md) |
| **Plan de migración** | [docs/04-plan-migracion.md](../docs/04-plan-migracion.md) |
| **UI/UX analysis** | [docs/07-analisis-ui-mejoras.md](../docs/07-analisis-ui-mejoras.md) |
| **Referencias visuales** | [docs/08-referencias-apps-visuales.md](../docs/08-referencias-apps-visuales.md) |

---

## ✨ Próximos pasos

- [ ] Crear `PROJECT.md` — Overview
- [ ] Crear `ARCHITECTURE/` — Documentación técnica
- [ ] Crear `DEVELOPMENT/` — Guías de desarrollo
- [ ] Inicializar proyecto Expo (Fase 1)

---

**Última actualización:** 2026-09-05  
**Rama:** `transform-to-app`
