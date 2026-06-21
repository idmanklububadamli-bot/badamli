import React from 'react';
import { Calendar, MapPin, Award, Users, ShieldAlert, ChevronRight } from 'lucide-react';

export default function Dashboard({ event, categories, stats, setActiveTab, setSelectedCategoryId }) {
  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-100">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 live-pulse"></span>
            Canlı / Aktiv
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <a 
                href={event.locationUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                {event.location}
              </a>
            </div>
          </div>
        </div>
        <div>
          <button 
            onClick={() => setActiveTab('brackets')}
            className="w-full md:w-auto px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Püşkatmaları İzlə
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kateqoriyalar</span>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">İştirakçılar</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalAthletes || 0}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Klublar</span>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.clubs?.length || 0}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tatami Sayı</span>
            <ShieldAlert className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">2 Aktiv</p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Description & Location Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Tədbir Haqqında</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Məkan Məlumatı</h2>
            <div className="aspect-video bg-gray-50 border border-gray-100 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-4">
              <MapPin className="w-10 h-10 text-red-500 animate-bounce" />
              <div>
                <p className="font-bold text-gray-900">{event.location}</p>
                <p className="text-xs text-gray-500 mt-1">İsmayıllı rayonu, Azərbaycan</p>
              </div>
              <a 
                href={event.locationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                Xəritədə Bax (Google Maps)
              </a>
            </div>
          </div>
        </div>

        {/* Right column - Categories list */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Yarış Kateqoriyaları</h2>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setActiveTab('brackets');
                }}
                className="flex items-center justify-between p-3 border border-gray-50 hover:border-gray-200 hover:bg-gray-50 rounded-lg transition-all cursor-pointer group"
              >
                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
