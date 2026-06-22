import React, { useState } from 'react';
import { Calendar, MapPin, Search, Trophy, Activity } from 'lucide-react';
import { t } from '../i18n';

export default function EventsList({ events, onSelectEvent, language }) {
  const [filter, setFilter] = useState('active'); // 'active', 'archived', 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search and filter
  const filteredEvents = events.filter(evt => {
    // Filter check
    if (filter === 'active' && evt.status !== 'active') return false;
    if (filter === 'archived' && evt.status !== 'archived') return false;

    // Search check
    const query = searchQuery.toLowerCase();
    return (
      evt.title.toLowerCase().includes(query) ||
      evt.location.toLowerCase().includes(query) ||
      (evt.description && evt.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Hero Section - Competitor Inspired Premium Dark Card */}
      <div className="bg-[#111827] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-800 relative overflow-hidden">
        
        {/* Slogan tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800/80 border border-gray-700/50 rounded-full text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-4">
          <Activity className="w-3 h-3 text-blue-500 live-pulse" />
          <span>{t('subtitle', language)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              {t('brand', language)}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
              {t('eventsDesc', language)}
            </p>
          </div>
          
          {/* Decorative Mascot/Emblem Area */}
          <div className="flex justify-end hidden md:flex">
            <div className="w-32 h-32 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center relative group overflow-hidden">
              <Trophy className="w-16 h-16 text-blue-500/70 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Filter and stats controls inside the dark hero card */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Active / Archive tabs */}
          <div className="flex gap-2">
            {[
              { id: 'active', label: t('filterActive', language) },
              { id: 'archived', label: t('filterArchived', language) },
              { id: 'all', label: t('filterAll', language) }
            ].map(tab => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 border border-blue-500 text-white shadow-sm'
                      : 'bg-gray-800 hover:bg-gray-700/80 border border-gray-700/60 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Stats on the right */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 flex flex-col items-center min-w-16">
              <span>{t('totalEvents', language)}</span>
              <span className="text-white text-xs font-black mt-0.5">{filteredEvents.length}</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 flex flex-col items-center min-w-16">
              <span>{t('page', language)}</span>
              <span className="text-white text-xs font-black mt-0.5">1/1</span>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 flex flex-col items-center min-w-20">
              <span>{t('status', language)}</span>
              <span className="text-emerald-400 text-xs font-black mt-0.5 uppercase">{filter === 'active' ? t('statusActive', language) : filter === 'archived' ? t('statusArchived', language) : t('filterAll', language)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Search Input bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchEvent', language)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        
        <button
          onClick={() => setSearchQuery('')}
          className="px-4 py-2 border border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-950 transition-all cursor-pointer shrink-0"
        >
          {t('btnShowAll', language)}
        </button>
      </div>

      {/* Event Cards Grid */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400 text-xs space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-gray-300" />
            <p>Heç bir turnir tapılmadı.</p>
          </div>
        ) : (
          filteredEvents.map(evt => {
            const isActive = evt.status === 'active';
            return (
              <div 
                key={evt.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-center md:justify-between gap-6 group border-l-4 border-l-gray-300 hover:border-l-blue-600"
              >
                
                {/* Left Side Info */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  
                  {/* Decorative Thumbnail Card */}
                  <div className="w-16 h-16 shrink-0 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                    <Trophy className={`w-8 h-8 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md tracking-wider ${
                        isActive 
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' 
                          : 'bg-gray-50 border border-gray-200 text-gray-400'
                      }`}>
                        {isActive ? t('statusActive', language) : t('statusArchived', language)}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        ID: {evt.id}
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {evt.title}
                    </h2>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] font-semibold text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {evt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {evt.location}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Right Side Action Button */}
                <div className="shrink-0 w-full md:w-auto">
                  <button 
                    onClick={() => onSelectEvent(evt.id)}
                    className="w-full md:w-auto px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    {t('viewTournament', language)}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
