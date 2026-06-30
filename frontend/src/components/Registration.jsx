import React, { useState, useEffect } from 'react';
import { registerAthlete, fetchAthletes, fetchRoster } from '../api';
import { UserPlus, Search, LogIn, CheckCircle, Apple, Play, Users } from 'lucide-react';

export default function Registration({ 
  event, 
  categories, 
  userRole, 
  onOpenLoginModal, 
  onRefreshData 
}) {
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [country, setCountry] = useState('AZE');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [loading, setLoading] = useState(false);

  // Registered athletes list
  const [allAthletes, setAllAthletes] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Coach's roster
  const [roster, setRoster] = useState([]);
  const [selectedRosterId, setSelectedRosterId] = useState('');

  const isClosed = event?.registrationStatus === 'closed';

  useEffect(() => {
    loadAllRegisteredAthletes();
    if (userRole === 'coach') {
      loadCoachRoster();
    }
  }, [categories, userRole]);

  async function loadCoachRoster() {
    try {
      const data = await fetchRoster();
      setRoster(data);
    } catch (err) {
      console.error('Failed to load roster:', err);
    }
  }

  async function loadAllRegisteredAthletes() {
    setListLoading(true);
    try {
      const promises = categories.map(cat => fetchAthletes(cat.id));
      const results = await Promise.all(promises);
      setAllAthletes(results.flat());
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !club.trim() || !selectedCatId) {
      alert('Zəhmət olmasa bütün xanaları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await registerAthlete(selectedCatId, {
        name: name.trim().toUpperCase(),
        club: club.trim(),
        country: country.trim().toUpperCase(),
        rosterAthleteId: selectedRosterId || undefined
      });
      setName('');
      setClub('');
      setSelectedRosterId('');
      alert('İdmançı turnirə uğurla qeydiyyatdan keçdi!');
      loadAllRegisteredAthletes();
      onRefreshData();
    } catch (err) {
      alert('Xəta baş verdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Filtered Roster
  const filteredAthletes = allAthletes.filter(ath => {
    const q = searchQuery.toLowerCase();
    return (
      ath.name.toLowerCase().includes(q) || 
      ath.club.toLowerCase().includes(q) ||
      ath.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Event Header Bar (Screenshot 1 Style) */}
      <div className="bg-[#111827] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="space-y-2 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {event?.title}
          </h1>
          <p className="text-xs text-gray-400">
            Bir link üzərindən komanda üzvlərinizi yarışa qeydiyyatdan keçirin.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          {isClosed ? (
            <span className="px-3.5 py-1.5 bg-[#450a0a]/80 border border-[#7f1d1d] text-red-300 text-xs font-bold rounded-lg uppercase tracking-wider">
              Qeydiyyat bağlıdır
            </span>
          ) : (
            <span className="px-3.5 py-1.5 bg-[#064e3b]/80 border border-[#065f46] text-emerald-300 text-xs font-bold rounded-lg uppercase tracking-wider live-pulse">
              Qeydiyyat aktivdir
            </span>
          )}
        </div>
      </div>

      {/* CLOSED STATE VIEW (Screenshot 1) */}
      {isClosed && (
        <div className="space-y-6">
          {/* Main Warning alert (dark red banner) */}
          <div className="bg-[#450a0a]/50 border border-[#7f1d1d]/50 p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-red-300">
              Hal-hazırda qeydiyyat mümkün deyil. Qeydiyyat qapanmışdır.
            </p>
          </div>

          {/* New Registration / Auth Block */}
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center space-y-5 shadow-xs">
            <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wider">Yeni qeydiyyat</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Əməliyyatlar etmək və qeydiyyatdan keçmək üçün Badamlı Online platformasına daxil olmalısınız.
            </p>
            <button 
              onClick={onOpenLoginModal}
              className="px-8 py-3 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
            >
              Daxil ol
            </button>
          </div>
        </div>
      )}

      {/* OPEN STATE VIEW */}
      {!isClosed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Registration Form (Cols 1-2 if logged in, otherwise show login box) */}
          <div className="md:col-span-2 space-y-6">
            {userRole === 'public' ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center space-y-5 shadow-xs">
                <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wider">İştirakçı Qeydiyyatı</h2>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Yeni idmançı qeydiyyatdan keçirmək üçün zəhmət olmasa sistemə məşqçi və ya idarəçi hesabı ilə daxil olun.
                </p>
                <button 
                  onClick={onOpenLoginModal}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Giriş Et
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <UserPlus className="w-5 h-5 text-gray-500" />
                  <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Yeni Qeydiyyat Forması</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {userRole === 'coach' && roster.length > 0 && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <label className="block text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Siyahıdan (Roster) İdmançı Seçin
                      </label>
                      <select
                        value={selectedRosterId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedRosterId(id);
                          if (id) {
                            const ath = roster.find(r => r.id === id);
                            if (ath) {
                              setName(ath.name);
                              setClub(ath.club);
                              setCountry(ath.country || 'AZE');
                            }
                          } else {
                            setName('');
                            setClub('');
                          }
                        }}
                        className="w-full px-3.5 py-2.5 border border-blue-200 bg-white rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Yeni İdmançı Daxil Et --</option>
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold transition-colors hover:bg-gray-800"
                      >
                        İdarəçi Panelinə Keçid
                      </button>
                    ) : (
                      <p className="text-xs font-bold text-red-500">
                        Zəhmət olmasa turnir təşkilatçısı ilə əlaqə saxlayın.
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {userRole === 'coach' && roster.length > 0 && (
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> Siyahıdan (Roster) İdmançı Seçin
                        </label>
                        <select
                          value={selectedRosterId}
                          onChange={(e) => {
                            const id = e.target.value;
                            setSelectedRosterId(id);
                            if (id) {
                              const ath = roster.find(r => r.id === id);
                              if (ath) {
                                setName(ath.name);
                                setClub(ath.club);
                                setCountry(ath.country || 'AZE');
                              }
                            } else {
                              setName('');
                              setClub('');
                            }
                          }}
                          className="w-full px-3.5 py-2.5 border border-blue-200 bg-white rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Yeni İdmançı Daxil Et --</option>
                          {roster.map(r => (
                            <option key={r.id} value={r.id}>{r.name} - {r.club}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-blue-600 mt-1.5">
                          İdmançını siyahıdan seçdikdə ad və klub məlumatları avtomatik doldurulur.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">İdmançının Adı Soyadı</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Məs. FƏRİD MƏMMƏDOV"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-gray-900"
                          readOnly={!!selectedRosterId}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Klub / Cəmiyyət</label>
                        <input
                          type="text"
                          required
                          value={club}
                          onChange={(e) => setClub(e.target.value)}
                          placeholder="Məs. Qəbələ İK"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-gray-900"
                          readOnly={!!selectedRosterId}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ölkə</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="AZE"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-gray-900"
                          readOnly={!!selectedRosterId}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kateqoriya</label>
                        <select
                          required
                          value={selectedCatId}
                          onChange={(e) => setSelectedCatId(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 bg-white rounded-lg text-xs focus:outline-hidden cursor-pointer"
                        >
                          <option value="" disabled>Seçin</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:bg-gray-400"
                    >
                      {loading ? 'Qeydiyyatdan Keçirilir...' : 'Qeydiyyatı Tamamla'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Registered Roster View */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">İştirakçı Rosteri ({filteredAthletes.length})</h2>
                
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ad, klub və ya ölkə axtar..."
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {listLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredAthletes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Heç bir iştirakçı tapılmadı.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-100">
                        <th className="px-4 py-2">İdmançı</th>
                        <th className="px-4 py-2">Klub</th>
                        <th className="px-4 py-2">Kateqoriya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredAthletes.map(ath => {
                        const cat = categories.find(c => c.id === ath.categoryId);
                        return (
                          <tr key={ath.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-2">
                              <span className="font-bold text-gray-900">{ath.name}</span>
                              <span className="text-[9px] text-gray-400 font-normal ml-1 bg-gray-100 px-1 py-0.5 rounded">{ath.country}</span>
                            </td>
                            <td className="px-4 py-2">{ath.club}</td>
                            <td className="px-4 py-2 text-gray-500">{cat ? cat.name.split(',')[0] + ' ' + cat.name.split(',')[1] : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Quick info right side (Rules & App Downloads like Screenshot 1) */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Mobil Tətbiqlər</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">Badamlı Online tətbiqini yükləyərək püşkatma bildirişlərini və canlı xalları anlıq izləyə bilərsiniz.</p>
              
              <div className="space-y-2">
                <a 
                  href="https://smart-arena.org/apps/mobile/download.php?platform=ios&lang=az"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-2.5 border border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-lg text-[10px] font-bold text-gray-800 transition-all cursor-pointer"
                >
                  <Apple className="w-4 h-4 text-gray-900" />
                  <span>App Store</span>
                </a>
                <a 
                  href="https://smart-arena.org/apps/mobile/download.php?platform=android&lang=az"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-2.5 border border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-lg text-[10px] font-bold text-gray-800 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-gray-900 fill-gray-900" />
                  <span>Google Play</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Social Links & Platform description at the very bottom (Screenshot 1 match) */}
      <div className="border-t border-gray-100 pt-6 flex flex-col items-center gap-4 text-center">
        <div className="flex gap-4">
          {['facebook', 'instagram', 'twitter', 'tiktok'].map(sm => (
            <span key={sm} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 hover:border-gray-300 transition-all cursor-pointer bg-white">
              {sm[0]}
            </span>
          ))}
        </div>
        
        <p className="text-[9px] text-gray-400 font-semibold">
          &copy; 2026 Badamlı Online rəqəmsal idman tədbirləri platforması. Bütün hüquqlar qorunur.
        </p>
      </div>

    </div>
  );
}
