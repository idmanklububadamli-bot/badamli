import React, { useState, useEffect } from 'react';
import { fetchStats } from '../api';
import { Shield, Globe } from 'lucide-react';

export default function Stats({ eventId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventId) {
      loadStats();
    }
  }, [eventId]);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStats(eventId);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 text-center">
        Xəta: {error}
      </div>
    );
  }

  if (!stats) return null;

  const renderStandings = (list, type) => {
    if (!list || list.length === 0) {
      return <p className="text-xs text-gray-400 text-center py-4">Məlumat yoxdur</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">{type === 'club' ? 'Klub' : 'Ölkə'}</th>
              <th className="px-4 py-3 text-center">
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block mr-1"></span>Qızıl
              </th>
              <th className="px-4 py-3 text-center">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block mr-1"></span>Gümüş
              </th>
              <th className="px-4 py-3 text-center">
                <span className="w-3 h-3 rounded-full bg-amber-600 inline-block mr-1"></span>Bürünc
              </th>
              <th className="px-4 py-3 text-center border-l border-gray-100">İdmançı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {list.map((item, idx) => (
              <tr key={item.name} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{item.gold}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{item.silver}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{item.bronze}</td>
                <td className="px-4 py-3 text-center font-mono text-gray-400 border-l border-gray-100">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Clubs Rankings */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Shield className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Klub Sıralaması (Medal)</h2>
        </div>
        {renderStandings(stats.clubs, 'club')}
      </div>

      {/* Countries Rankings */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Ölkə Sıralaması (Medal)</h2>
        </div>
        {renderStandings(stats.countries, 'country')}
      </div>

    </div>
  );
}
