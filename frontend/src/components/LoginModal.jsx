import React, { useState } from 'react';
import { X, Shield, Users, Globe, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '../api';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [role, setRole] = useState('coach');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const data = await loginUser(username, password);
        onLogin(data.token, data.user);
        onClose();
      } else {
        await registerUser({ username, password, role, clubName });
        // Auto-login after registration
        const data = await loginUser(username, password);
        onLogin(data.token, data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGuestLogin() {
    onLogin('guest-token', { id: 'guest', username: 'Qonaq', role: 'public' });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex space-x-4">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer ${tab === 'login' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Giriş
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer ${tab === 'register' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Qeydiyyat
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">İstifadəçi adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="İstifadəçi adı"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Şifrə</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrə"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {tab === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rol Seçin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('coach')}
                    className={`p-2 border rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'coach' ? 'border-blue-500 bg-blue-50/20 text-blue-700' : 'border-gray-100 text-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Məşqçi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2 border rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'admin' ? 'border-blue-500 bg-blue-50/20 text-blue-700' : 'border-gray-100 text-gray-700'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-bold">İdarəçi</span>
                  </button>
                </div>
              </div>

              {role === 'coach' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Klubun Adı</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Məsələn: Qara Kaplanlar"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Gözləyin...' : tab === 'login' ? <><LogIn className="w-4 h-4" /> Giriş</> : <><UserPlus className="w-4 h-4" /> Qeydiyyat</>}
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="shrink-0 px-3 text-[10px] text-gray-400">və ya</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Qonaq kimi davam et
          </button>
        </form>

      </div>
    </div>
  );
}
