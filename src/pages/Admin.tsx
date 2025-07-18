import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, Trophy, Zap, Calendar, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSupabaseKartStore } from '@/store/supabaseKartStore';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    races, 
    pilots, 
    addRace, 
    updateRace, 
    deleteRace,
    loadData, 
    loading,
    calculatePointsForRace 
  } = useSupabaseKartStore();

  // Nova Corrida State
  const [newRace, setNewRace] = useState({
    nome: '',
    data: '',
    local: ''
  });

  // Gerenciar Resultados State
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [raceResults, setRaceResults] = useState({});
  const [polePosition, setPolePosition] = useState('');
  const [fastestLap, setFastestLap] = useState('');

  // Gerenciar Pilotos State
  const [editingPilots, setEditingPilots] = useState({});
  const [newPilotName, setNewPilotName] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Inicializar resultados quando uma corrida é selecionada
  useEffect(() => {
    if (selectedRaceId) {
      const selectedRace = races.find(r => r.id === selectedRaceId);
      if (selectedRace) {
        const initialResults = {};
        pilots.forEach(pilot => {
          const existingResult = selectedRace.results.find(r => r.pilotId === pilot.id);
          initialResults[pilot.id] = existingResult ? existingResult.position : '';
        });
        setRaceResults(initialResults);
        setPolePosition(selectedRace.polePosition || '');
        setFastestLap(selectedRace.fastestLap || '');
      } else {
        // Nova corrida - inicializar vazio
        const initialResults = {};
        pilots.forEach(pilot => {
          initialResults[pilot.id] = '';
        });
        setRaceResults(initialResults);
        setPolePosition('');
        setFastestLap('');
      }
    }
  }, [selectedRaceId, races, pilots]);

  const handleCreateRace = async () => {
    if (!newRace.nome || !newRace.data || !newRace.local) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await addRace({
        date: newRace.data,
        results: pilots.map((pilot, index) => ({
          pilotId: pilot.id,
          position: index + 1
        }))
      });

      setNewRace({ nome: '', data: '', local: '' });
      toast({
        title: "Sucesso",
        description: "Corrida criada com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar corrida",
        variant: "destructive"
      });
    }
  };

  const handleSaveResults = async () => {
    if (!selectedRaceId) return;

    // Verificar se todas as posições foram preenchidas
    const positions = Object.values(raceResults).filter(pos => pos !== '');
    if (positions.length !== pilots.length) {
      toast({
        title: "Erro",
        description: "Preencha a colocação de todos os pilotos",
        variant: "destructive"
      });
      return;
    }

    // Verificar se não há posições duplicadas
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      toast({
        title: "Erro",
        description: "Não pode haver posições duplicadas",
        variant: "destructive"
      });
      return;
    }

    try {
      const results = pilots.map(pilot => ({
        pilotId: pilot.id,
        position: parseInt(raceResults[pilot.id])
      }));

      const raceData = {
        results,
        polePosition: polePosition || undefined,
        fastestLap: fastestLap || undefined
      };

      await updateRace(selectedRaceId, raceData);
      
      toast({
        title: "Sucesso",
        description: "Resultados salvos com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar resultados",
        variant: "destructive"
      });
    }
  };

  const handleAddPilot = async () => {
    if (!newPilotName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do piloto",
        variant: "destructive"
      });
      return;
    }

    try {
      // Adicionar à tabela ranking_geral via Supabase API
      const response = await fetch(`https://lrgexuudpodmvqyhpqzd.supabase.co/rest/v1/ranking_geral`, {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2V4dXVkcG9kbXZxeWhwcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTk5MjUsImV4cCI6MjA2ODQzNTkyNX0.GKKe-M12WQfSGWo96M0J1t7QXueGEy4AsmohYbBQUyg',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2V4dXVkcG9kbXZxeWhwcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTk5MjUsImV4cCI6MjA2ODQzNTkyNX0.GKKe-M12WQfSGWo96M0J1t7QXueGEy4AsmohYbBQUyg',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          piloto_nome: newPilotName.trim(),
          total_pontos: 0
        })
      });

      if (!response.ok) throw new Error('Erro ao adicionar piloto');

      setNewPilotName('');
      await loadData();
      toast({
        title: "Sucesso",
        description: "Piloto adicionado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar piloto",
        variant: "destructive"
      });
    }
  };

  const handleDeletePilot = async (pilotName) => {
    if (!confirm(`Tem certeza que deseja remover o piloto ${pilotName}? Todos os dados relacionados serão perdidos.`)) {
      return;
    }

    try {
      // Deletar do ranking_geral
      await fetch(`https://lrgexuudpodmvqyhpqzd.supabase.co/rest/v1/ranking_geral?piloto_nome=eq.${encodeURIComponent(pilotName)}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2V4dXVkcG9kbXZxeWhwcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTk5MjUsImV4cCI6MjA2ODQzNTkyNX0.GKKe-M12WQfSGWo96M0J1t7QXueGEy4AsmohYbBQUyg',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2V4dXVkcG9kbXZxeWhwcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTk5MjUsImV4cCI6MjA2ODQzNTkyNX0.GKKe-M12WQfSGWo96M0J1t7QXueGEy4AsmohYbBQUyg',
          'Content-Type': 'application/json'
        }
      });

      // Deletar dos resultados_corrida
      await fetch(`https://lrgexuudpodmvqyhpqzd.supabase.co/rest/v1/resultados_corrida?piloto_nome=eq.${encodeURIComponent(pilotName)}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2V4dXVkcG9kbXZxeWhwcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTk5MjUsImV4cCI6MjA2ODQzNTkyNX0.GKKe-M12WQfSGWo96M0J1t7QXueGEy4AsmohYbBQUyg',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2V4dXVkcG9kbXZxeWhwcXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTk5MjUsImV4cCI6MjA2ODQzNTkyNX0.GKKe-M12WQfSGWo96M0J1t7QXueGEy4AsmohYbBQUyg',
          'Content-Type': 'application/json'
        }
      });

      await loadData();
      toast({
        title: "Sucesso",
        description: "Piloto removido com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover piloto",
        variant: "destructive"
      });
    }
  };

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
                <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-blue-200">Gerencie corridas, resultados e pilotos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-medium">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 1. Adicionar Nova Corrida */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-400" />
              Adicionar Nova Corrida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Nome da Corrida *</label>
                <Input
                  value={newRace.nome}
                  onChange={(e) => setNewRace(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Corrida de Abertura"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Data *</label>
                <Input
                  type="date"
                  value={newRace.data}
                  onChange={(e) => setNewRace(prev => ({ ...prev, data: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Local *</label>
                <Input
                  value={newRace.local}
                  onChange={(e) => setNewRace(prev => ({ ...prev, local: e.target.value }))}
                  placeholder="Ex: Kartódromo Internacional"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateRace}
              disabled={loading || !newRace.nome || !newRace.data || !newRace.local}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Salvar Corrida
            </Button>
          </CardContent>
        </Card>

        {/* 2. Gerenciar Resultados da Corrida */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Gerenciar Resultados da Corrida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Selecionar Corrida</label>
              <Select value={selectedRaceId} onValueChange={setSelectedRaceId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Escolha uma corrida" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race.id} value={race.id}>
                      {new Date(race.date).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRaceId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pilots.map((pilot) => (
                    <div key={pilot.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: pilot.color }}
                        />
                        <span className="text-white font-medium">{pilot.name}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-white/70 text-xs mb-1">Colocação</label>
                          <Select 
                            value={raceResults[pilot.id]?.toString() || ''} 
                            onValueChange={(value) => setRaceResults(prev => ({ ...prev, [pilot.id]: parseInt(value) }))}
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white h-8">
                              <SelectValue placeholder="Posição" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: pilots.length }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}º lugar
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`pole-${pilot.id}`}
                            checked={polePosition === pilot.id}
                            onCheckedChange={(checked) => setPolePosition(checked ? pilot.id : '')}
                          />
                          <label htmlFor={`pole-${pilot.id}`} className="text-white/70 text-xs">
                            Pole Position
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`fastest-${pilot.id}`}
                            checked={fastestLap === pilot.id}
                            onCheckedChange={(checked) => setFastestLap(checked ? pilot.id : '')}
                          />
                          <label htmlFor={`fastest-${pilot.id}`} className="text-white/70 text-xs">
                            Melhor Volta
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleSaveResults}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Salvar Resultados
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* 3. Gerenciar Pilotos */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Gerenciar Pilotos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adicionar Novo Piloto */}
            <div className="flex gap-2">
              <Input
                value={newPilotName}
                onChange={(e) => setNewPilotName(e.target.value)}
                placeholder="Nome do novo piloto"
                className="bg-white/10 border-white/20 text-white"
              />
              <Button 
                onClick={handleAddPilot}
                disabled={loading || !newPilotName.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Lista de Pilotos */}
            <div className="space-y-2">
              {pilots.map((pilot) => (
                <div key={pilot.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: pilot.color }}
                    />
                    <span className="text-white font-medium">{pilot.name}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePilot(pilot.name)}
                    className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;