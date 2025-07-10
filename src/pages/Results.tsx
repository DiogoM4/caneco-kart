
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, Trophy, Zap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKartStore } from '@/store/kartStore';
import RaceTable from '@/components/RaceTable';
import ScoreSidebar from '@/components/ScoreSidebar';

const Results = () => {
  const navigate = useNavigate();
  const { races, pilots, addRace } = useKartStore();
  const [showNewRaceForm, setShowNewRaceForm] = useState(false);
  const [newRaceDate, setNewRaceDate] = useState('');

  const handleCreateRace = () => {
    if (!newRaceDate) return;
    
    const newRace = {
      date: newRaceDate,
      results: pilots.map((pilot, index) => ({
        pilotId: pilot.id,
        position: index + 1, // Default positions
      })),
    };
    
    addRace(newRace);
    setShowNewRaceForm(false);
    setNewRaceDate('');
  };

  // Generate suggested dates (every 2 weeks)
  const generateSuggestedDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + (i * 14));
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const suggestedDates = generateSuggestedDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Resultados das Corridas</h1>
                <p className="text-blue-200">Gerencie os resultados do campeonato</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowNewRaceForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Corrida
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* New Race Form */}
            {showNewRaceForm && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Nova Corrida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Data da Corrida
                    </label>
                    <Input
                      type="date"
                      value={newRaceDate}
                      onChange={(e) => setNewRaceDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Datas Sugeridas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedDates.map((date) => (
                        <Button
                          key={date}
                          variant="outline"
                          size="sm"
                          onClick={() => setNewRaceDate(date)}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          {new Date(date).toLocaleDateString('pt-BR')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateRace}
                      disabled={!newRaceDate}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Criar Corrida
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewRaceForm(false)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Races List */}
            {races.length > 0 ? (
              <div className="space-y-4">
                {races.map((race, index) => (
                  <Card key={race.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-400" />
                          Corrida {index + 1} - {new Date(race.date).toLocaleDateString('pt-BR')}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RaceTable race={race} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <Trophy className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg mb-4">Nenhuma corrida registrada</p>
                  <p className="text-white/50 mb-6">Comece criando sua primeira corrida do campeonato</p>
                  <Button 
                    onClick={() => setShowNewRaceForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Corrida
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ScoreSidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
