import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { IName, IFilters, ISoloVote } from '../types';
import { NAMES_DB } from '../data/names';

interface SoloContextValue {
  filters: IFilters;
  deck: IName[];
  currentIndex: number;
  currentCard: IName | null;
  history: ISoloVote[];
  likedNames: IName[];
  isFinished: boolean;
  totalCards: number;
  remainingCount: number;
  setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
  startSession: (customFilters?: IFilters, seed?: number, preserveHistory?: boolean) => void;
  refineSession: (matches: IName[]) => void;
  vote: (liked: boolean) => void;
  undo: () => void;
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
    // Filtro de origen
    if (filters.origins.length > 0 && !filters.origins.includes('todos')) {
      if (!filters.origins.includes(item.o.toLowerCase())) {
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
  const [history, setHistory] = useState<ISoloVote[]>([]);

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
        setHistory([]);
      }
    },
    [filters]
  );

  const refineSession = useCallback((matches: IName[]) => {
    setDeck(matches);
    setCurrentIndex(0);
    setHistory([]);
  }, []);

  const vote = useCallback(
    (liked: boolean) => {
      if (currentIndex >= deck.length) return;
      const currentName = deck[currentIndex];
      setHistory((prev) => [
        ...prev,
        {
          name: currentName,
          liked,
          timestamp: Date.now(),
        },
      ]);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, deck]
  );

  const undo = useCallback(() => {
    if (currentIndex <= 0 || history.length === 0) return;
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex, history.length]);

  const restart = useCallback(() => {
    startSession(filters);
  }, [startSession, filters]);

  const currentCard = useMemo(() => {
    if (currentIndex < deck.length) {
      return deck[currentIndex];
    }
    return null;
  }, [currentIndex, deck]);

  const likedNames = useMemo(() => {
    return history.filter((v) => v.liked).map((v) => v.name);
  }, [history]);

  const isFinished = useMemo(() => {
    return deck.length > 0 && currentIndex >= deck.length;
  }, [currentIndex, deck.length]);

  const totalCards = deck.length;
  const remainingCount = Math.max(0, totalCards - currentIndex);

  const value = useMemo(
    () => ({
      filters,
      deck,
      currentIndex,
      currentCard,
      history,
      likedNames,
      isFinished,
      totalCards,
      remainingCount,
      setFilters,
      startSession,
      refineSession,
      vote,
      undo,
      restart,
    }),
    [
      filters,
      deck,
      currentIndex,
      currentCard,
      history,
      likedNames,
      isFinished,
      totalCards,
      remainingCount,
      startSession,
      refineSession,
      vote,
      undo,
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
