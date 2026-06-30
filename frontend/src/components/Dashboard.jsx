import React from 'react';
import { Calendar, MapPin, Award, Users, ShieldAlert, ChevronRight, UserPlus, List, GitMerge, Radio, Clock, BarChart2, Trophy, LayoutGrid } from 'lucide-react';

export default function Dashboard({ event, categories, stats, setActiveTab, setSelectedCategoryId }) {
  if (!event) return null;

  const sections = [
    { id: 'registration', title: 'Qeydiyyat', desc: 'Qeydiyyat aktivdirsə bu bölmədən daxil ola bilərsiniz.', icon: UserPlus, action: () => setActiveTab('registration') },
    { id: 'categories', title: 'Kateqoriyalar', desc: 'Tədbirin kateqoriyalar siyahısına baxın.', icon: List, action: () => { document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' }); } },
    { id: 'brackets', title: 'Püşkatmalar', desc: 'Püşkatmalar bölməsinə baxın.', icon: GitMerge, action: () => setActiveTab('brackets') },
    { id: 'live', title: 'Canlı yayım', desc: 'Tədbirin canlı yayım bölməsinə baxın.', icon: Radio, action: () => alert("Canlı yayım sistemi tezliklə aktiv olacaq.") },
    { id: 'schedule', title: 'Yarış cədvəli', desc: 'Rəsmi yarış cədvəlinə baxın.', icon: Clock, action: () => setActiveTab('schedule') },
    { id: 'stats', title: 'İştirakçı statistikası', desc: 'Klublar və ölkələr.', icon: BarChart2, action: () => setActiveTab('stats') },
    { id: 'results', title: 'Nəticələr', desc: 'Yarış nəticələri moduluna keçid.', icon: Trophy, action: () => setActiveTab('brackets') }
  ];

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

      {/* Sections / Bölmələr */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid className="w-5 h-5 text-gray-800" />
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Bölmələr</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sections.map(section => (
            <div 
              key={section.id}
              onClick={section.action}
              className="group p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm transition-all cursor-pointer flex gap-4 bg-gray-50/30"
            >
              <div className="mt-0.5">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 text-gray-500 group-hover:border-blue-200 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center transition-colors shadow-xs">
                  <section.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[13px] group-hover:text-blue-700 transition-colors">{section.title}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{section.desc}</p>
              </div>
            </div>
          ))}
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
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Məkan Məlumatı</h2>
            <div className="aspect-video bg-gray-50 border border-gray-100 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-4">
              <MapPin className="w-10 h-10 text-red-500 animate-bounce" />
              <div>
                <p className="font-bold text-gray-900">{event.location}</p>
                <p className="text-xs text-gray-500 mt-1">Azərbaycan</p>
              </div>
              {event.locationUrl && (
                <a 
                  href={event.locationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  Xəritədə Bax (Google Maps)
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Categories list */}
        <div id="categories-section" className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Yarış Kateqoriyaları</h2>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {categories.length > 0 ? categories.map(cat => (
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
            )) : (
              <div className="text-center p-4 text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg">
                Hələ heç bir kateqoriya əlavə edilməyib.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

