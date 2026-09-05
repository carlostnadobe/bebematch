-- =====================================================================
-- BebéMatch — Script de Seguridad y Row Level Security (RLS) en Supabase
-- =====================================================================
-- Este script activa RLS en la tabla 'votes' y garantiza que:
-- 1. Los clientes anónimos solo puedan consultar o insertar votos asociados a un código de sala ('room_code').
-- 2. La suscripción en tiempo real (Supabase Realtime) siga recibiendo eventos filtrados por room_code.
-- =====================================================================

-- 1. Habilitar RLS en la tabla votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 2. Política de Lectura (SELECT): permitir leer votos donde room_code no sea nulo
DROP POLICY IF EXISTS "Permitir lectura de votos por sala" ON public.votes;
CREATE POLICY "Permitir lectura de votos por sala"
ON public.votes
FOR SELECT
TO anon, authenticated
USING (room_code IS NOT NULL AND length(room_code) = 4);

-- 3. Política de Inserción (INSERT): permitir registrar votos y presencia
DROP POLICY IF EXISTS "Permitir insercion de votos" ON public.votes;
CREATE POLICY "Permitir insercion de votos"
ON public.votes
FOR INSERT
TO anon, authenticated
WITH CHECK (
  room_code IS NOT NULL 
  AND length(room_code) = 4 
  AND user_id IS NOT NULL 
  AND name IS NOT NULL
);

-- 4. Asegurar que la tabla votes esté incluida en la publicación de Realtime
BEGIN;
  -- Agregar la tabla a la publicación de realtime si no estuviera
  ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
COMMIT;

-- 5. Índice de rendimiento para búsquedas por room_code
CREATE INDEX IF NOT EXISTS idx_votes_room_code ON public.votes (room_code);
CREATE INDEX IF NOT EXISTS idx_votes_room_user ON public.votes (room_code, user_id);
