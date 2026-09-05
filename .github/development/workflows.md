# 🔄 Workflows — Cómo trabajar con herramientas

> Cómo usar EAS Build, EAS Submit, GitHub Actions y desarrollo local.

---

## Desarrollo local

### Setup inicial

```bash
git clone https://github.com/carlostnadobe/bebematch.git
cd bebematch
npm install
npm install -g expo-cli
expo doctor
```

### Correr en Expo Go

```bash
npm start
# Escanear QR desde móvil (Expo Go app)
# O presiona 'i' para iOS, 'a' para Android
```

---

## EAS Build — Compilar para stores

### Setup inicial

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Compilar

```bash
# Desarrollo (debug)
eas build --platform android --profile development

# Testing (preview)
eas build --platform all --profile preview

# Producción
eas build --platform all --profile production
```

**Tiempo:** 5-20 minutos según perfil

---

## EAS Submit — Publicar en stores

```bash
eas submit --platform all --auto
```

**Requisitos:** Cuentas Apple Developer ($99/año) + Google Play ($25 única vez)

---

## GitHub Actions — CI/CD

Workflows viven en `.github/workflows/` (auto-generated o creados).

**Ejemplo:** Lint en cada push → detecta errores automáticamente

---

## Pre-push checklist

```bash
# 1. Tipos
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Formatear
npm run format

# 4. Git status
git status

# 5. Commit
git commit -m "feat: add feature"

# 6. Push
git push origin feat/feature
```

---

**Última actualización:** 2026-09-05
