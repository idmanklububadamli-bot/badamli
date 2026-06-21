import React, { useState } from 'react';
import { X, Shield, Users, Globe } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [selectedRole, setSelectedRole] = useState('coach');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    // Simulate login
    onLogin(selectedRole);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Platformaya Giriş</span>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rol Seçin</label>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('coach')}
                className={`p-3 border rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                  selectedRole === 'coach' 
                    ? 'border-blue-500 bg-blue-50/20 text-blue-700' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-700'
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Məşqçi Girişi</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">İdmançı qeydiyyatdan keçirmək üçün</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 border rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                  selectedRole === 'admin' 
                    ? 'border-blue-500 bg-blue-50/20 text-blue-700' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-700'
                }`}
              >
                <Shield className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold">İdarəçi (Admin)</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Turnir parametrlərini və xalları yazmaq üçün</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('public')}
                className={`p-3 border rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                  selectedRole === 'public' 
                    ? 'border-blue-500 bg-blue-50/20 text-blue-700' 
                    : 'border-gray-100 hover:border-gray-200 text-gray-700'
                }`}
              >
                <Globe className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Qonaq</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Turnir gedişatını sadəcə izləmək üçün</p>
                </div>
              </button>
            </div>
          </div>

          {selectedRole !== 'public' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Şifrə</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="İstənilən şifrə daxil edin"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden"
              />
              <span className="text-[8px] text-gray-400 block">* Test mühitində istənilən şifrə qəbul olunur</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Daxil ol
          </button>
        </form>

      </div>
    </div>
  );
}
