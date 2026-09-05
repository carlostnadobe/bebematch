import { IName } from '@/types';

// TODO: cargar 473 nombres del dataset original
export const NAMES: IName[] = [
  {
    n: 'Emma',
    g: 'girl',
    o: 'Germánico',
    m: 'Fuerza, firmeza',
  },
  {
    n: 'Liam',
    g: 'boy',
    o: 'Irlandés',
    m: 'Protección, determinación',
  },
];

export const ORIGINS = Array.from(new Set(NAMES.map((n) => n.o)));
