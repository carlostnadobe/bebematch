# 04 · Plan de migración

> 🟡 **Borrador.** Hoja de ruta por fases para pasar de la web a las apps nativas.
> Cada fase deja algo **funcionando y comprobable** antes de seguir.

## Principios

- Migrar en vertical: primero un flujo mínimo de punta a punta, luego se enriquece.
- No romper la web actual (`index.html` sigue como referencia en `main`).
- Reutilizar datos y lógica antes de reescribir UI.

## Fase 0 — Preparación (documentación) ✅ en curso

- [x] Clonar el repo y crear la rama `transform-to-app`.
- [x] Documentar definición funcional y arquitectura actual.
- [ ] Confirmar decisión de backend (ver [ADR-002](./05-decisiones.md)).

## Fase 1 — Andamiaje del proyecto Expo

- [ ] Crear el proyecto Expo + TypeScript en el repo.
- [ ] Configurar Expo Router y la estructura de carpetas de [03](./03-arquitectura-objetivo.md).
- [ ] Arrancar en Expo Go (iOS y Android) con una pantalla "Hola BebéMatch".
- [ ] Configurar `eas.json` con perfiles dev/preview/production.

## Fase 2 — Datos y tema

- [ ] Extraer `NAMES_DB` del `index.html` a `src/data/names.ts` (tipado).
- [ ] Portar los tokens de color y el tema claro/oscuro.
- [ ] Componente **Carta de nombre** con todos los campos (significado, santo, curioso...).

## Fase 3 — Flujo en solitario (sin red)

- [ ] Pantalla de inicio.
- [ ] Pantalla de setup (filtros de género y origen).
- [ ] Pantalla de swipe con gestos fluidos (Reanimated + Gesture Handler).
- [ ] Pantalla de resumen con los "me gusta".
- *Meta:* una persona puede recorrer toda la app sin backend.

## Fase 4 — Multijugador (Supabase)

- [ ] Cliente `supabase.ts` con credenciales por variables de entorno.
- [ ] Crear/unirse a sala + presencia (modelo revisado, sin `__presence__` si se decide).
- [ ] Suscripción Realtime por sala y detección de match en vivo.
- [ ] QR para unirse a la sala.
- *Meta:* dos móviles en la misma sala, con matches en tiempo real.

## Fase 5 — Endurecer y pulir

- [ ] Seguridad de Supabase: RLS, secretos fuera del código (ver [ADR-003](./05-decisiones.md)).
- [ ] Animaciones de match/confeti y detalles de experiencia.
- [ ] Decidir si migra el easter egg.
- [ ] Iconos, splash y nombre de app definitivos.

## Fase 6 — Publicación

- [ ] Cuenta Apple Developer y Google Play Console.
- [ ] Política de privacidad.
- [ ] Builds de producción con EAS y envío a las stores (EAS Submit).
- [ ] Prueba en TestFlight / pista interna de Play antes del lanzamiento.

## Estado actual

Estamos entre **Fase 0** y la preparación de **Fase 1**. Próximo hito sugerido: confirmar
backend y crear el andamiaje del proyecto Expo.
