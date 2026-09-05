# 📝 Convenciones de código

> Estándares de naming, estructura, commits y estilo.

---

## TypeScript

### Tipos e Interfaces

```typescript
// ✅ Interfaces con prefijo 'I'
interface IVote {
  id: string;
  liked: boolean;
}

// ✅ Types (literales, uniones)
type Gender = 'girl' | 'boy';
```

### Variables y funciones

```typescript
// ✅ camelCase
const roomCode = '1234';
const isValidCode = (code: string): boolean => { ... };

// ❌ NO: snake_case, PascalCase
```

### Constantes

```typescript
// ✅ UPPER_SNAKE_CASE
const MAX_NAME_LENGTH = 255;
const VALID_GENDERS = ['girl', 'boy'] as const;
```

---

## Componentes React

### Naming

```typescript
// ✅ PascalCase, descriptivos
export const CardName = ({ name, liked }: Props) => { ... };
export const RoomWaitingScreen = () => { ... };

// ❌ NO: camelCase, genéricos
```

### Estructura

```
src/components/
├── CardName/
│   ├── CardName.tsx    ← Componente
│   └── styles.ts       ← Estilos (StyleSheet)
```

---

## Estilos (ITCSS + BEM)

```typescript
// ✅ BEM CORRECTO
const styles = StyleSheet.create({
  // Block
  card: { padding: 16 },
  
  // Element
  cardHeader: { flexDirection: 'row' },
  
  // Modifier
  cardActive: { shadowColor: colors.salmon },
});

// ❌ MAL: nombres de acciones
// .swipeRight { ... }  ← No, usa .card--active
```

---

## Git

### Ramas

```bash
# ✅ Nomenclatura
feat/room-creation
fix/swipe-animation
docs/update-readme

# ❌ MAL
feature/room_creation
bugfix/swipe
```

### Commits

```bash
# ✅ Imperativos, presentes
git commit -m "feat: add room creation flow"
git commit -m "fix: swipe animation lag"

# ❌ MAL
git commit -m "added room creation"
git commit -m "Fix"
```

---

## Imports

### Path aliases

```typescript
// ✅ Usar aliases (definido en tsconfig.json)
import { IVote } from '@/types';
import { CardName } from '@/components/Card/CardName';

// ❌ EVITAR: rutas relativas largas
// import { IVote } from '../../../types';
```

### Orden

```typescript
// 1. React + React Native
import { View, Text } from 'react-native';

// 2. Librerías externas
import Animated from 'react-native-reanimated';

// 3. Tipos
import type { IVote } from '@/types';

// 4. Componentes/utils
import { Button } from '@/components/Button/Button';

// 5. Estilos locales
import { styles } from './styles';
```

---

**Última actualización:** 2026-09-05
