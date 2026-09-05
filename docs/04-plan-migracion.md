# 04 · Plan de migración

> 🟡 **Borrador.** Hoja de ruta por fases para pasar de la web a las apps nativas.
> Cada fase deja algo **funcionando y comprobable** antes de seguir.

## Principios

- Migrar en vertical: primero un flujo mínimo de punta a punta, luego se enriquece.
- No romper la web actual (`index.html` sigue como referencia en `main`).
- Reutilizar datos y lógica antes de reescribir UI.

## Fase 0 — Preparación (documentación) ✅ completada

- [x] Clonar el repo y crear la rama `transform-to-app`.
- [x] Documentar definición funcional y arquitectura actual.
- [x] Confirmar decisión de backend (ver [ADR-002](./05-decisiones.md)).

## Fase 1 — Andamiaje del proyecto Expo ✅ completada

- [x] Crear el proyecto Expo + TypeScript en el repo.
- [x] Configurar Expo Router y la estructura de carpetas de [03](./03-arquitectura-objetivo.md).
- [x] Arrancar en Expo Go (iOS y Android) con una pantalla "Hola BebéMatch".
- [x] Configurar `eas.json` con perfiles dev/preview/production.

## Fase 2 — Datos y tema ✅ completada

- [x] Extraer `NAMES_DB` del `index.html` a `src/data/names.ts` (tipado).
- [x] Portar los tokens de color y el tema claro/oscuro.
- [x] Componente **Carta de nombre** con todos los campos (significado, santo, curioso...).

## Fase 3 — Flujo en solitario (sin red) ✅ completada

- [x] Pantalla de inicio.
- [x] Pantalla de setup (filtros de género y origen).
- [x] Pantalla de swipe con gestos fluidos (Reanimated + Gesture Handler).
- [x] Pantalla de resumen con los "me gusta".
- *Meta:* una persona puede recorrer toda la app sin backend.

## Fase 4 — Multijugador (Supabase) ✅ completada

- [x] Cliente `supabase.ts` con credenciales por variables de entorno.
- [x] Crear/unirse a sala + presencia (modelo en Supabase Realtime).
- [x] Suscripción Realtime por sala y detección de match en vivo.
- [x] Compartir código nativo / unirse a la sala.
- *Meta:* dos móviles en la misma sala, con matches en tiempo real.

## Fase 5 — Endurecer y pulir ✅ completada

- [x] Seguridad de Supabase: RLS, secretos fuera del código (ver [ADR-003](./05-decisiones.md)).
- [x] Animaciones de match/confeti y detalles de experiencia.
- [x] Decidir si migra el easter egg (ver [ADR-004](./05-decisiones.md)).
- [x] Iconos, splash y nombre de app definitivos.

## Fase 6 — Publicación

- [ ] Cuenta Apple Developer y Google Play Console.
- [ ] Política de privacidad.
- [ ] Builds de producción con EAS y envío a las stores (EAS Submit).
- [ ] Prueba en TestFlight / pista interna de Play antes del lanzamiento.

## Estado actual
 
Fases 0, 1, 2, 3, 4 y 5 completadas y validadas con éxito en dispositivos Android reales (incluida prueba multijugador con túnel y tiempo real entre 2 móviles). En curso: **Fase 6 (Publicación)**. Próximo hito: Política de privacidad, configuración de EAS Build para producción y preparación de tiendas.
