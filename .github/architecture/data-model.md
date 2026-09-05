# 🗂️ Modelo de datos (Supabase)

> Schema PostgreSQL, tipos TypeScript, relaciones y ejemplos.

---

## Estado actual (web)

Tabla `votes` minimalista — presencia y votos mezclados usando `name = "__presence__"`.

---

## Objetivo para Fase 4

Separar presencia de votos, añadir RLS (Row Level Security), mantener simplicidad.

### Tabla: `votes` (rediseñada)

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(4) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_votes_room_code ON votes(room_code);
CREATE INDEX idx_votes_user_id ON votes(user_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
```

### Tabla: `rooms` (nueva)

```sql
CREATE TABLE rooms (
  code VARCHAR(4) PRIMARY KEY,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'waiting',
  gender_filter VARCHAR(20) DEFAULT 'all',
  origin_filter VARCHAR(100) DEFAULT 'all'
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
```

---

## Tipos TypeScript

```typescript
// src/types.ts

export type Gender = 'girl' | 'boy';

export interface IName {
  n: string;           // Nombre
  g: Gender;
  o: string;           // Origen
  m: string;           // Significado
}

export interface IVote {
  id: string;
  roomCode: string;
  userId: string;
  name: string;
  liked: boolean;
  createdAt: Date;
}

export interface IRoom {
  code: string;
  createdBy: string;
  status: 'waiting' | 'active' | 'done';
  genderFilter: 'girl' | 'boy' | 'all';
}
```

---

## Queries principales

### Crear sala
```typescript
const createRoom = async (userId: string) => {
  const { data } = await supabase
    .from('rooms')
    .insert([{ code: generateCode(), created_by: userId }])
    .select();
  return data;
};
```

### Guardar voto
```typescript
const saveVote = async (roomCode: string, userId: string, name: string, liked: boolean) => {
  return await supabase
    .from('votes')
    .insert([{ room_code: roomCode, user_id: userId, name, liked }]);
};
```

### Suscribirse a votos
```typescript
const subscribeToVotes = (roomCode: string, callback) => {
  return supabase
    .channel(`votes-${roomCode}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'votes', filter: `room_code=eq.${roomCode}` },
      callback
    )
    .subscribe();
};
```

---

**Última actualización:** 2026-09-05
