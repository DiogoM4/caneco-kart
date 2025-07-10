
import { useState } from 'react';
import { Trophy, Zap, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKartStore } from '@/store/kartStore';
import type { Race } from '@/store/kartStore';

interface RaceTableProps {
  race: Race;
}

const RaceTable: React.FC<RaceTableProps> = ({ race }) => {
  const { pilots, updateRace, deleteRace, calculatePointsForRace } = useKartStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRace, setEditedRace] = useState<Race>(race);

  const handleSave = () => {
    updateRace(race.id, editedRace);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRace(race);
    setIsEditing(false);
  };

  const updatePosition = (pilotId: string, position: number) => {
    const newResults = editedRace.results.map(result =>
      result.pilotId === pilotId ? { ...result, position } : result
    );
    setEditedRace({ ...editedRace, results: newResults });
  };

  const setPolePosition = (pilotId: string) => {
    setEditedRace({ 
      ...editedRace, 
      polePosition: editedRace.polePosition === pilotId ? undefined : pilotId 
    });
  };

  const setFastestLap = (pilotId: string) => {
    setEditedRace({ 
      ...editedRace, 
      fastestLap: editedRace.fastestLap === pilotId ? undefined : pilotId 
    });
  };

  const sortedResults = [...(isEditing ? editedRace.results : race.results)]
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => deleteRace(race.id)}
          variant="destructive"
          size="sm"
          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
        >
          Excluir Corrida
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-2 text-white/70 font-medium">Pos</th>
              <th className="text-left py-3 px-2 text-white/70 font-medium">Piloto</th>
              <th className="text-center py-3 px-2 text-white/70 font-medium">
                <Trophy className="h-4 w-4 mx-auto" title="Pole Position" />
              </th>
              <th className="text-center py-3 px-2 text-white/70 font-medium">
                <Zap className="h-4 w-4 mx-auto" title="Melhor Volta" />
              </th>
              <th className="text-right py-3 px-2 text-white/70 font-medium">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result) => {
              const pilot = pilots.find(p => p.id === result.pilotId);
              if (!pilot) return null;
              
              const points = calculatePointsForRace(isEditing ? editedRace : race, pilot.id);
              const isPole = (isEditing ? editedRace.polePosition : race.polePosition) === pilot.id;
              const isFastest = (isEditing ? editedRace.fastestLap : race.fastestLap) === pilot.id;

              return (
                <tr key={pilot.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-2">
                    {isEditing ? (
                      <Select 
                        value={result.position.toString()} 
                        onValueChange={(value) => updatePosition(pilot.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-16 h-8 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(pos => (
                            <SelectItem key={pos} value={pos.toString()}>
                              {pos}º
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-white font-bold">{result.position}º</span>
                    )}
                  </td>
                  
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: pilot.color }}
                      ></div>
                      <span className="text-white">{pilot.name}</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-2 text-center">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPolePosition(pilot.id)}
                        className={`h-8 w-8 p-0 ${isPole ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/30 hover:text-white/60'}`}
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                    ) : (
                      isPole && <Trophy className="h-4 w-4 text-yellow-400 mx-auto" />
                    )}
                  </td>
                  
                  <td className="py-3 px-2 text-center">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFastestLap(pilot.id)}
                        className={`h-8 w-8 p-0 ${isFastest ? 'bg-purple-500/20 text-purple-400' : 'text-white/30 hover:text-white/60'}`}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                    ) : (
                      isFastest && <Zap className="h-4 w-4 text-purple-400 mx-auto" />
                    )}
                  </td>
                  
                  <td className="py-3 px-2 text-right">
                    <span className="text-white font-bold">{points}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RaceTable;
