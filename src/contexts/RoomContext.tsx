import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { IName, IFilters } from '../types';
import { NAMES_DB } from '../data/names';

export interface RoomContextValue {
  myId: string;
  roomCode: string | null;
  isHost: boolean;
  partnerConnected: boolean;
  partnerDone: boolean;
  partnerProgress: number;
  myLikes: Record<string, boolean>;
  partnerLikes: Record<string, boolean>;
  matches: IName[];
  lastMatch: IName | null;
  rushMode: boolean;
  roomFilters: IFilters | null;
  roomSeed: number | null;
  savedRoomCode: string | null;
  isLoading: boolean;
  error: string | null;
  setRushMode: (rush: boolean) => void;
  createRoom: () => Promise<string>;
  joinRoom: (code: string) => Promise<boolean>;
  publishFilters: (filters: IFilters, seed: number) => Promise<void>;
  submitVote: (name: IName, liked: boolean) => Promise<void>;
  notifyProgress: (index: number) => Promise<void>;
  notifyDone: () => Promise<void>;
  clearLastMatch: () => void;
  clearSavedRoom: () => void;
  leaveRoom: () => void;
}

const USER_ID_STORAGE_KEY = '@bebematch_user_id';
const ROOM_STORAGE_KEY = 'bm_room';

// Alfabeto sin ambigüedades (A-Z sin I/O y 2-9 sin 0/1)
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
  const [partnerDone, setPartnerDone] = useState<boolean>(false);
  const [partnerProgress, setPartnerProgress] = useState<number>(0);
  const [rushMode, setRushMode] = useState<boolean>(false);
  const [roomFilters, setRoomFilters] = useState<IFilters | null>(null);
  const [roomSeed, setRoomSeed] = useState<number | null>(null);
  const [savedRoomCode, setSavedRoomCode] = useState<string | null>(null);

  const [myLikes, setMyLikes] = useState<Record<string, boolean>>({});
  const [partnerLikes, setPartnerLikes] = useState<Record<string, boolean>>({});
  const [matches, setMatches] = useState<IName[]>([]);
  const [lastMatch, setLastMatch] = useState<IName | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const processedRecordIdsRef = useRef<Set<string>>(new Set());

  // Inicializar o recuperar myId y sala guardada
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

    AsyncStorage.getItem(ROOM_STORAGE_KEY).then((saved) => {
      if (saved && saved.length === 4) {
        setSavedRoomCode(saved);
      }
    });
  }, []);

  // Procesa un registro entrante (vía Realtime o vía Polling)
  const processRecord = useCallback(
    (
      record: {
        id?: string;
        room_code: string;
        user_id: string;
        name: string;
        liked: boolean;
      },
      currentUserId: string
    ) => {
      if (!record || record.user_id === currentUserId) return;

      // Si este registro ya fue procesado antes por ID, ignorarlo para no provocar re-renders
      if (record.id) {
        if (processedRecordIdsRef.current.has(record.id)) {
          return;
        }
        processedRecordIdsRef.current.add(record.id);
      }

      // Cualquier registro de otro usuario confirma la presencia de la pareja
      setPartnerConnected((prev) => (prev ? prev : true));

      // Mensaje de presencia pura
      if (record.name === '__presence__') {
        return;
      }

      // Mensaje de filtros: formato web clásico (name='__filters__', user_id=JSON)
      if (record.name === '__filters__') {
        try {
          const data = JSON.parse(record.user_id);
          const seed = data._seed ?? data.seed;
          setRoomFilters((prev) => {
            if (prev && JSON.stringify(prev) === JSON.stringify(data)) return prev;
            return data;
          });
          if (seed !== undefined) {
            setRoomSeed((prev) => (prev === seed ? prev : seed));
          }
        } catch (e) {
          console.warn('Error parseando filtros web en processRecord:', e);
        }
        return;
      }

      // Mensaje de filtros: formato directo (name='__filters__:<json>')
      if (record.name.startsWith('__filters__:')) {
        try {
          const data = JSON.parse(record.name.substring(12));
          if (data.filters) {
            setRoomFilters((prev) => {
              if (prev && JSON.stringify(prev) === JSON.stringify(data.filters)) return prev;
              return data.filters;
            });
          }
          if (data.seed !== undefined) {
            setRoomSeed((prev) => (prev === data.seed ? prev : data.seed));
          }
        } catch (e) {
          console.warn('Error parseando filtros recibidos:', e);
        }
        return;
      }

      // Mensaje de progreso de la baraja
      if (record.name.startsWith('__progress__:')) {
        const count = parseInt(record.name.substring(13), 10);
        if (!isNaN(count)) {
          setPartnerProgress((prev) => (prev === count ? prev : count));
        }
        return;
      }

      // Mensaje de fin de baraja
      if (record.name === '__done__') {
        setPartnerDone((prev) => (prev ? prev : true));
        return;
      }

      // Voto normal de nombre
      setPartnerLikes((prev) => {
        if (prev[record.name] === record.liked) return prev;
        return { ...prev, [record.name]: record.liked };
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
    },
    []
  );

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
            processRecord(record, currentUserId);
          }
        )
        .subscribe();

      channelRef.current = channel;
    },
    [processRecord]
  );

  // Polling continuo de respaldo (idéntico a la versión web original)
  // Garantiza que la sala se sincronice aun si el websocket sufre reconexión o retraso en Expo Go / túnel
  useEffect(() => {
    if (!roomCode) return;
    const currentUserId = myId;

    const interval = setInterval(async () => {
      try {
        const { data: votes } = await supabase
          .from('votes')
          .select('*')
          .eq('room_code', roomCode);

        if (!votes || votes.length === 0) return;

        votes.forEach((v) => {
          processRecord(v, currentUserId);
        });
      } catch (e) {
        // Ignorar fallos transitorios de red en el sondeo
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [roomCode, myId, processRecord]);

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
      let userId = myId;
      if (!userId) {
        userId = `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        setMyId(userId);
        AsyncStorage.setItem(USER_ID_STORAGE_KEY, userId).catch(() => {});
      }

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
      setPartnerDone(false);
      setPartnerProgress(0);
      setRoomFilters(null);
      setRoomSeed(null);
      setMyLikes({});
      setPartnerLikes({});
      setMatches([]);
      setLastMatch(null);

      AsyncStorage.setItem(ROOM_STORAGE_KEY, code).catch(() => {});
      setSavedRoomCode(code);

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
        let userId = myId;
        if (!userId) {
          userId = `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
          setMyId(userId);
          AsyncStorage.setItem(USER_ID_STORAGE_KEY, userId).catch(() => {});
        }

        // Verificar si existe la sala en la tabla votes
        const { data: existingVotes, error: fetchError } = await supabase
          .from('votes')
          .select('*')
          .eq('room_code', code);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!existingVotes || existingVotes.length === 0) {
          setError('Sala no encontrada. ¿El código es correcto?');
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

        // Cargar votos previos de la pareja y filtros si ya existen
        const initialPartnerLikes: Record<string, boolean> = {};
        let receivedFilters: IFilters | null = null;
        let receivedSeed: number | null = null;
        let partnerFinished = false;

        const otherVotes = existingVotes.filter((v) => v.user_id !== userId);
        otherVotes.forEach((v) => {
          if (v.name === '__presence__') return;
          if (v.name === '__done__') {
            partnerFinished = true;
            return;
          }
          if (v.name === '__filters__') {
            try {
              const data = JSON.parse(v.user_id);
              receivedFilters = data;
              if (data._seed !== undefined || data.seed !== undefined) {
                receivedSeed = data._seed ?? data.seed;
              }
            } catch (e) {
              console.warn('Error parseando filtros web en joinRoom:', e);
            }
            return;
          }
          if (v.name.startsWith('__filters__:')) {
            try {
              const data = JSON.parse(v.name.substring(12));
              if (data.filters) receivedFilters = data.filters;
              if (data.seed !== undefined) receivedSeed = data.seed;
            } catch (e) {
              console.warn('Error parseando filtros existentes:', e);
            }
            return;
          }
          if (v.name.startsWith('__progress__:')) {
            return;
          }
          initialPartnerLikes[v.name] = v.liked;
        });

        setRoomCode(code);
        setIsHost(false);
        setPartnerConnected(true);
        setPartnerDone(partnerFinished);
        setPartnerProgress(0);
        setRoomFilters(receivedFilters);
        setRoomSeed(receivedSeed);
        setMyLikes({});
        setPartnerLikes(initialPartnerLikes);
        setMatches([]);
        setLastMatch(null);

        AsyncStorage.setItem(ROOM_STORAGE_KEY, code).catch(() => {});
        setSavedRoomCode(code);

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

  const publishFilters = useCallback(
    async (filters: IFilters, seed: number) => {
      if (!roomCode) return;
      setRoomFilters(filters);
      setRoomSeed(seed);
      const userId = myId || `user_${Date.now()}`;
      try {
        await supabase.from('votes').insert([
          {
            room_code: roomCode,
            user_id: JSON.stringify({ ...filters, seed }),
            name: '__filters__',
            liked: false,
          },
          {
            room_code: roomCode,
            user_id: userId,
            name: `__filters__:${JSON.stringify({ filters, seed })}`,
            liked: false,
          },
        ]);
      } catch (e) {
        console.warn('Error publicando filtros a Supabase:', e);
      }
    },
    [roomCode, myId]
  );

  const notifyProgress = useCallback(
    async (index: number) => {
      if (!roomCode) return;
      const userId = myId || `user_${Date.now()}`;
      try {
        await supabase.from('votes').insert([
          {
            room_code: roomCode,
            user_id: userId,
            name: `__progress__:${index}`,
            liked: false,
          },
        ]);
      } catch (e) {
        console.warn('Error notificando progreso:', e);
      }
    },
    [roomCode, myId]
  );

  const notifyDone = useCallback(async () => {
    if (!roomCode) return;
    const userId = myId || `user_${Date.now()}`;
    try {
      await supabase.from('votes').insert([
        {
          room_code: roomCode,
          user_id: userId,
          name: '__done__',
          liked: false,
        },
      ]);
    } catch (e) {
      console.warn('Error notificando fin de baraja:', e);
    }
  }, [roomCode, myId]);

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

  const clearSavedRoom = useCallback(() => {
    AsyncStorage.removeItem(ROOM_STORAGE_KEY).catch(() => {});
    setSavedRoomCode(null);
  }, []);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    clearSavedRoom();
    processedRecordIdsRef.current.clear();
    setRoomCode(null);
    setIsHost(false);
    setPartnerConnected(false);
    setPartnerDone(false);
    setPartnerProgress(0);
    setRoomFilters(null);
    setRoomSeed(null);
    setMyLikes({});
    setPartnerLikes({});
    setMatches([]);
    setLastMatch(null);
    setError(null);
  }, [clearSavedRoom]);

  const value = useMemo(
    () => ({
      myId,
      roomCode,
      isHost,
      partnerConnected,
      partnerDone,
      partnerProgress,
      myLikes,
      partnerLikes,
      matches,
      lastMatch,
      rushMode,
      roomFilters,
      roomSeed,
      savedRoomCode,
      isLoading,
      error,
      setRushMode,
      createRoom,
      joinRoom,
      publishFilters,
      submitVote,
      notifyProgress,
      notifyDone,
      clearLastMatch,
      clearSavedRoom,
      leaveRoom,
    }),
    [
      myId,
      roomCode,
      isHost,
      partnerConnected,
      partnerDone,
      partnerProgress,
      myLikes,
      partnerLikes,
      matches,
      lastMatch,
      rushMode,
      roomFilters,
      roomSeed,
      savedRoomCode,
      isLoading,
      error,
      setRushMode,
      createRoom,
      joinRoom,
      publishFilters,
      submitVote,
      notifyProgress,
      notifyDone,
      clearLastMatch,
      clearSavedRoom,
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
