import React, { useState, useEffect } from 'react';
import { fetchDraws } from '../api';
import { Play, CheckCircle, Clock } from 'lucide-react';

export default function Schedule({ categories, selectedCategoryId, setSelectedCategoryId, onSelectMatch, setActiveTab }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAllMatches();
  }, [selectedCategoryId, categories]);

  async function loadAllMatches() {
    setLoading(true);
    setError(null);
    try {
      let allMatches = [];
      
      if (selectedCategoryId) {
        allMatches = await fetchDraws(selectedCategoryId);
      } else {
        // Load draws for all categories
        const promises = categories.map(cat => fetchDraws(cat.id));
        const results = await Promise.all(promises);
        allMatches = results.flat();
      }

      // Sort by status (live first, then scheduled, then completed)
      const statusOrder = { 'live': 0, 'scheduled': 1, 'completed': 2 };
      allMatches.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return b.roundIndex - a.roundIndex; // then by round
      });

      setMatches(allMatches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredMatches = matches.filter(match => {
    if (statusFilter === 'all') return true;
    return match.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Kateqoriya üzrə filtrlə</label>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full sm:w-60 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="">Bütün kateqoriyalar</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status üzrə filtrlə</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="all">Bütün statuslar</option>
              <option value="scheduled">Gözləyən</option>
              <option value="live">Canlı</option>
              <option value="completed">Bitmiş</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadAllMatches}
          className="self-end md:self-auto px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-all cursor-pointer"
        >
          Siyahını Yenilə
        </button>
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

      {!loading && !error && filteredMatches.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          Uğun gələn matç tapılmadı.
        </div>
      )}

      {!loading && !error && filteredMatches.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Kateqoriya / Raund</th>
                  <th className="px-6 py-4">Aka (Qırmızı)</th>
                  <th className="px-6 py-4 text-center">Hesab</th>
                  <th className="px-6 py-4 text-right">Ao (Mavi)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {filteredMatches.map(match => {
                  const cat = categories.find(c => c.id === match.categoryId);
                  const isPlayable = match.athleteAkaId !== 'BYE' && match.athleteAoId !== 'BYE' && match.status !== 'completed';
                  
                  return (
                    <tr key={match.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 block">{cat?.name || 'Məlum deyil'}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 block">{match.roundName}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                          <div className="font-medium text-gray-900">
                            {match.athleteAka?.name || 'BYE'}
                            {match.athleteAka?.club && match.athleteAka.name !== 'BYE' && (
                              <span className="text-[10px] text-gray-400 font-normal block">{match.athleteAka.club}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center font-bold font-mono text-sm text-gray-900">
                        {match.athleteAkaId === 'BYE' || match.athleteAoId === 'BYE' ? '-' : `${match.scoreAka} - ${match.scoreAo}`}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="font-medium text-gray-900 text-right">
                            {match.athleteAo?.name || 'BYE'}
                            {match.athleteAo?.club && match.athleteAo.name !== 'BYE' && (
                              <span className="text-[10px] text-gray-400 font-normal block">{match.athleteAo.club}</span>
                            )}
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {match.status === 'live' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-500 border border-red-100 uppercase tracking-widest live-pulse">
                            Canlı
                          </span>
                        )}
                        {match.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                            <Clock className="w-3 h-3 text-gray-400" /> Gözləyir
                          </span>
                        )}
                        {match.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-50 text-green-600 border border-green-100">
                            <CheckCircle className="w-3 h-3 text-green-500" /> Bitib
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isPlayable ? (
                          <button
                            onClick={() => {
                              onSelectMatch(match.id);
                              setActiveTab('scoreboard');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" /> Lövhə
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
