import React, { useState, useEffect } from 'react';
import { fetchDraws } from '../api';
import { Award, Zap } from 'lucide-react';

export default function Brackets({ categories, selectedCategoryId, setSelectedCategoryId, onSelectMatch, setActiveTab }) {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCategoryId) {
      loadDraws();
    }
  }, [selectedCategoryId]);

  async function loadDraws() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDraws(selectedCategoryId);
      
      // Sort matches by roundIndex descending (e.g. 2, 1, 0) and then by matchIndex
      // This ensures columns flow from first round to final
      const sorted = [...data].sort((a, b) => {
        if (b.roundIndex !== a.roundIndex) {
          return b.roundIndex - a.roundIndex;
        }
        return a.matchIndex - b.matchIndex;
      });
      
      setDraws(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Group draws by round name / roundIndex
  const roundsMap = {};
  draws.forEach(match => {
    if (!roundsMap[match.roundIndex]) {
      roundsMap[match.roundIndex] = {
        name: match.roundName,
        matches: []
      };
    }
    roundsMap[match.roundIndex].matches.push(match);
  });

  // Convert map to sorted array of rounds (from highest roundIndex to 0 - Final)
  const rounds = Object.keys(roundsMap)
    .map(key => ({ roundIndex: parseInt(key), ...roundsMap[key] }))
    .sort((a, b) => b.roundIndex - a.roundIndex);

  function getAthleteDisplayName(athlete) {
    if (!athlete) return 'Gözlənilir...';
    if (athlete.name === 'BYE') return 'BYE (Püşk üstünlüyü)';
    return athlete.name;
  }

  function getAthleteClub(athlete) {
    if (!athlete || athlete.name === 'BYE') return '';
    return athlete.club;
  }

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Kateqoriya Seçin</label>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium focus:outline-hidden focus:ring-1 focus:ring-gray-900 cursor-pointer"
          >
            <option value="" disabled>-- Seçin --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        {selectedCategoryId && (
          <button 
            onClick={loadDraws}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-all cursor-pointer"
          >
            Yenilə
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 text-center">
          Xəta baş verdi: {error}
        </div>
      )}

      {!loading && !error && selectedCategoryId && draws.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          Bu kateqoriya üçün hələ püşkatma yaradılmayıb. İdarəçi Panelindən yarada bilərsiniz.
        </div>
      )}

      {!loading && !error && selectedCategoryId && draws.length > 0 && (
        <div className="w-full overflow-x-auto pb-6">
          <div className="flex gap-12 min-w-max p-4 items-center">
            {rounds.map((round, rIndex) => (
              <div key={round.roundIndex} className="flex flex-col gap-6" style={{ width: '280px' }}>
                {/* Round Header */}
                <div className="text-center pb-2 border-b border-gray-100 mb-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">{round.name}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">{round.matches.length} Matç</span>
                </div>

                {/* Round Matches List */}
                <div className="flex flex-col justify-around h-full gap-8">
                  {round.matches.map(match => {
                    const hasAthletes = match.athleteAkaId && match.athleteAoId && match.athleteAkaId !== 'BYE' && match.athleteAoId !== 'BYE';
                    const isPlayable = hasAthletes && match.status !== 'completed';
                    const isWinnerAka = match.status === 'completed' && match.winnerId === match.athleteAkaId;
                    const isWinnerAo = match.status === 'completed' && match.winnerId === match.athleteAoId;

                    return (
                      <div
                        key={match.id}
                        className={`bg-white border rounded-xl shadow-xs transition-all relative overflow-hidden group ${
                          isPlayable ? 'hover:border-gray-300 hover:shadow-xs cursor-pointer' : 'border-gray-100'
                        }`}
                        onClick={() => {
                          if (isPlayable) {
                            onSelectMatch(match.id);
                            setActiveTab('scoreboard');
                          }
                        }}
                      >
                        {/* Red Athlete (Aka) */}
                        <div className={`p-3 flex items-center justify-between border-b border-gray-50 relative ${
                          isWinnerAka ? 'bg-red-50/20' : ''
                        }`}>
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                            <div className="truncate">
                              <p className={`text-xs font-bold ${
                                isWinnerAka ? 'text-gray-900' : match.winnerId ? 'text-gray-400 font-normal' : 'text-gray-700'
                              }`}>
                                {getAthleteDisplayName(match.athleteAka)}
                              </p>
                              {getAthleteClub(match.athleteAka) && (
                                <p className="text-[10px] text-gray-400 truncate">{getAthleteClub(match.athleteAka)}</p>
                              )}
                            </div>
                          </div>
                          {match.athleteAkaId !== 'BYE' && (
                            <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                              isWinnerAka ? 'text-red-600 bg-red-50' : 'text-gray-400'
                            }`}>
                              {match.scoreAka}
                            </span>
                          )}
                        </div>

                        {/* Blue Athlete (Ao) */}
                        <div className={`p-3 flex items-center justify-between relative ${
                          isWinnerAo ? 'bg-blue-50/20' : ''
                        }`}>
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                            <div className="truncate">
                              <p className={`text-xs font-bold ${
                                isWinnerAo ? 'text-gray-900' : match.winnerId ? 'text-gray-400 font-normal' : 'text-gray-700'
                              }`}>
                                {getAthleteDisplayName(match.athleteAo)}
                              </p>
                              {getAthleteClub(match.athleteAo) && (
                                <p className="text-[10px] text-gray-400 truncate">{getAthleteClub(match.athleteAo)}</p>
                              )}
                            </div>
                          </div>
                          {match.athleteAoId !== 'BYE' && (
                            <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                              isWinnerAo ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                            }`}>
                              {match.scoreAo}
                            </span>
                          )}
                        </div>

                        {/* Status overlays */}
                        {isPlayable && (
                          <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-800 flex items-center gap-1 shadow-xs">
                              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Canlı Lövhəyə Keç
                            </span>
                          </div>
                        )}

                        {match.status === 'live' && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase live-pulse border border-white">
                            CANLI
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
