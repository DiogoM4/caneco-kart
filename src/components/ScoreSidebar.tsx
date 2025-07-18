
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseKartStore } from '@/store/supabaseKartStore';

const ScoreSidebar = () => {
  const { pilots, calculateTotalPoints } = useSupabaseKartStore();

  const pilotsWithPoints = pilots.map(pilot => ({
    ...pilot,
    totalPoints: calculateTotalPoints(pilot.id)
  })).sort((a, b) => b.totalPoints - a.totalPoints);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-300" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-white/50 font-bold text-sm">{position}</span>;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 sticky top-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Classificação Atual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pilotsWithPoints.map((pilot, index) => {
          const position = index + 1;
          
          return (
            <div 
              key={pilot.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                position <= 3 
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {getPositionIcon(position)}
              </div>
              
              <div 
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: pilot.color }}
              ></div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {pilot.name}
                </p>
                <p className="text-white/50 text-xs">
                  {pilot.totalPoints} pts
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-white font-bold">
                  {pilot.totalPoints}
                </div>
              </div>
            </div>
          );
        })}
        
        {pilotsWithPoints.length === 0 && (
          <div className="text-center py-6">
            <Trophy className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <p className="text-white/50 text-sm">
              Nenhum ponto registrado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreSidebar;
