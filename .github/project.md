# 📱 PROJECT — BebéMatch App

> Overview del proyecto, scope, timeline y objetivos.

---

## ¿Qué es BebéMatch?

**"Tinder de nombres de bebé"** — App nativa (iOS + Android) que permite a parejas o personas solas descubrir, explorar y guardar nombres de bebé.

**Sitio actual:** https://www.bebematch.app (web con Supabase)  
**Transformación:** Migrar a React Native + Expo (un código base → iOS + Android)

---

## 🎮 Modos de juego

### Modo Pareja (multijugador, tiempo real)
- 👥 Dos personas se emparejan con un código de sala
- 🔄 Ambas ven la misma baraja de nombres
- 💬 Swipes sincronizados en tiempo real (Supabase Realtime)
- ✨ **Match:** Cuando ambas personas votan el mismo nombre → celebración con confeti
- 📊 Resumen final: lista de matches y favoritos personales

**Gancho comercial:** La emoción de encontrar matches juntos.

### Modo Solitario (un jugador, local)
- 🧑 Persona sola explora nombres a su ritmo
- ❤️ Guarda favoritos en una lista personal
- 🎯 Sin presión, sin sincronización
- 📱 Datos guardados localmente (o sincronizados a cloud opcional)

**Caso de uso:** Alguien que quiere explorar solos sus opciones antes de compartir con la pareja.

---

## 📦 MVP Scope (Fase 6: Publicación)

Cuando publiquemos en stores, la app debe tener:

### Funcionalidades core
- ✅ Crear sala (pareja) o iniciar modo solitario
- ✅ Unirse a sala con código 4-dígitos
- ✅ Baraja de 473+ nombres con filtros (género, origen)
- ✅ Swipe derecha (me gusta) / izquierda (no me gusta)
- ✅ Match en tiempo real con celebración (confeti, sonido)
- ✅ Resumen de matches y favoritos
- ✅ Tema claro/oscuro automático

### Seguridad / Privacidad
- ✅ No guardar datos sensibles en el dispositivo
- ✅ Política de privacidad en la app
- ✅ Derecho al olvido (borrar datos)
- ✅ Sin telemetría invasiva

### Assets
- ✅ App icon (1024x1024 + variantes)
- ✅ Splash screen (vectorial, responsive)
- ✅ Iconos vectoriales (Feather Icons / Heroicons)
- ✅ Tipografías (Inter, Instrument Serif)

### Stores
- ✅ Subida a Apple App Store (iOS)
- ✅ Subida a Google Play Store (Android)
- ✅ Descripciones, screenshots, rating, soporte

---

## 📅 Timeline estimado (6 fases)

| Fase | Objetivo | Duración est. | Estado |
|------|----------|---------------|--------|
| **0** | Preparación + documentación | ✅ Hecho | ✅ |
| **1** | Andamiaje Expo + estructura | 1-2 sem | 🔴 Próximo |
| **2** | Datos + tema + componentes | 2-3 sem | 🔴 |
| **3** | Flujo solitario (sin red) | 1-2 sem | 🔴 |
| **4** | Multijugador + Supabase | 2-3 sem | 🔴 |
| **5** | Pulir + seguridad + assets | 2-3 sem | 🔴 |
| **6** | Publicación en stores | 1 sem | 🔴 |

**Total estimado:** 10-16 semanas  
**Hito crítico:** Decisión de backend (Supabase o cambiar) — afecta todas las fases

---

## 🎯 Criterios de éxito

Una vez publicada, la app debe:
- ✅ Funcionar sin lag en iOS 15+ y Android 10+
- ✅ Swipes fluidos (60fps, Reanimated)
- ✅ Sincronización en tiempo real <500ms
- ✅ Offline resilience (modo solitario funciona sin conexión)
- ✅ Carga inicial <3 segundos
- ✅ Battery/data friendly (no consume recursos innecesarios)
- ✅ Accesible (texto legible, contraste, teclado)

---

## 📚 Documentación relacionada

- **Definición funcional:** [docs/01-definicion-funcional.md](../docs/01-definicion-funcional.md)
- **Plan de migración:** [docs/04-plan-migracion.md](../docs/04-plan-migracion.md)
- **Decisiones técnicas:** [docs/05-decisiones.md](../docs/05-decisiones.md)
- **Arquitectura objetivo:** [docs/03-arquitectura-objetivo.md](../docs/03-arquitectura-objetivo.md)

---

**Última actualización:** 2026-09-05  
**Rama:** `transform-to-app`
