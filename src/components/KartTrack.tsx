
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface Ranking {
  id: string;
  name: string;
  color: string;
  totalPoints: number;
}

interface KartTrackProps {
  rankings: Ranking[];
}

const KartTrack: React.FC<KartTrackProps> = ({ rankings }) => {
  const maxPoints = Math.max(...rankings.map(r => r.totalPoints), 1);
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-white/70 font-bold">{position}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {rankings.map((pilot, index) => {
        const position = index + 1;
        const progressPercentage = maxPoints > 0 ? (pilot.totalPoints / maxPoints) * 100 : 0;
        
        return (
          <div 
            key={pilot.id}
            className="relative bg-black/20 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            {/* Position and Pilot Info */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                {getPositionIcon(position)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{pilot.name}</h3>
                <p className="text-white/70 text-sm">
                  {pilot.totalPoints} ponto{pilot.totalPoints !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {pilot.totalPoints}
                </div>
                <div className="text-white/50 text-xs">pts</div>
              </div>
            </div>

            {/* Track */}
            <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
              {/* Track lines */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                <div className="w-full h-0.5 bg-white/20"></div>
                <div className="absolute left-1/4 w-px h-6 bg-white/10"></div>
                <div className="absolute left-1/2 w-px h-6 bg-white/10"></div>
                <div className="absolute left-3/4 w-px h-6 bg-white/10"></div>
              </div>

              {/* Kart */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                style={{ 
                  left: `${Math.min(progressPercentage, 95)}%`,
                  transform: `translateX(-50%) translateY(-50%)`
                }}
              >
                <div 
                  className="w-8 h-6 rounded-lg shadow-lg border-2 border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: pilot.color }}
                >
                  <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                </div>
              </div>

              {/* Finish line */}
              <div className="absolute right-2 top-0 bottom-0 w-1 bg-gradient-to-b from-white via-black to-white opacity-30"></div>
            </div>

            {/* Progress bar background effect */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-out rounded-b-lg"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default KartTrack;
