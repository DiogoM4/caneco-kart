import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseKartStore } from '@/store/supabaseKartStore';
import RaceTable from '@/components/RaceTable';
import ScoreSidebar from '@/components/ScoreSidebar';

const Results = () => {
  const navigate = useNavigate();
  const { races, loadData } = useSupabaseKartStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

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
                <p className="text-blue-200">Veja os resultados do campeonato</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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
                  <p className="text-white/50 mb-6">Aguarde as corridas serem adicionadas</p>
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