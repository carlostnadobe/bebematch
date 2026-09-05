# ⚠️ RIESGOS DETECTADOS — BebéMatch

> Documento vivo. Actualizar conforme avanza el desarrollo.
> Última actualización: 2026-09-05

---

## 🔴 Riesgos Críticos

### 1. Supabase: Conexiones simultáneas limitadas (Free tier)

**Severidad:** 🔴 CRÍTICO (para producción)  
**Descripción:**
- Plan Free = máx 10 conexiones simultáneas
- Cada usuario conectado = 1 conexión
- Pareja (2 usuarios) = 2 conexiones
- Máximo ~5 parejas en simultáneo antes de fallar

**Impacto:**
- User experience pésima si muchas parejas usan la app a la vez
- Incapacidad de escalar sin pagar

**Mitigación:**
- ✅ Usar Free tier en **desarrollo/MVP**
- ✅ Pasar a **Pro ($25/mes)** antes de beta pública (60 conexiones)
- ✅ Documentar límite en FAQs

**Timeline:** Resolver antes de publicar en stores

---

### 2. Seguridad: Clave anon de Supabase embebida en cliente

**Severidad:** 🔴 CRÍTICO  
**Descripción:**
- Hoy la clave `SUPABASE_KEY` está hardcodeada en `index.html`
- Cualquiera puede leer la clave desde el navegador/app
- Riesgo de abuso de API (requests masivos, borrado de datos)

**Impacto:**
- App accesible pero vulnerable a ataques
- No cumple requisitos de App Store / Google Play (seguridad)
- Posible bill sorpresa si alguien abusa

**Mitigación:**
- ✅ Mover clave a variables de entorno (`.env`, no hardcoded)
- ✅ Activar **Row Level Security (RLS)** en Supabase
- ✅ Implementar políticas por sala (cada usuario solo accede a su sala)
- ✅ Revisar antes de Fase 5 (Pulir + seguridad)

**Timeline:** Fase 5 (blockeante para publicar)

---

### 3. Autenticación débil: user_id temporal sin persistencia

**Severidad:** 🔴 CRÍTICO  
**Descripción:**
- Hoy el `user_id` se genera aleatoriamente por dispositivo/sesión
- Sin persistencia → se pierde al cerrar la app
- Posible colisión de IDs (aunque improbable)
- No hay auditoría de quién votó qué

**Impacto:**
- Imposible recuperar historial (no requisito MVP, pero sí en futuro)
- No se puede bloquear usuarios problemáticos
- Imposible saber si la misma persona vota varias veces

**Mitigación:**
- ✅ Para MVP: usar autenticación anónima de Supabase (`supabase.auth.signInAnonymously()`)
- ✅ Guardar sesión en `AsyncStorage` (React Native)
- ✅ Permitir login opcional (Google/Apple) en versión 2.0

**Timeline:** Fase 4 (implementar antes de multijugador)

---

## 🟠 Riesgos Altos

### 4. Modelo de datos mínimo: presencia y votos en la misma tabla

**Severidad:** 🟠 ALTO  
**Descripción:**
- Tabla `votes` mezcla:
  - Votos reales (name="Sofía", liked=true)
  - Presencia (name="__presence__", liked=false)
- Usando un "truco" que no escala bien

**Impacto:**
- Difícil mantener código
- Queries confusas (filtrar por name != "__presence__")
- Imposible auditar presencia vs votos

**Mitigación:**
- ✅ Crear tabla `rooms` explícita
- ✅ Crear tabla `presence` separada
- ✅ Rediseñar schema antes de Fase 4

**Timeline:** Fase 4 (blockeante para backend estable)

---

### 5. WebSocket Realtime: error handling manual débil

**Severidad:** 🟠 ALTO  
**Descripción:**
- Hoy el WebSocket se cierra y reconecta manualmente
- Sin reintentos exponenciales (solo 5s fijo)
- Sin buffer de mensajes si desconexión
- Posible pérdida de votos si la red falla justo en el swipe

**Impacto:**
- User experience inconsistente en redes débiles
- Posible pérdida de datos (votos no sincronizados)
- Bugs difíciles de reproducir

**Mitigación:**
- ✅ Usar SDK oficial `supabase-js` con Realtime integrado
- ✅ Implementar reintentos exponenciales
- ✅ Buffer local de votos (optimistic updates)
- ✅ Tests de desconexión/reconexión

**Timeline:** Fase 4

---

### 6. Offline behavior: no definido

**Severidad:** 🟠 ALTO  
**Descripción:**
- No hay estrategia clara para offline
- ¿Puede el usuario swipear sin conexión?
- ¿Se sincroniza después?
- ¿Qué pasa en modo pareja si uno se desconecta?

**Impacto:**
- Comportamiento inconsistente e impredecible
- Pérdida potencial de datos
- Mala UX en redes inestables

**Mitigación:**
- ✅ Definir estrategia offline (Fase 3/4)
- ✅ Solitario: sí offline (buffer local)
- ✅ Pareja: no offline (requiere conexión, mostrar error)
- ✅ Implementar indicador de conexión

**Timeline:** Fase 4 (antes de multijugador)

---

## 🟡 Riesgos Medios

### 7. Datos personales: sin clara política de privacidad

**Severidad:** 🟡 MEDIO  
**Descripción:**
- App recoge: user_id (temporal), nombres votados, género elegido, origen elegido
- Aunque no se piden email/nombre real, sí hay datos
- Requisito de App Store/Play Store: política de privacidad y GDPR compliance

**Impacto:**
- Rechazo en revisión de stores
- Riesgo legal si usuario en UE pide borrado de datos

**Mitigación:**
- ✅ Escribir política de privacidad clara
- ✅ Implementar "derecho al olvido" (borrar votos de una sala)
- ✅ No guardar IP/user-agent (solo votos + timestamp)
- ✅ Revisar antes de publicar

**Timeline:** Fase 5 (blockeante para stores)

---

### 8. Dataset de nombres: integridad y legalidad

**Severidad:** 🟡 MEDIO  
**Descripción:**
- 473 nombres con datos curiosos, onomástica, famosos
- Datos pueden tener errores o estar desactualizados
- Algunos datos curiosos podrían ser incorrectos o sensibles

**Impacto:**
- Reputación dañada si datos errados
- Posible demanda por información falsa (ej: onomástica incorrecta)

**Mitigación:**
- ✅ Auditoría editorial antes de publicar
- ✅ Permitir users reportar errores (feedback in-app)
- ✅ Versionar dataset (v1.0, v1.1, etc.)

**Timeline:** Fase 5

---

### 9. Realtime: latencia y pérdida de mensajes en picos

**Severidad:** 🟡 MEDIO  
**Descripción:**
- Realtime de Supabase puede tener latencia en picos
- Si 2+ personas votan al mismo tiempo, mensajes pueden llegar desordenados

**Impacto:**
- Match falso (cree que ambos votaron, pero uno no llegó)
- User confusion ("¿por qué no veo el match?")

**Mitigación:**
- ✅ Implementar "versioning" de votos (timestamp + sequence)
- ✅ Tests de carga con múltiples usuarios
- ✅ Validación en backend (doble check antes de match)

**Timeline:** Fase 4

---

## 🟢 Riesgos Bajos

### 10. Easter egg: complejidad innecesaria

**Severidad:** 🟢 BAJO  
**Descripción:**
- Mini-juego de "saltar obstáculos" oculto en la app
- Código extra, mantenimiento, posibles bugs

**Impacto:**
- Distracción en desarrollo
- Posible bugs que causen crashes

**Mitigación:**
- ✅ Decidir: ¿mantener o descartar? (ADR-004 pendiente)
- ✅ Si se mantiene: aislar en componente, bien testeado

**Timeline:** Fase 5

---

### 11. Accesibilidad: no auditada

**Severidad:** 🟢 BAJO (para MVP)  
**Descripción:**
- App actual (web) probablemente no cumple WCAG
- Lectura de pantalla, contraste, tamaños de toque

**Impacto:**
- Excluye usuarios con discapacidades
- Posible rechazo en stores (cada vez más estrictos)

**Mitigación:**
- ✅ Para MVP: nice-to-have
- ✅ Antes de publicar: auditoría WCAG AA mínimo
- ✅ Implementar: labels accesibles, contraste, tamaños

**Timeline:** Fase 5 (pre-publicación)

---

### 12. Performance: no baseline establecida

**Severidad:** 🟢 BAJO (para MVP)  
**Descripción:**
- No hay métricas de performance (FPS, TTI, memoria)
- App podría estar lenta en gama media sin que lo notemos

**Impacto:**
- User experience pobre en dispositivos viejos
- Baterías drenadas rápido

**Mitigación:**
- ✅ Establecer baseline (60 FPS en swipe, < 200ms transiciones)
- ✅ Tests en dispositivos reales (iPhone 11, Android 10+)
- ✅ Profiling con DevTools de Expo

**Timeline:** Fase 3-4 (monitorear conforme buildeamos)

---

## 📊 Matriz de riesgos

| Riesgo | Severidad | Timeline | Bloqueante |
|--------|-----------|----------|-----------|
| Supabase: conexiones limitadas | 🔴 | Pre-publicación | ✅ |
| Seguridad: clave embebida | 🔴 | Fase 5 | ✅ |
| Autenticación débil | 🔴 | Fase 4 | ✅ |
| Modelo de datos mínimo | 🟠 | Fase 4 | ✅ |
| WebSocket error handling | 🟠 | Fase 4 | ✅ |
| Offline behavior | 🟠 | Fase 4 | ✅ |
| Privacidad / GDPR | 🟡 | Fase 5 | ✅ |
| Dataset integridad | 🟡 | Fase 5 | ⚠️ |
| Realtime latencia | 🟡 | Fase 4 | ⚠️ |
| Easter egg | 🟢 | Fase 5 | ❌ |
| Accesibilidad | 🟢 | Fase 5 | ❌ |
| Performance | 🟢 | Fase 3+ | ❌ |

---

## ✅ Acción recomendada

### Inmediato (Fase 1-2)
- [ ] Documentar mitigaciones en ADR
- [ ] Planificar backend redesign (Fase 4)

### Fase 3-4
- [ ] Implementar autenticación Supabase
- [ ] Redesign de schema
- [ ] Error handling robusto
- [ ] Offline strategy
- [ ] Tests de desconexión

### Fase 5
- [ ] Endurecer seguridad (RLS, variables de entorno)
- [ ] Política de privacidad
- [ ] Auditoría de dataset
- [ ] WCAG AA compliance
- [ ] Decisión: Easter egg sí/no

---

**Próximo review:** Después de Fase 1 (andamiaje Expo)  
**Responsable:** Revisar este documento con cada feature nueva
