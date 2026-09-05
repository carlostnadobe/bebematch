# 00 · Guía de trabajo

Instrucciones base para trabajar en la transformación de BebéMatch a app nativa.
Este documento define **cómo** trabajamos; el **qué** está en el resto de artefactos.

## Objetivo del proyecto

Convertir la web actual de BebéMatch (un único `index.html` con JS puro + Supabase) en
**apps nativas para iOS y Android**, publicables en App Store y Google Play, reutilizando
al máximo la lógica y los datos existentes.

**Prioridades del proyecto (en orden):**
1. Un solo código base para las dos plataformas, sin duplicar trabajo.
2. Proceso de desarrollo simple y predecible (nada de configuraciones frágiles).
3. Conservar la experiencia actual: swipe fluido, animaciones, tema claro/oscuro.

## Stack elegido

- **Framework:** React Native con **Expo** (managed workflow).
- **Lenguaje:** TypeScript.
- **Build/distribución:** EAS Build + EAS Submit (compila iOS sin necesidad de Mac).
- **Backend:** Supabase (por ahora — ver [ADR-002](./05-decisiones.md)).

> El detalle técnico completo está en [03 · Arquitectura objetivo](./03-arquitectura-objetivo.md).

## Flujo de ramas (git)

- `main`: estado estable de referencia (la web original).
- `transform-to-app`: rama de trabajo principal de la migración. **Aquí se trabaja.**
- Ramas de funcionalidad: salen de `transform-to-app` con nombre `feat/<algo>`,
  `fix/<algo>` o `docs/<algo>`. Sin espacios en los nombres.

## Cómo tomamos y registramos decisiones

- Toda decisión con impacto (stack, backend, modelo de datos, dependencias grandes,
  estrategia de publicación) se apunta en el [Registro de decisiones](./05-decisiones.md)
  con formato ADR: contexto → opciones → decisión → consecuencias.
- Las decisiones **pendientes** también se registran, marcadas como tal, para no olvidarlas.

## Convenciones

### Idioma y contenido

- **Idioma del producto:** español (la app y sus textos están en español).
- **Idioma del código:** identificadores en inglés, textos de UI en español.
- **Datos de nombres:** el dataset se trata como contenido versionado (ver arquitectura).
- **Documentación:** en español, en esta carpeta `docs/`. Un tema = un documento.
- **Secretos:** claves y credenciales **no** se hardcodean; van en variables de entorno /
  configuración de Expo. (Hoy la web tiene la clave anon de Supabase embebida: se corrige
  en la migración — ver [ADR-003](./05-decisiones.md)).

### Convenciones de estilos (SASS/CSS)

- **Metodología:** **ITCSS** (Inverted Triangle CSS) para organizar la jerarquía de estilos:
  1. Settings — variables de tema (colores, espaciados, tipografías).
  2. Tools — mixins y funciones reutilizables.
  3. Generic — reset, normalize, estilos de base.
  4. Elements — estilos de etiquetas HTML (`p`, `button`, `input`...).
  5. Objects — layouts y patrones sin decoración (grillas, contenedores).
  6. Components — componentes visuales con estilo completo.
  7. Utilities — clases de una sola propiedad (`.margin-top`, `.text-center`...).
  8. Hacks — overrides de emergencia (minimizar).

- **Convención de nombres:** **BEM** (Block Element Modifier):
  - **Block:** nombre global del componente (p. ej. `.card`, `.button`, `.modal`).
  - **Element:** parte componible dentro del block con `__` (p. ej. `.card__header`, `.button__icon`).
  - **Modifier:** variante del block o elemento con `--` (p. ej. `.button--primary`, `.card--hover`).

- **Nombres globales, no acciones:** los nombres de las clases deben describir **qué es** el
  elemento, no **qué hace**. Ejemplos:
  - ❌ Evitar: `.swipe-right`, `.match-found`, `.loading-spinner`
  - ✅ Usar: `.card`, `.card--active`, `.spinner`, `.spinner--loading`
  - ❌ Evitar: `.button-blue`, `.text-red`
  - ✅ Usar: `.button`, `.button--primary`, `.text`, `.text--error`

- **Responsabilidad única:** una clase = una responsabilidad. No mezcles layout, color y
  tipografía en un nombre. Usa composición (múltiples clases) si es necesario.

## Definición de "hecho" (para cada funcionalidad migrada)

- Funciona en iOS y Android (probado en Expo Go o build de desarrollo).
- Mantiene la paridad funcional con la web (o se documenta la diferencia).
- Sin claves ni secretos en el código fuente.
- Documentación afectada actualizada.
