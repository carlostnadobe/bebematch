# 📚 Documentación — BebéMatch → App nativa (iOS + Android)

Esta carpeta es la **fuente de verdad** del proyecto mientras transformamos la web actual
(`index.html`) en una app nativa para iOS y Android con **React Native + Expo**.

Los documentos son vivos: se van alimentando y corrigiendo según avanza el trabajo.
Cuando algo cambie, se actualiza el documento correspondiente (no se crean copias sueltas).

## Índice de artefactos

| # | Documento | Para qué sirve | Estado |
|---|-----------|----------------|--------|
| 00 | [⭐ Checklist maestro de construcción](./00-checklist-construccion.md) | **Empieza por aquí.** Todo lo que hay que cubrir (diseño, assets, APIs, seguridad, testing, stores…) para no entregar una app incompleta | 🟢 Base lista |
| 00 | [Guía de trabajo](./00-guia-de-trabajo.md) | Cómo trabajamos, convenciones, flujo de ramas y de decisiones | 🟢 Base lista |
| 01 | [Definición funcional](./01-definicion-funcional.md) | Qué es la app, qué hace, pantallas y reglas de negocio | 🟢 Base lista |
| 02 | [Arquitectura actual (web)](./02-arquitectura-actual.md) | Cómo está hecho hoy el `index.html` + Supabase | 🟢 Base lista |
| 03 | [Arquitectura objetivo (Expo)](./03-arquitectura-objetivo.md) | Cómo será la app nativa: stack, estructura, decisiones técnicas | 🟡 Borrador |
| 04 | [Plan de migración](./04-plan-migracion.md) | Hoja de ruta por fases para pasar de web a app | 🟡 Borrador |
| 05 | [Registro de decisiones (ADR)](./05-decisiones.md) | Decisiones importantes y su porqué, incl. las pendientes | 🟢 Base lista |
| 06 | [Backlog de ideas](./06-backlog-ideas.md) | Cajón de funcionalidades e ideas para el futuro | 🟢 Base lista |
| 07 | [Análisis y mejoras de UI/UX](./07-analisis-ui-mejoras.md) | Rediseño para hacerla atractiva, divertida, rápida y con personalidad (no "AI") | 🟢 Completo |
| 08 | [Guía visual de referencias](./08-referencias-apps-visuales.md) | Qué capturar de 6 apps (Tinder, Bumble, Spotify, Duolingo, Figma, Snapchat) y por qué | 🟢 Guía completa |
| 09 | [Análisis de riesgos](./09-riesgos.md) | Riesgos identificados, matriz de severidad, timeline de resolución por fase | 🟢 Completo |

Leyenda de estado: 🟢 base lista · 🟡 borrador / en construcción · 🔴 pendiente

## Decisiones ya tomadas

- **Stack de la app:** React Native + Expo (ver ADR-001).
- **Backend:** Supabase por ahora, decisión final **pendiente** (ver ADR-002).

## Cómo contribuir a esta doc

1. Trabaja siempre en la rama `transform-to-app` (o ramas que salgan de ella).
2. Si tomas una decisión de calado, añádela al [ADR](./05-decisiones.md).
3. Mantén el índice de arriba actualizado con el estado real de cada documento.

---

<!-- Revisión de documentación en curso (2026-09-05) — cambio de prueba para abrir PR -->
> 🔎 _Revisión de documentación en curso — 2026-09-05._
