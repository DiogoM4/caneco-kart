
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Pilot {
  id: string;
  name: string;
  color: string;
}

export interface RaceResult {
  pilotId: string;
  position: number;
}

export interface Race {
  id: string;
  date: string;
  results: RaceResult[];
  polePosition?: string;
  fastestLap?: string;
}

interface KartStore {
  pilots: Pilot[];
  races: Race[];
  
  // Actions
  addRace: (race: Omit<Race, 'id'>) => void;
  updateRace: (raceId: string, race: Partial<Race>) => void;
  deleteRace: (raceId: string) => void;
  calculateTotalPoints: (pilotId: string) => number;
  calculatePointsForRace: (race: Race, pilotId: string) => number;
}

// Points system
const POINTS_SYSTEM = {
  1: 10,
  2: 8,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
  10: 0,
};

const BONUS_POINTS = {
  pole: 1,
  fastestLap: 1,
};

// Default pilots with vibrant colors
const DEFAULT_PILOTS: Pilot[] = [
  { id: '1', name: 'Carlos Silva', color: '#ef4444' },      // Red
  { id: '2', name: 'Ana Costa', color: '#3b82f6' },        // Blue
  { id: '3', name: 'João Santos', color: '#10b981' },      // Green
  { id: '4', name: 'Maria Oliveira', color: '#f59e0b' },   // Yellow
  { id: '5', name: 'Pedro Lima', color: '#8b5cf6' },       // Purple
  { id: '6', name: 'Sofia Mendes', color: '#ec4899' },     // Pink
  { id: '7', name: 'Lucas Rocha', color: '#06b6d4' },      // Cyan
  { id: '8', name: 'Beatriz Alves', color: '#84cc16' },    // Lime
  { id: '9', name: 'Diego Ferreira', color: '#f97316' },   // Orange
  { id: '10', name: 'Camila Souza', color: '#6366f1' },    // Indigo
];

export const useKartStore = create<KartStore>()(
  persist(
    (set, get) => ({
      pilots: DEFAULT_PILOTS,
      races: [],

      addRace: (race) => {
        const newRace: Race = {
          ...race,
          id: Date.now().toString(),
        };
        set((state) => ({
          races: [...state.races, newRace],
        }));
      },

      updateRace: (raceId, updatedRace) => {
        set((state) => ({
          races: state.races.map((race) =>
            race.id === raceId ? { ...race, ...updatedRace } : race
          ),
        }));
      },

      deleteRace: (raceId) => {
        set((state) => ({
          races: state.races.filter((race) => race.id !== raceId),
        }));
      },

      calculatePointsForRace: (race, pilotId) => {
        let points = 0;
        
        // Position points
        const result = race.results.find(r => r.pilotId === pilotId);
        if (result) {
          points += POINTS_SYSTEM[result.position as keyof typeof POINTS_SYSTEM] || 0;
        }
        
        // Bonus points
        if (race.polePosition === pilotId) {
          points += BONUS_POINTS.pole;
        }
        if (race.fastestLap === pilotId) {
          points += BONUS_POINTS.fastestLap;
        }
        
        return points;
      },

      calculateTotalPoints: (pilotId) => {
        const { races, calculatePointsForRace } = get();
        return races.reduce((total, race) => {
          return total + calculatePointsForRace(race, pilotId);
        }, 0);
      },
    }),
    {
      name: 'kart-championship-storage',
    }
  )
);
