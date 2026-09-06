import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { IName, IFilters, ISoloVote, AffinityVote } from '../types';
import { NAMES_DB } from '../data/names';

interface SoloContextValue {
  filters: IFilters;
  deck: IName[];
  currentIndex: number;
  currentCard: IName | null;
  history: ISoloVote[];
  likedNames: IName[];
  selectedMap: Record<string, boolean>;
  top1Names: IName[];
  isFinished: boolean;
  totalCards: number;
  remainingCount: number;
  setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
  startSession: (customFilters?: IFilters, seed?: number, preserveHistory?: boolean) => void;
  refineSession: (matches: IName[]) => void;
  vote: (likedOrAffinity: boolean | AffinityVote) => void;
  stampCard: (targetIndex?: number, liked?: boolean) => void;
  advance: () => void;
  removeVote: (targetIndex?: number) => void;
  undo: () => void;
  toggleVote: (targetIndex?: number) => void;
  restart: () => void;
}

const defaultFilters: IFilters = {
  gender: 'all',
  origins: [],
  duration: 'normal',
  extra: null,
};

// Generador pseudoaleatorio determinista (Mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Función para barajar deterministamente si hay semilla o aleatoriamente si no
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  const randomFn = seed !== undefined ? mulberry32(seed) : Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Filtra la base de datos de nombres según los filtros seleccionados
export function filterNames(names: IName[], filters: IFilters): IName[] {
  return names.filter((item) => {
    // Filtro de género
    if (filters.gender !== 'all') {
      if (item.g !== filters.gender) {
        return false;
      }
    }
    // Filtro de orígenes
    if (filters.origins.length > 0) {
      if (!filters.origins.includes(item.o)) {
        return false;
      }
    }
    return true;
  });
}

const SoloContext = createContext<SoloContextValue | undefined>(undefined);

export const SoloProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<IFilters>(defaultFilters);
  const [deck, setDeck] = useState<IName[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [votesByIndex, setVotesByIndex] = useState<Record<number, ISoloVote>>({});

  const startSession = useCallback(
    (customFilters?: IFilters, seed?: number, preserveHistory: boolean = false) => {
      const activeFilters = customFilters || filters;
      setFilters(activeFilters);
      const filtered = filterNames(NAMES_DB, activeFilters);
      const shuffled = shuffleArray(filtered, seed);

      // Limitar según duración si aplica
      let limitedDeck = shuffled;
      if (activeFilters.duration === 'flash') {
        limitedDeck = shuffled.slice(0, 5);
      } else if (activeFilters.duration === 'normal') {
        limitedDeck = shuffled.slice(0, 20);
      } else if (activeFilters.duration === 'long') {
        limitedDeck = shuffled.slice(0, 40);
      }

      setDeck(limitedDeck);
      setCurrentIndex(0);
      if (!preserveHistory) {
        setVotesByIndex({});
      }
    },
    [filters]
  );

  const refineSession = useCallback((matches: IName[]) => {
    setDeck(matches);
    setCurrentIndex(0);
    setVotesByIndex({});
  }, []);

  const vote = useCallback(
    (likedOrAffinity: boolean | AffinityVote) => {
      if (currentIndex >= deck.length) return;
      const currentName = deck[currentIndex];
      const affinity: AffinityVote =
        typeof likedOrAffinity === 'string'
          ? likedOrAffinity
          : likedOrAffinity
          ? 'like'
          : 'pass';
      const liked = affinity !== 'pass';
      setVotesByIndex((prev) => ({
        ...prev,
        [currentIndex]: {
          name: currentName,
          liked,
          affinity,
          timestamp: Date.now(),
        },
      }));
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, deck]
  );

  // Sellar ficha sin avanzar el índice (el avance lo hace manualmente el usuario)
  const stampCard = useCallback(
    (targetIndex?: number, liked: boolean = true) => {
      const idx = targetIndex ?? currentIndex;
      if (idx >= deck.length) return;
      const card = deck[idx];
      setVotesByIndex((prev) => ({
        ...prev,
        [idx]: {
          name: card,
          liked,
          affinity: liked ? 'like' : 'pass',
          timestamp: Date.now(),
        },
      }));
    },
    [currentIndex, deck]
  );

  const advance = useCallback(() => {
    if (currentIndex >= deck.length) return;
    setVotesByIndex((prev) => {
      // Si ya tiene un voto registrado (sea like o pass), NO lo sobreescribimos
      if (prev[currentIndex] !== undefined) {
        return prev;
      }
      return {
        ...prev,
        [currentIndex]: {
          name: deck[currentIndex],
          liked: false,
          affinity: 'pass',
          timestamp: Date.now(),
        },
      };
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, deck]);

  const removeVote = useCallback(
    (targetIndex?: number) => {
      const idx = targetIndex ?? currentIndex;
      if (idx >= deck.length) return;
      setVotesByIndex((prev) => {
        const next = { ...prev };
        if (next[idx]) {
          next[idx] = {
            ...next[idx],
            liked: false,
            affinity: 'pass',
            timestamp: Date.now(),
          };
        }
        return next;
      });
    },
    [currentIndex, deck]
  );

  const toggleVote = useCallback(
    (targetIndex?: number) => {
      const idx = targetIndex ?? currentIndex;
      if (idx >= deck.length) return;
      const card = deck[idx];
      setVotesByIndex((prev) => {
        const currentVote = prev[idx];
        const newLiked = !currentVote?.liked;
        return {
          ...prev,
          [idx]: {
            name: card,
            liked: newLiked,
            affinity: newLiked ? 'like' : 'pass',
            timestamp: Date.now(),
          },
        };
      });
    },
    [currentIndex, deck]
  );

  const undo = useCallback(() => {
    if (currentIndex <= 0) return;
    // En la bobina continua, retroceder la cinta no borra la marca de la ficha
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex]);

  const restart = useCallback(() => {
    startSession(filters);
  }, [startSession, filters]);

  const currentCard = useMemo(() => {
    if (currentIndex < deck.length) {
      return deck[currentIndex];
    }
    return null;
  }, [currentIndex, deck]);

  const history = useMemo(() => {
    return Object.values(votesByIndex).sort((a, b) => a.timestamp - b.timestamp);
  }, [votesByIndex]);

  const likedNames = useMemo(() => {
    return Object.values(votesByIndex)
      .filter((v) => v.liked)
      .map((v) => v.name);
  }, [votesByIndex]);

  const selectedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const v of Object.values(votesByIndex)) {
      if (v.liked) {
        map[v.name.n] = true;
      }
    }
    return map;
  }, [votesByIndex]);

  const top1Names = useMemo(() => {
    return Object.values(votesByIndex)
      .filter((v) => v.affinity === 'top1')
      .map((v) => v.name);
  }, [votesByIndex]);

  const isFinished = useMemo(() => {
    return deck.length > 0 && currentIndex >= deck.length;
  }, [currentIndex, deck.length]);

  const totalCards = deck.length;
  const remainingCount = Math.max(0, totalCards - Object.keys(votesByIndex).length);

  const value = useMemo(
    () => ({
      filters,
      deck,
      currentIndex,
      currentCard,
      history,
      likedNames,
      selectedMap,
      top1Names,
      isFinished,
      totalCards,
      remainingCount,
      setFilters,
      startSession,
      refineSession,
      vote,
      stampCard,
      advance,
      removeVote,
      undo,
      toggleVote,
      restart,
    }),
    [
      filters,
      deck,
      currentIndex,
      currentCard,
      history,
      likedNames,
      selectedMap,
      top1Names,
      isFinished,
      totalCards,
      remainingCount,
      startSession,
      refineSession,
      vote,
      stampCard,
      advance,
      removeVote,
      undo,
      toggleVote,
      restart,
    ]
  );

  return <SoloContext.Provider value={value}>{children}</SoloContext.Provider>;
};

export const useSolo = (): SoloContextValue => {
  const context = useContext(SoloContext);
  if (!context) {
    throw new Error('useSolo debe ser utilizado dentro de un SoloProvider');
  }
  return context;
};
