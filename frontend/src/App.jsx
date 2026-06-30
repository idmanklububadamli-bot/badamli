import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { fetchEvents, fetchEventDetails, fetchCategories, fetchStats } from './api';
import EventsList from './components/EventsList';
import Dashboard from './components/Dashboard';
import Brackets from './components/Brackets';
import Schedule from './components/Schedule';
import LiveScoreboard from './components/LiveScoreboard';
import Stats from './components/Stats';
import Admin from './components/Admin';
import Registration from './components/Registration';
import Sidebar from './components/Sidebar';
import Platform from './components/Platform';
import LoginModal from './components/LoginModal';
import SpectatorBoard from './components/SpectatorBoard';
import Roster from './components/Roster';
import { Shield, Menu, Globe, Users } from 'lucide-react';
import { t } from './i18n';

export default function App() {
  // Event & DB states
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  // Navigation & Drawer states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // i18n states
  const [language, setLanguage] = useState('az');

  // Mock Authentication states -> Replaced with AuthContext
  const { user, login, logout } = useContext(AuthContext);
  const userRole = user ? user.role : 'public';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse URL on mount for standalone OBS view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const matchIdParam = params.get('matchId');
    const langParam = params.get('lang');
    
    if (langParam) {
      setLanguage(langParam);
    }
    if (tabParam === 'spectator' && matchIdParam) {
      setActiveTab('spectator');
      setSelectedMatchId(matchIdParam);
    }
    
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setError(null);
    try {
      const allEvents = await fetchEvents();
      setEvents(allEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedEventId) {
      loadEventData(selectedEventId);
    } else {
      setEvent(null);
      setCategories([]);
      setStats(null);
    }
  }, [selectedEventId]);

  async function loadEventData(id) {
    setLoading(true);
    setError(null);
    try {
      const eventDetails = await fetchEventDetails(id);
      setEvent(eventDetails);
      
      const cats = await fetchCategories(id);
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id);
      }

      const statistics = await fetchStats(id);
      setStats(statistics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshEventData() {
    if (!selectedEventId) return;
    try {
      const eventDetails = await fetchEventDetails(selectedEventId);
      setEvent(eventDetails);
    } catch (err) {
      console.error("Failed to refresh event details:", err);
    }
  }

  async function refreshStatsAndData() {
    if (!selectedEventId) return;
    try {
      const statistics = await fetchStats(selectedEventId);
      setStats(statistics);
    } catch (err) {
      console.error("Failed to refresh statistics:", err);
    }
  }

  function handleLogin(token, userData) {
    if (token && userData) {
      login(token, userData);
      if (userData.role === 'admin') {
        setActiveTab('admin');
      } else if (userData.role === 'coach') {
        setActiveTab('registration');
      } else {
        setActiveTab('dashboard');
      }
    } else {
      logout();
      setActiveTab('dashboard');
    }
  }

  function handleLogout() {
    logout();
    setActiveTab('dashboard');
  }

  function handleSelectMatch(matchId) {
    if (userRole !== 'admin') {
      alert(t('roleAdmin', language) + " tələb olunur. Zəhmət olmasa yan menyudan İdarəçi olaraq Giriş edin.");
      setLoginModalOpen(true);
      return;
    }
    setSelectedMatchId(matchId);
    setActiveTab('scoreboard');
  }

  // Bypass normal layout for standalone spectator overlay screen
  if (activeTab === 'spectator' && selectedMatchId) {
    return (
      <SpectatorBoard 
        matchId={selectedMatchId} 
        language={language} 
        onBack={() => {
          // If they closed full screen, go back to dashboard
          setActiveTab('dashboard');
          setSelectedMatchId(null);
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Badamlı Online...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-6 text-center">
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm max-w-md space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <span className="font-bold text-lg">!</span>
          </div>
          <h1 className="text-lg font-extrabold text-gray-900">Connection error</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa backend serverinin (port 5000) işlək olmasını təmin edin.
          </p>
          <code className="block p-3 bg-gray-50 rounded-lg text-left text-[10px] text-red-600 border border-gray-100 break-all">
            {error}
          </code>
          <button 
            onClick={loadInitialData}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => {
              setSelectedEventId(null);
              setActiveTab('dashboard');
              setSelectedMatchId(null);
            }} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center transition-all group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-900">Badamlı <span className="text-blue-500">Online</span></span>
              <span className="text-[8px] font-bold text-gray-400 block -mt-1 tracking-wider uppercase">
                {t('subtitle', language)}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links & User Info */}
          <div className="flex items-center gap-4">
            
            {/* Desktop menu links (hidden on mobile, shown on lg+) */}
            <nav className="hidden lg:flex items-center gap-1">
              {selectedEventId ? (
                <>
                  {[
                    { id: 'dashboard', label: t('dashboard', language) },
                    { id: 'brackets', label: t('brackets', language) },
                    { id: 'schedule', label: t('schedule', language) },
                    { id: 'registration', label: t('registration', language) },
                    { id: 'stats', label: t('stats', language) }
                  ].map(tab => {
                    const isActive = activeTab === tab.id || (tab.id === 'brackets' && activeTab === 'scoreboard');
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSelectedMatchId(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 shadow-xs' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                  
                  {/* Admin direct link only if Admin */}
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer ${
                        activeTab === 'admin' ? 'bg-red-100/70 shadow-xs' : ''
                      }`}
                    >
                      {t('admin', language)}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSelectedMatchId(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-blue-50 text-blue-600 shadow-xs`}
                >
                  {t('eventsTitle', language)}
                </button>
              )}
            </nav>

            {/* Language Selection & Menu Triggers */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-gray-900">{user.username}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{userRole === 'admin' ? 'İdarəçi' : userRole === 'public' ? 'Qonaq' : user.clubName}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Çıxış
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Daxil ol
                </button>
              )}
              
              {/* i18n Dropdown (Screenshot 2 Match) */}
              <div className="relative group">
                <button className="border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white flex items-center gap-1 cursor-pointer hover:bg-gray-50">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>{language.toUpperCase()}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 w-20 hidden group-hover:block z-50">
                  {['az', 'en', 'tr', 'ru'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full text-center px-2 py-1.5 text-[10px] font-bold uppercase hover:bg-gray-50 block cursor-pointer ${
                        language === lang ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hamburger Button (Screenshot 2 Match) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 border border-gray-200 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-gray-950 hover:bg-gray-50 transition-all cursor-pointer"
                title="Menyu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'platform' ? (
          <Platform language={language} />
        ) : activeTab === 'roster' ? (
          <Roster userRole={userRole} />
        ) : selectedEventId === null ? (
          <EventsList 
            events={events}
            onSelectEvent={setSelectedEventId}
            language={language}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                event={event} 
                categories={categories} 
                stats={stats} 
                setActiveTab={setActiveTab}
                setSelectedCategoryId={setSelectedCategoryId}
                language={language}
              />
            )}
            {activeTab === 'brackets' && (
              <Brackets 
                categories={categories} 
                selectedCategoryId={selectedCategoryId} 
                setSelectedCategoryId={setSelectedCategoryId}
                onSelectMatch={handleSelectMatch}
                setActiveTab={setActiveTab}
                language={language}
                userRole={userRole}
                selectedEventId={selectedEventId}
              />
            )}
            {activeTab === 'schedule' && (
              <Schedule 
                categories={categories} 
                selectedCategoryId={selectedCategoryId} 
                setSelectedCategoryId={setSelectedCategoryId}
                onSelectMatch={handleSelectMatch}
                setActiveTab={setActiveTab}
                language={language}
              />
            )}
            {activeTab === 'registration' && (
              <Registration 
                event={event}
                categories={categories}
                userRole={userRole}
                onOpenLoginModal={() => setLoginModalOpen(true)}
                onRefreshData={refreshStatsAndData}
                language={language}
              />
            )}
            {activeTab === 'scoreboard' && (
              <LiveScoreboard 
                matchId={selectedMatchId} 
                categories={categories}
                language={language}
                onBack={() => {
                  setActiveTab('brackets');
                  setSelectedMatchId(null);
                }} 
              />
            )}
            {activeTab === 'stats' && (
              <Stats eventId={selectedEventId} language={language} />
            )}
            {activeTab === 'admin' && (
              <Admin 
                event={event}
                categories={categories} 
                selectedCategoryId={selectedCategoryId} 
                setSelectedCategoryId={setSelectedCategoryId}
                eventId={selectedEventId}
                onRefreshData={refreshStatsAndData}
                onRefreshEvent={refreshEventData}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
          <span>&copy; 2026 Badamlı Online. {t('rightsReserved', language)}</span>
          <span className="flex items-center gap-1">
            {t('designStyle', language)} • {t('sportStyle', language)}
          </span>
        </div>
      </footer>

      {/* Sidebar Navigation Drawer (Screenshot 2 Match) */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        user={user}
        onLogout={handleLogout}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        selectedEventId={selectedEventId}
        language={language}
        onGoToEvents={() => {
          setSelectedEventId(null);
          setActiveTab('dashboard');
          setSelectedMatchId(null);
        }}
      />

      {/* Login Authentication Modal */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />

    </div>
  );
}
