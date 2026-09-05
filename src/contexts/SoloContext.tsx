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
  startSession: (customFilters?: IFilters) => void;
  vote: (liked: boolean) => void;
  undo: () => void;
  restart: () => void;
}

const defaultFilters: IFilters = {
  gender: 'all',
  origins: [],
};

// Función para barajar un array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
    if (filters.origins.length > 0) {
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
    (customFilters?: IFilters) => {
      const activeFilters = customFilters || filters;
      const filtered = filterNames(NAMES_DB, activeFilters);
      const shuffled = shuffleArray(filtered);
      setDeck(shuffled);
      setCurrentIndex(0);
      setHistory([]);
    },
    [filters]
  );

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
