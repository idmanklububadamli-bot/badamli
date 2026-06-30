import React from 'react';
import { X, LogIn, LogOut, ChevronRight } from 'lucide-react';
import { t } from '../i18n';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  userRole, 
  user,
  onLogout, 
  onOpenLoginModal,
  selectedEventId,
  language,
  onGoToEvents
}) {
  const menuItems = [
    ...(selectedEventId ? [
      { id: 'all-events', label: '◀ ' + t('eventsTitle', language) }
    ] : []),
    { id: 'dashboard', label: selectedEventId ? t('dashboard', language) : t('eventsTitle', language) },
    ...(selectedEventId ? [
      { id: 'brackets', label: t('brackets', language) },
      { id: 'schedule', label: t('schedule', language) },
      { id: 'registration', label: t('registration', language) },
      { id: 'stats', label: t('stats', language) },
      ...(userRole === 'admin' ? [{ id: 'admin', label: t('admin', language) }] : [])
    ] : []),
    ...(userRole === 'coach' ? [{ id: 'roster', label: 'İdmançı Siyahım' }] : []),
    { id: 'solutions', label: 'Həllər', external: true },
    { id: 'payment', label: 'Ödəniş siyasəti', external: true },
    { id: 'platform', label: 'Platforma' },
    { id: 'about', label: 'Haqqımızda', external: true },
    { id: 'team', label: 'Badamlı Online komandası', external: true },
    { id: 'contact', label: 'Əlaqə', external: true },
    { id: 'privacy', label: 'Məxfilik', external: true },
    { id: 'terms', label: 'Qaydalar', external: true }
  ];

  function handleItemClick(itemId, isExternal) {
    if (isExternal) {
      alert(`"${itemId}" səhifəsi simulyasiya edilmişdir. Tam tətbiqdə xarici keçid olacaq.`);
      return;
    }
    if (itemId === 'all-events') {
      onGoToEvents();
      onClose();
      return;
    }
    setActiveTab(itemId);
    onClose();
  }

  function getRoleLabel(role) {
    if (role === 'admin') return 'İdarəçi (Admin)';
    if (role === 'coach') return 'Məşqçi (Coach)';
    if (user && user.id === 'guest') return 'Qonaq (İzləyici)';
    return 'İctimai İstifadəçi';
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/10 backdrop-blur-xs z-50 transition-opacity duration-300"
        ></div>
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] bg-white border-l border-gray-100 shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-gray-900 tracking-tight">Badamlı <span className="text-blue-500">Online</span></span>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest -mt-0.5">Menyu</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Info Bar inside Menu */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/20 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">İstifadəçi statusu</p>
              <p className="font-bold text-gray-800 mt-0.5">{getRoleLabel(userRole)}</p>
            </div>
            {(!user || user.id === 'guest') ? (
              <div className="flex gap-1.5">
                {user?.id === 'guest' && (
                  <button 
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Çıxış
                  </button>
                )}
                <button 
                  onClick={() => {
                    onClose();
                    onOpenLoginModal();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> Daxil ol
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Çıxış
              </button>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map(item => {
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id, item.external)}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between text-xs font-bold transition-all border-b border-gray-50/30 cursor-pointer ${
                  isTabActive 
                    ? 'bg-blue-50/50 text-blue-600 border-l-4 border-l-blue-500' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-gray-300 ${isTabActive ? 'text-blue-500' : ''}`} />
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-50 text-[10px] text-gray-400 font-semibold text-center bg-gray-50/20">
          &copy; 2026 Badamlı Online. Bütün hüquqlar qorunur.
        </div>
      </div>
    </>
  );
}
