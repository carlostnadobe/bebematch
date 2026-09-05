# 🏛️ Decisiones técnicas (ADR)

> Architecture Decision Records. Decisiones importantes, su razonamiento y estado.

---

## Decisiones ya tomadas (inmutables)

| # | Decisión | Estado |
|---|----------|--------|
| ADR-001 | Framework: React Native + Expo | ✅ Confirmada |
| ADR-005 | Lenguaje: TypeScript | ✅ Confirmada |
| ADR-006 | Navegación: Expo Router | ✅ Confirmada |
| ADR-007 | Animaciones: Reanimated + Gesture Handler | ✅ Confirmada |
| ADR-008 | Iconografía: Feather Icons (NO emojis) | ✅ Confirmada |
| ADR-009 | Estilos: ITCSS + BEM | ✅ Confirmada |
| ADR-010 | Build: EAS Build + EAS Submit | ✅ Confirmada |

---

## Decisiones pendientes (bloqueantes)

| # | Decisión | Bloqueador de | Estado |
|---|----------|---|---------|
| **ADR-002** | Backend: Mantener Supabase o cambiar | Fase 4 | 🔴 Pendiente |
| **ADR-003** | Autenticación: Anónima Supabase vs custom | Fase 4 | 🔴 Pendiente |
| **ADR-004** | Easter egg: Migrar mini-juego a Expo | Fase 5 | 🔴 Pendiente |

---

## ADR-001: React Native + Expo

**Decisión:** Usar React Native + Expo como framework principal

**Razonamiento:**
- Un código base → iOS + Android
- Managed workflow (sin necesidad de Mac)
- Comunidad grande, documentación sólida

**Confirmada:** Fase 0

---

## ADR-002: Backend — Supabase vs alternativas

**Decisión:** PENDIENTE

**Opciones:**
1. Mantener Supabase (mismo backend que web)
2. Cambiar a Firebase (generoso free tier)
3. Backend custom (control total)

**Timeline:** Decidir en Fase 1 para no afectar Fase 4

---

## ADR-003: Autenticación

**Decisión:** PENDIENTE

**Opciones:**
1. Autenticación anónima de Supabase
2. JWT custom
3. Sin autenticación (riesgoso)

**Timeline:** Decidir en Fase 4

---

## Referencias

- **Decisiones detalladas:** [docs/05-decisiones.md](../../docs/05-decisiones.md)
- **Riesgos:** [docs/09-riesgos.md](../../docs/09-riesgos.md)

---

**Última actualización:** 2026-09-05
