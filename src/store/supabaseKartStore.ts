import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Pilot, Race, RaceResult } from './kartStore';

interface SupabaseKartStore {
  pilots: Pilot[];
  races: Race[];
  loading: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  addRace: (race: Omit<Race, 'id'>) => Promise<void>;
  updateRace: (raceId: string, race: Partial<Race>) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
  calculateTotalPoints: (pilotId: string) => number;
  calculatePointsForRace: (race: Race, pilotId: string) => number;
}

// Points system - mesmo do kartStore original
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

// Default pilots - mesmo do kartStore original
const DEFAULT_PILOTS: Pilot[] = [
  { id: '1', name: 'Carlos Silva', color: '#ef4444' },
  { id: '2', name: 'Ana Costa', color: '#3b82f6' },
  { id: '3', name: 'João Santos', color: '#10b981' },
  { id: '4', name: 'Maria Oliveira', color: '#f59e0b' },
  { id: '5', name: 'Pedro Lima', color: '#8b5cf6' },
  { id: '6', name: 'Sofia Mendes', color: '#ec4899' },
  { id: '7', name: 'Lucas Rocha', color: '#06b6d4' },
  { id: '8', name: 'Beatriz Alves', color: '#84cc16' },
  { id: '9', name: 'Diego Ferreira', color: '#f97316' },
  { id: '10', name: 'Camila Souza', color: '#6366f1' },
];

export const useSupabaseKartStore = create<SupabaseKartStore>((set, get) => ({
  pilots: DEFAULT_PILOTS,
  races: [],
  loading: false,

  loadData: async () => {
    set({ loading: true });
    
    try {
      // Carregar corridas
      const { data: corridas, error: corridasError } = await supabase
        .from('corridas')
        .select('*')
        .order('data', { ascending: false });

      if (corridasError) throw corridasError;

      // Carregar resultados para cada corrida
      const races: Race[] = [];
      
      for (const corrida of corridas || []) {
        const { data: resultados, error: resultadosError } = await supabase
          .from('resultados_corrida')
          .select('*')
          .eq('corrida_id', corrida.id)
          .order('colocacao');

        if (resultadosError) throw resultadosError;

        // Converter resultados para o formato do Race
        const results: RaceResult[] = resultados?.map(resultado => ({
          pilotId: DEFAULT_PILOTS.find(p => p.name === resultado.piloto_nome)?.id || '',
          position: resultado.colocacao,
        })) || [];

        // Encontrar pole position e fastest lap
        const polePosition = resultados?.find(r => r.pole_position)?.piloto_nome;
        const fastestLap = resultados?.find(r => r.melhor_volta)?.piloto_nome;

        const race: Race = {
          id: corrida.id.toString(),
          date: corrida.data,
          results,
          polePosition: DEFAULT_PILOTS.find(p => p.name === polePosition)?.id,
          fastestLap: DEFAULT_PILOTS.find(p => p.name === fastestLap)?.id,
        };

        races.push(race);
      }

      set({ races, loading: false });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      set({ loading: false });
    }
  },

  addRace: async (race) => {
    set({ loading: true });
    
    try {
      // 1. Inserir corrida
      const { data: corridaData, error: corridaError } = await supabase
        .from('corridas')
        .insert({
          data: race.date,
          local: 'Kartódromo', // valor padrão
          nome: `Corrida ${new Date(race.date).toLocaleDateString('pt-BR')}`,
        })
        .select()
        .single();

      if (corridaError) throw corridaError;

      const corridaId = corridaData.id;

      // 2. Inserir resultados
      const resultadosToInsert = race.results.map(result => {
        const pilot = DEFAULT_PILOTS.find(p => p.id === result.pilotId);
        const pontos = get().calculatePointsForRace({ ...race, id: corridaId.toString() }, result.pilotId);
        
        return {
          corrida_id: corridaId,
          piloto_nome: pilot?.name || '',
          colocacao: result.position,
          pontos,
          pole_position: race.polePosition === result.pilotId,
          melhor_volta: race.fastestLap === result.pilotId,
        };
      });

      const { error: resultadosError } = await supabase
        .from('resultados_corrida')
        .insert(resultadosToInsert);

      if (resultadosError) throw resultadosError;

      // 3. Atualizar ranking geral
      for (const pilot of DEFAULT_PILOTS) {
        const totalPoints = get().calculateTotalPoints(pilot.id) + 
          get().calculatePointsForRace({ ...race, id: corridaId.toString() }, pilot.id);

        const { error: rankingError } = await supabase
          .from('ranking_geral')
          .upsert({
            piloto_nome: pilot.name,
            total_pontos: totalPoints,
          });

        if (rankingError) throw rankingError;
      }

      // Recarregar dados
      await get().loadData();
    } catch (error) {
      console.error('Erro ao adicionar corrida:', error);
      set({ loading: false });
    }
  },

  updateRace: async (raceId, updatedRace) => {
    set({ loading: true });
    
    try {
      const corridaId = parseInt(raceId);
      
      // Atualizar corrida se há dados para atualizar
      if (updatedRace.date) {
        const { error: corridaError } = await supabase
          .from('corridas')
          .update({
            data: updatedRace.date,
            nome: `Corrida ${new Date(updatedRace.date).toLocaleDateString('pt-BR')}`,
          })
          .eq('id', corridaId);

        if (corridaError) throw corridaError;
      }

      // Atualizar resultados se fornecidos
      if (updatedRace.results) {
        // Primeiro, deletar resultados existentes
        const { error: deleteError } = await supabase
          .from('resultados_corrida')
          .delete()
          .eq('corrida_id', corridaId);

        if (deleteError) throw deleteError;

        // Inserir novos resultados
        const resultadosToInsert = updatedRace.results.map(result => {
          const pilot = DEFAULT_PILOTS.find(p => p.id === result.pilotId);
          const currentRace = get().races.find(r => r.id === raceId);
          const raceData = { ...currentRace, ...updatedRace } as Race;
          const pontos = get().calculatePointsForRace(raceData, result.pilotId);
          
          return {
            corrida_id: corridaId,
            piloto_nome: pilot?.name || '',
            colocacao: result.position,
            pontos,
            pole_position: updatedRace.polePosition === result.pilotId,
            melhor_volta: updatedRace.fastestLap === result.pilotId,
          };
        });

        const { error: resultadosError } = await supabase
          .from('resultados_corrida')
          .insert(resultadosToInsert);

        if (resultadosError) throw resultadosError;

        // Recalcular ranking geral
        for (const pilot of DEFAULT_PILOTS) {
          const totalPoints = get().calculateTotalPoints(pilot.id);

          const { error: rankingError } = await supabase
            .from('ranking_geral')
            .upsert({
              piloto_nome: pilot.name,
              total_pontos: totalPoints,
            });

          if (rankingError) throw rankingError;
        }
      }

      // Recarregar dados
      await get().loadData();
    } catch (error) {
      console.error('Erro ao atualizar corrida:', error);
      set({ loading: false });
    }
  },

  deleteRace: async (raceId) => {
    set({ loading: true });
    
    try {
      const corridaId = parseInt(raceId);
      
      // Deletar corrida (cascade irá deletar resultados automaticamente)
      const { error } = await supabase
        .from('corridas')
        .delete()
        .eq('id', corridaId);

      if (error) throw error;

      // Recalcular ranking geral
      for (const pilot of DEFAULT_PILOTS) {
        const totalPoints = get().calculateTotalPoints(pilot.id);

        const { error: rankingError } = await supabase
          .from('ranking_geral')
          .upsert({
            piloto_nome: pilot.name,
            total_pontos: totalPoints,
          });

        if (rankingError) throw rankingError;
      }

      // Recarregar dados
      await get().loadData();
    } catch (error) {
      console.error('Erro ao deletar corrida:', error);
      set({ loading: false });
    }
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
}));