import { useState } from 'react';
import { Crown, Zap, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseKartStore } from '@/store/supabaseKartStore';
interface RaceTableProps {
  race: {
    id: string;
    date: string;
    results: Array<{
      pilotId: string;
      position: number;
    }>;
    polePosition?: string;
    fastestLap?: string;
  };
}
const RaceTable = ({
  race
}: RaceTableProps) => {
  const {
    pilots,
    updateRace
  } = useSupabaseKartStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedResults, setEditedResults] = useState(race.results);
  const [editedPolePosition, setEditedPolePosition] = useState(race.polePosition || '');
  const [editedFastestLap, setEditedFastestLap] = useState(race.fastestLap || '');
  const handleSave = () => {
    updateRace(race.id, {
      results: editedResults,
      polePosition: editedPolePosition,
      fastestLap: editedFastestLap
    });
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedResults(race.results);
    setEditedPolePosition(race.polePosition || '');
    setEditedFastestLap(race.fastestLap || '');
    setIsEditing(false);
  };
  const updatePosition = (pilotId: string, newPosition: number) => {
    // Find if another pilot already has this position
    const existingPilot = editedResults.find(r => r.position === newPosition);
    const currentPilot = editedResults.find(r => r.pilotId === pilotId);
    if (existingPilot && currentPilot) {
      // Swap positions
      const newResults = editedResults.map(result => {
        if (result.pilotId === pilotId) {
          return {
            ...result,
            position: newPosition
          };
        }
        if (result.pilotId === existingPilot.pilotId) {
          return {
            ...result,
            position: currentPilot.position
          };
        }
        return result;
      });
      setEditedResults(newResults);
    }
  };

  // Remove duplicates and keep the best position for each pilot
  const uniqueResults = Array.from(new Map(editedResults.map(item => [item.pilotId, item])).values());
  const sortedResults = [...uniqueResults].sort((a, b) => a.position - b.position);
  return <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            <span className="text-white/70 text-sm">Pole Position:</span>
            {isEditing ? <Select value={editedPolePosition} onValueChange={setEditedPolePosition}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {pilots.map(pilot => <SelectItem key={pilot.id} value={pilot.id}>
                      {pilot.name}
                    </SelectItem>)}
                </SelectContent>
              </Select> : <span className="text-white font-medium">
                {editedPolePosition ? pilots.find(p => p.id === editedPolePosition)?.name : 'N/A'}
              </span>}
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-white/70 text-sm">Melhor Volta:</span>
            {isEditing ? <Select value={editedFastestLap} onValueChange={setEditedFastestLap}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {pilots.map(pilot => <SelectItem key={pilot.id} value={pilot.id}>
                      {pilot.name}
                    </SelectItem>)}
                </SelectContent>
              </Select> : <span className="text-white font-medium">
                {editedFastestLap ? pilots.find(p => p.id === editedFastestLap)?.name : 'N/A'}
              </span>}
          </div>
        </div>
        
        
      </div>

      {/* Results Table */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-white/70 text-sm font-medium mb-3 pb-2 border-b border-white/10">
          <span>Posição</span>
          <span>Piloto</span>
          <span>Pontos</span>
        </div>
        
        <div className="space-y-2">
          {sortedResults.map(result => {
          const pilot = pilots.find(p => p.id === result.pilotId);
          if (!pilot) return null; // Added for safety
          const points = calculatePoints(result.position, result.pilotId === editedPolePosition, result.pilotId === editedFastestLap);
          return <div key={result.pilotId} className="grid grid-cols-3 gap-4 items-center py-2">
                <div className="flex items-center gap-2">
                  {isEditing ? <Select value={result.position.toString()} onValueChange={value => updatePosition(result.pilotId, parseInt(value))}>
                      <SelectTrigger className="w-16 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({
                    length: 10
                  }, (_, i) => i + 1).map(pos => <SelectItem key={pos} value={pos.toString()}>
                            {pos}º
                          </SelectItem>)}
                      </SelectContent>
                    </Select> : <span className="text-white font-bold text-lg w-8">
                      {result.position}º
                    </span>}
                  {result.position <= 3 && <div className={`w-2 h-2 rounded-full ${result.position === 1 ? 'bg-yellow-400' : result.position === 2 ? 'bg-gray-400' : 'bg-orange-400'}`} />}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{
                backgroundColor: pilot?.color
              }} />
                  <span className="text-white font-medium">{pilot?.name}</span>
                  <div className="flex gap-1">
                    {result.pilotId === editedPolePosition && <Crown className="h-3 w-3 text-yellow-400" />}
                    {result.pilotId === editedFastestLap && <Zap className="h-3 w-3 text-purple-400" />}
                  </div>
                </div>
                
                <span className="text-white font-bold">
                  {points} pts
                </span>
              </div>;
        })}
        </div>
      </div>
    </div>;
};

// Helper function to calculate points
const calculatePoints = (position: number, hasPole: boolean, hasFastestLap: boolean) => {
  const positionPoints = {
    1: 10,
    2: 8,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
    9: 0,
    10: 0
  };
  let points = positionPoints[position as keyof typeof positionPoints] || 0;
  if (hasPole) points += 1;
  if (hasFastestLap) points += 1;
  return points;
};
export default RaceTable;