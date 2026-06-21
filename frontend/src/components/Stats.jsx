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

  const maxClubCount = stats.clubs?.[0]?.count || 1;
  const maxCountryCount = stats.countries?.[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Clubs Rankings */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Shield className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Klub Sıralaması</h2>
        </div>
        
        {stats.clubs?.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Məlumat yoxdur</p>
        ) : (
          <div className="space-y-4">
            {stats.clubs?.map((club, idx) => (
              <div key={club.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{idx + 1}. {club.name}</span>
                  <span className="font-mono text-gray-900">{club.count} İdmançı</span>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gray-800 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(club.count / maxClubCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Countries Rankings */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Ölkə Sıralaması</h2>
        </div>
        
        {stats.countries?.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Məlumat yoxdur</p>
        ) : (
          <div className="space-y-4">
            {stats.countries?.map((country, idx) => (
              <div key={country.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{idx + 1}. {country.name}</span>
                  <span className="font-mono text-gray-900">{country.count} İdmançı</span>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(country.count / maxCountryCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
