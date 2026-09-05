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

export interface IFilters {
  gender: FilterGender;
  origins: string[]; // vacío significa todos
}

// sesión en solitario
export interface ISoloVote {
  name: IName;
  liked: boolean;
  timestamp: number;
}
