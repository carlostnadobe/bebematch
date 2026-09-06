# 00 · Checklist maestro de construcción · ⭐ EMPIEZA POR AQUÍ

> Este es **el primer documento** que hay que tener presente. Es la lista completa de todo lo
> que debemos cubrir para entregar una app **correcta y completa** (no un prototipo a medias).
>
> Funciona como **guardarraíl**: nada se considera "entregable" hasta que su bloque esté ✅.
> Marca cada punto conforme se cierra. Los detalles técnicos viven en los otros documentos;
> aquí está el "¿me he dejado algo?".

Leyenda: `[ ]` pendiente · `[~]` en curso · `[x]` hecho · 🔴 bloqueante para publicar

---

## 1. Producto y alcance

- [ ] Alcance de la primera versión (MVP) cerrado: qué entra y qué **no**.
- [x] **Los dos modos soportados:** en pareja (gancho comercial, tiempo real) y en solitario
      (sin sala). El flujo en solitario no depende de la sala ni del tiempo real.
- [x] Flujos de usuario definidos de principio a fin (ver [docs/flujos/](./flujos/)).
- [x] Casos límite acordados: sala inexistente, pareja que se desconecta, sin conexión,
      baraja terminada, ambos votan a la vez, etc.
- [ ] Criterios de éxito del producto (qué significa que "funciona bien").

## 2. Diseño y UX/UI

- [x] **Design system** definido: colores (claro/oscuro), tipografías, espaciados, radios,
      sombras, tamaños de botón/toque (mínimo 44×44 pt).
- [x] Componentes clave diseñados: carta de nombre ([x]), botones de swipe ([x]), cabeceras ([x]),
      resumen ([x]), pantalla de match ([x]), toasts ([x]), modales ([x]).
- [ ] Estados de cada pantalla: normal, **cargando**, **vacío**, **error**, **sin conexión**.
- [ ] Prototipo o wireframes de las pantallas principales antes de codificar.
- [x] Microinteracciones y animaciones: swipe fluido con Reanimated ([x]), confeti ([x]), partículas ([x]).
- [x] Modo claro **y** oscuro revisados en ambos.
- [x] Diseño responsive: móviles pequeños y grandes, notch/safe areas.
- [x] Textos de UI revisados (ortografía, tono, consistencia) — están en español.

## 3. Assets

- [x] **Icono de app** en todas las resoluciones (iOS y Android, incluido adaptive icon Android).
- [x] **Splash screen** (pantalla de carga) para ambas plataformas.
- [ ] **Tipografías** empaquetadas y con licencia para uso en app (Inter, Instrument Serif).
- [ ] Imágenes/ilustraciones optimizadas (peso y formato adecuados; @1x/@2x/@3x o vectoriales).
- [ ] Feature graphic / capturas para las fichas de las stores.
- [ ] 🔴 **Licencias de todos los assets** verificadas (fuentes, iconos, sonidos si los hay).
- [x] 🔴 **Iconografía vectorial** — usar librería gratuita (Heroicons, **NO emojis**).
  - [x] Librería elegida: `react-native-heroicons` (`react-native-svg`).
  - [x] Mapeo de iconos completado (emojis eliminados y sustituidos por iconos vectoriales).
  - [x] SVGs correctamente empaquetados y optimizados en el bundle.

## 4. Arquitectura y código

- [x] Estructura de carpetas acordada (ver [03 · Arquitectura objetivo](./03-arquitectura-objetivo.md)).
- [x] TypeScript con tipos para datos y estado (`Name`, `Vote`, `Room`...).
- [x] Linter + formateador configurados (ESLint + Prettier) y pasando.
- [x] Convenciones de nombres y de commits acordadas.
- [ ] Sin código muerto ni credenciales en el repo.
- [ ] Manejo centralizado de errores y de estado de red.

## 5. Datos y contenido

- [x] Dataset de nombres extraído a archivo propio y **tipado** (`src/data/names.ts`).
- [ ] Validación del dataset: sin duplicados, campos obligatorios presentes, géneros/orígenes
      consistentes.
- [ ] Revisión editorial del contenido (significados, datos curiosos, famosos correctos).
- [ ] Estrategia para ampliar/actualizar nombres sin re-publicar (si aplica).

## 6. Backend y APIs

- [x] Decisión de backend cerrada (ver [ADR-002](./05-decisiones.md)).
- [ ] Modelo de datos definitivo (salas, votos, presencia) documentado.
- [x] Contrato de cada operación: crear sala, unirse, votar, borrar voto, tiempo real.
- [ ] Manejo de **errores de API** (timeouts, 4xx/5xx, reconexión de realtime).
- [ ] Comportamiento **offline** y reintentos definidos.
- [ ] Límites/cuotas del backend revisados (¿aguanta el uso previsto?).
- [ ] Entornos separados: desarrollo vs producción.

## 7. Seguridad y privacidad 🔴

- [x] 🔴 Credenciales fuera del código (variables de entorno / config de Expo), **nunca** hardcodeadas.
- [x] 🔴 **RLS** (Row Level Security) documentado con script de políticas por sala (`docs/supabase-rls.sql`).
- [ ] Revisar necesidad de autenticación (aunque sea anónima).
- [x] No se recogen datos personales innecesarios; si se recogen, se justifican.
- [x] Comunicaciones por HTTPS/WSS (ya es el caso con Supabase).
- [ ] 🔴 **Política de privacidad** publicada (obligatoria en ambas stores).
- [ ] Cumplimiento GDPR si hay usuarios en la UE (base legal, borrado de datos).
- [ ] Etiquetas de privacidad de la App Store y formulario de Data Safety de Google Play.

## 8. Rendimiento

- [x] Arranque rápido; splash no eterno.
- [x] Listas/baraja fluidas (60 fps en swipe) en gama media.
- [ ] Imágenes y assets optimizados; tamaño del bundle controlado.
- [ ] Sin fugas de memoria en sesiones largas (realtime, timers, listeners liberados).

## 9. Accesibilidad

- [x] Contraste de color suficiente (AA) en claro y oscuro (verificado según WCAG 2.1).
- [ ] Áreas de toque ≥ 44×44 pt.
- [ ] Etiquetas accesibles para lectores de pantalla (VoiceOver/TalkBack).
- [ ] Respeta el tamaño de fuente del sistema (texto escalable).
- [ ] No depender solo del color para transmitir información.

## 10. Internacionalización (i18n)

- [ ] Decidir si la app es solo español o multi-idioma.
- [ ] Textos centralizados (no strings sueltos) si se prevé traducir.
- [ ] Formatos de fecha/número acordes a la configuración regional.

## 11. Estados, errores y resiliencia

- [ ] Cada pantalla maneja: cargando, vacío, error y sin conexión.
- [ ] Mensajes de error claros y accionables (no técnicos).
- [ ] Reconexión automática del tiempo real y recuperación de estado de sala.
- [ ] Comportamiento si la pareja abandona o la sala caduca.

## 12. Testing y QA

- [ ] Tests unitarios de la lógica crítica (match, sala, validación de dataset).
- [ ] Tests de integración de la capa de datos (Supabase).
- [x] Pruebas end-to-end de los flujos principales (crear/unir/swipe/match/resumen).
- [x] Prueba real con **dos dispositivos** en la misma sala.
- [x] Matriz de dispositivos: iOS (probado en iPhone real) y Android (probado en móvil y emulador).
- [ ] Pruebas manuales de casos límite (sección 1).
- [ ] QA de regresión antes de cada publicación.

## 13. Configuración de plataformas

- [x] `app.json` / `app.config.ts`: nombre, bundle id (iOS) y package (Android), versión.
- [ ] **Permisos** solo los necesarios (¿cámara para escanear QR? justificarlo con texto de uso).
- [x] Orientación, safe areas, barra de estado.
- [ ] Deep links / esquema de la app si se necesita para unirse por enlace.
- [ ] Versionado y build number con estrategia clara.

## 14. Build y CI/CD

- [x] EAS Build configurado con perfiles dev / preview / production (`eas.json`).
- [ ] Build de iOS generable **sin Mac** (vía EAS) y probada.
- [ ] Build de Android (AAB) generada y probada.
- [ ] (Opcional) CI que ejecuta lint + tests en cada push.
- [ ] Estrategia de actualizaciones OTA (EAS Update) definida.

## 15. Requisitos de las tiendas 🔴

- [ ] 🔴 Cuenta **Apple Developer** activa (99 $/año) y **Google Play Console** (25 $ único).
- [ ] Fichas de tienda: nombre, descripción, capturas, categoría, clasificación por edad.
- [ ] Cumplir las **guidelines** de Apple y las **políticas** de Google Play.
- [ ] Política de privacidad enlazada en ambas fichas.
- [ ] Formularios de privacidad (App Privacy / Data Safety) completos.
- [ ] Pruebas en **TestFlight** (iOS) y **pista interna** (Android) antes del lanzamiento.

## 16. Observabilidad

- [ ] Reporte de **crashes** (p. ej. Sentry) integrado.
- [ ] Analítica mínima de uso (respetando privacidad) para saber qué funciona.
- [ ] Logs útiles en desarrollo, silenciados/limpios en producción.

## 17. Lanzamiento y post-lanzamiento

- [ ] Checklist de release: versión, notas de la versión, builds subidas y aprobadas.
- [ ] Plan de soporte: cómo se reportan y priorizan bugs.
- [ ] Estrategia de versionado (semver) y de actualizaciones.
- [ ] Monitorizar métricas y crashes tras el lanzamiento.

---

## ✅ Puerta final de entrega ("Definition of Done" del producto)

No se entrega/publica hasta que:

1. Todos los bloques **🔴 bloqueantes** están ✅ (seguridad, privacidad, cuentas de store).
2. Los flujos principales pasan la prueba con **dos dispositivos reales**.
3. Existen estados de carga/vacío/error/sin-conexión en todas las pantallas.
4. Paridad funcional con la web (o diferencias documentadas y aceptadas).
5. Icono, splash y fichas de tienda finalizados.
6. Tests críticos en verde y QA de regresión hecho.

> Este documento se revisa **al inicio de cada fase** del [plan de migración](./04-plan-migracion.md)
> y antes de cualquier publicación.
