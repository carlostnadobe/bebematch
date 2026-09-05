# ✅ Checklists — Antes de cada acción

> Listas de verificación para PRs, releases y features.

---

## ✅ Pre-Push

Antes de hacer `git push`:

- [ ] Código compila (`npx tsc --noEmit`)
- [ ] ESLint pasa (`npm run lint`)
- [ ] Prettier formateó (`npm run format`)
- [ ] No hay `console.log` en producción
- [ ] Commit message sigue convenciones
- [ ] Rama actualizada con main

---

## ✅ Pre-PR

Cuando vas a abrir PR en GitHub:

- [ ] Rama tiene nombre descriptivo (feat/room-creation)
- [ ] PR description es clara (qué, por qué, cómo testear)
- [ ] Documentación afectada está actualizada
- [ ] No incluye archivos no relacionados

---

## ✅ Pre-Merge

Antes de mergear a `main`:

- [ ] Al menos 1 review aprobada
- [ ] Todos los checks de GitHub Actions pasan
- [ ] Sin conflictos con main

---

## ✅ Pre-Release (Fase 6)

Antes de publicar en stores:

### Funcionalidad
- [ ] Pareja funciona end-to-end (testeado con 2 dispositivos)
- [ ] Solitario funciona (favoritos persisten)
- [ ] Offline fallback (sin crashes)

### Seguridad
- [ ] No hay claves hardcodeadas
- [ ] RLS en Supabase activa
- [ ] No guardar datos sensibles

### Performance
- [ ] Swipe es fluido (60fps)
- [ ] Carga inicial <3 segundos
- [ ] Sin memory leaks

### Assets
- [ ] App icon (1024x1024)
- [ ] Splash screen (vectorial)
- [ ] Tipografías cargadas
- [ ] Iconos (Feather/Heroicons, sin emojis)

### Documentación
- [ ] Política de privacidad redactada
- [ ] README actualizado

### Testing final
- [ ] Testeado en iOS real (preview build)
- [ ] Testeado en Android real (preview build)
- [ ] Testeado con red lenta
- [ ] Testeado con presencia intermitente

---

## ⚡ Quick Commands

```bash
# Limpiar y empezar fresco
npm install
npx tsc --noEmit
npm run lint
npm run format

# Ver cambios antes de push
git diff origin/main
git status

# Ver rama actual
git branch

# Ver commits del branch
git log --oneline origin/main..HEAD
```

---

**Última actualización:** 2026-09-05
