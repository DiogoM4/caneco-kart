
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Flag, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KartTrack from '@/components/KartTrack';
import { useKartStore } from '@/store/kartStore';

const Index = () => {
  console.log('Index component rendering');
  
  const navigate = useNavigate();
  console.log('useNavigate called successfully');
  
  const { pilots, races, calculateTotalPoints } = useKartStore();
  console.log('Store data:', { pilots: pilots.length, races: races.length });
  
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    console.log('Calculating rankings...');
    const pilotsWithPoints = pilots.map(pilot => ({
      ...pilot,
      totalPoints: calculateTotalPoints(pilot.id)
    }));
    
    const sortedRankings = pilotsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
    setRankings(sortedRankings);
    console.log('Rankings calculated:', sortedRankings);
  }, [pilots, races, calculateTotalPoints]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Championship Kart</h1>
                <p className="text-blue-200">Temporada 2024</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/results')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Resultados
              </Button>
              <Button 
                onClick={() => navigate('/results')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Corrida
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-white/70 text-sm">Líder</p>
                <p className="text-white font-bold text-lg">
                  {rankings[0]?.name || 'Aguardando corridas'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Flag className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-white/70 text-sm">Corridas</p>
                <p className="text-white font-bold text-lg">{races.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-white/70 text-sm">Pilotos</p>
                <p className="text-white font-bold text-lg">{pilots.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Ranking do Campeonato</h2>
          </div>
          
          {rankings.length > 0 ? (
            <KartTrack rankings={rankings} />
          ) : (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-4">Nenhuma corrida registrada ainda</p>
              <Button 
                onClick={() => navigate('/results')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Registrar Primeira Corrida
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
