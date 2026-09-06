// nombres de bebé
export type Gender = 'girl' | 'boy' | 'neutral';

export interface IName {
  n: string;
  g: Gender;
  o: string;
  m: string;
  santo?: string;
  curioso?: string;
  famosos?: string[];
}

// votos
export interface IVote {
  id: string;
  roomCode: string;
  userId: string;
  name: string;
  liked: boolean;
  createdAt: Date;
}

// salas
export interface IRoom {
  code: string;
  createdBy: string;
  createdAt: Date;
  status: 'waiting' | 'active' | 'done';
  genderFilter: 'girl' | 'boy' | 'all';
  originFilter: string;
}

// usuario en la app
export interface IUser {
  id: string;
  name?: string;
  role: 'creator' | 'joiner';
}

// estado de sala observable
export interface IRoomState {
  code: string;
  myVotes: IVote[];
  partnerVotes: IVote[];
  matches: IName[];
  myFavorites: IName[];
  status: 'waiting' | 'active' | 'done';
}

// filtros
export type FilterGender = 'girl' | 'boy' | 'neutral' | 'all';
export type FilterDuration = 'flash' | 'normal' | 'long';
export type FilterExtra = 'calorro' | 'sudamerica' | 'reyes' | null;

export interface IFilters {
  gender: FilterGender;
  origins: string[]; // vacío significa todos
  duration?: FilterDuration; // flash (~5), normal (~20), long (~40)
  extra?: FilterExtra;
}

// afinidad de voto (Opción 3: El Podio)
export type AffinityVote = 'pass' | 'like' | 'top1';

// sesión en solitario
export interface ISoloVote {
  name: IName;
  liked: boolean;
  affinity?: AffinityVote;
  timestamp: number;
}
