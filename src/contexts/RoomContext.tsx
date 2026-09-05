import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { IName } from '../types';
import { NAMES_DB } from '../data/names';

export interface RoomContextValue {
  myId: string;
  roomCode: string | null;
  isHost: boolean;
  partnerConnected: boolean;
  myLikes: Record<string, boolean>;
  partnerLikes: Record<string, boolean>;
  matches: IName[];
  lastMatch: IName | null;
  isLoading: boolean;
  error: string | null;
  createRoom: () => Promise<string>;
  joinRoom: (code: string) => Promise<boolean>;
  submitVote: (name: IName, liked: boolean) => Promise<void>;
  clearLastMatch: () => void;
  leaveRoom: () => void;
}

const USER_ID_STORAGE_KEY = '@bebematch_user_id';

// Caracteres legibles para código de sala (sin 0, O, 1, I para evitar confusiones)
const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  }
  return code;
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myId, setMyId] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [partnerConnected, setPartnerConnected] = useState<boolean>(false);
  const [myLikes, setMyLikes] = useState<Record<string, boolean>>({});
  const [partnerLikes, setPartnerLikes] = useState<Record<string, boolean>>({});
  const [matches, setMatches] = useState<IName[]>([]);
  const [lastMatch, setLastMatch] = useState<IName | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Inicializar o recuperar myId
  useEffect(() => {
    AsyncStorage.getItem(USER_ID_STORAGE_KEY).then((stored) => {
      if (stored) {
        setMyId(stored);
      } else {
        const newId = `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        AsyncStorage.setItem(USER_ID_STORAGE_KEY, newId).catch(() => {});
        setMyId(newId);
      }
    });
  }, []);

  // Función para suscribirse a cambios de Supabase Realtime
  const subscribeToRoom = useCallback(
    (code: string, currentUserId: string) => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`room-${code}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'votes',
            filter: `room_code=eq.${code}`,
          },
          (payload) => {
            const record = payload.new as {
              room_code: string;
              user_id: string;
              name: string;
              liked: boolean;
            };

            // Si el voto viene del otro usuario
            if (record && record.user_id !== currentUserId) {
              setPartnerConnected(true);

              if (record.name === '__presence__') {
                return;
              }

              setPartnerLikes((prev) => {
                const next = { ...prev, [record.name]: record.liked };
                return next;
              });

              // Comprobar si ya me gustaba a mí -> ¡MATCH!
              setMyLikes((currentMyLikes) => {
                if (record.liked && currentMyLikes[record.name]) {
                  const matchedName = NAMES_DB.find((n) => n.n === record.name);
                  if (matchedName) {
                    setMatches((prevMatches) => {
                      if (!prevMatches.some((m) => m.n === matchedName.n)) {
                        return [...prevMatches, matchedName];
                      }
                      return prevMatches;
                    });
                    setLastMatch(matchedName);
                  }
                }
                return currentMyLikes;
              });
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    },
    []
  );

  // Limpiar canal al desmontar
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const createRoom = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const code = generateRoomCode();
      const userId = myId || `user_${Date.now()}`;

      // Insertar presencia inicial en Supabase
      const { error: insertError } = await supabase.from('votes').insert([
        {
          room_code: code,
          user_id: userId,
          name: '__presence__',
          liked: false,
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setRoomCode(code);
      setIsHost(true);
      setPartnerConnected(false);
      setMyLikes({});
      setPartnerLikes({});
      setMatches([]);
      setLastMatch(null);

      subscribeToRoom(code, userId);

      return code;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la sala';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [myId, subscribeToRoom]);

  const joinRoom = useCallback(
    async (rawCode: string): Promise<boolean> => {
      const code = rawCode.trim().toUpperCase();
      if (code.length !== 4) {
        setError('El código debe tener 4 caracteres');
        return false;
      }

      setIsLoading(true);
      setError(null);
      try {
        const userId = myId || `user_${Date.now()}`;

        // Verificar si existe la sala en la tabla votes
        const { data: existingVotes, error: fetchError } = await supabase
          .from('votes')
          .select('*')
          .eq('room_code', code);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!existingVotes || existingVotes.length === 0) {
          setError('No encontramos ninguna sala con ese código.');
          return false;
        }

        // Insertar presencia del invitado
        await supabase.from('votes').insert([
          {
            room_code: code,
            user_id: userId,
            name: '__presence__',
            liked: false,
          },
        ]);

        // Cargar votos previos de la pareja
        const initialPartnerLikes: Record<string, boolean> = {};
        const otherVotes = existingVotes.filter((v) => v.user_id !== userId && v.name !== '__presence__');
        otherVotes.forEach((v) => {
          initialPartnerLikes[v.name] = v.liked;
        });

        setRoomCode(code);
        setIsHost(false);
        setPartnerConnected(true);
        setMyLikes({});
        setPartnerLikes(initialPartnerLikes);
        setMatches([]);
        setLastMatch(null);

        subscribeToRoom(code, userId);

        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al unirse a la sala';
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [myId, subscribeToRoom]
  );

  const submitVote = useCallback(
    async (name: IName, liked: boolean) => {
      if (!roomCode) return;

      // Registrar voto propio local
      setMyLikes((prev) => ({ ...prev, [name.n]: liked }));

      // Si a la pareja le gustaba este nombre -> ¡MATCH!
      if (liked && partnerLikes[name.n]) {
        setMatches((prev) => {
          if (!prev.some((m) => m.n === name.n)) {
            return [...prev, name];
          }
          return prev;
        });
        setLastMatch(name);
      }

      // Enviar a Supabase
      const userId = myId || `user_${Date.now()}`;
      try {
        await supabase.from('votes').insert([
          {
            room_code: roomCode,
            user_id: userId,
            name: name.n,
            liked,
          },
        ]);
      } catch (e) {
        console.warn('Error enviando voto a Supabase:', e);
      }
    },
    [roomCode, myId, partnerLikes]
  );

  const clearLastMatch = useCallback(() => {
    setLastMatch(null);
  }, []);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRoomCode(null);
    setIsHost(false);
    setPartnerConnected(false);
    setMyLikes({});
    setPartnerLikes({});
    setMatches([]);
    setLastMatch(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      myId,
      roomCode,
      isHost,
      partnerConnected,
      myLikes,
      partnerLikes,
      matches,
      lastMatch,
      isLoading,
      error,
      createRoom,
      joinRoom,
      submitVote,
      clearLastMatch,
      leaveRoom,
    }),
    [
      myId,
      roomCode,
      isHost,
      partnerConnected,
      myLikes,
      partnerLikes,
      matches,
      lastMatch,
      isLoading,
      error,
      createRoom,
      joinRoom,
      submitVote,
      clearLastMatch,
      leaveRoom,
    ]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = (): RoomContextValue => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom debe ser utilizado dentro de un RoomProvider');
  }
  return context;
};
