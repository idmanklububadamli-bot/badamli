import React, { useState, useEffect } from 'react';
import { fetchRoster, addRosterAthlete, updateRosterAthlete, deleteRosterAthlete } from '../api';
import { Users, Plus, Edit2, Trash2, CheckCircle, Save, X, Printer } from 'lucide-react';

export default function Roster({ userRole }) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('M');
  const [club, setClub] = useState('');
  const [country, setCountry] = useState('AZE');

  useEffect(() => {
    if (userRole === 'coach') {
      loadRoster();
    }
  }, [userRole]);

  async function loadRoster() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoster();
      setAthletes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setBirthDate('');
    setGender('M');
    setClub('');
    setCountry('AZE');
    setIsAdding(false);
    setEditingId(null);
  }

  function handleEdit(athlete) {
    setName(athlete.name);
    setBirthDate(athlete.birthDate ? athlete.birthDate.split('T')[0] : '');
    setGender(athlete.gender || 'M');
    setClub(athlete.club);
    setCountry(athlete.country || 'AZE');
    setEditingId(athlete.id);
    setIsAdding(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !club.trim()) return;

    try {
      const athleteData = {
        name,
        birthDate: birthDate || null,
        gender,
        club,
        country
      };

      if (editingId) {
        await updateRosterAthlete(editingId, athleteData);
      } else {
        await addRosterAthlete(athleteData);
      }
      
      resetForm();
      loadRoster();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bu idmançını siyahıdan silmək istədiyinizə əminsiniz?')) return;
    try {
      await deleteRosterAthlete(id);
      loadRoster();
    } catch (err) {
      alert(err.message);
    }
  }

  if (userRole !== 'coach') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Users className="w-16 h-16 text-gray-200" />
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Məşqçi Siyahısı</h2>
        <p className="text-gray-500 max-w-md text-sm">
          Bu bölmə yalnız məşqçilər (coach) üçün nəzərdə tutulub. Zəhmət olmasa məşqçi kimi daxil olun.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-6 shadow-xs print:hidden">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Mənim İdmançılarım
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            İdmançılarınızı bir dəfə əlavə edin, turnirlərə qeydiyyatı saniyələr içində bitirin.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold tracking-wider transition-colors"
            title="Siyahını PDF olaraq yüklə və ya Çap et"
          >
            <Printer className="w-4 h-4" /> PDF / Çap
          </button>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Yeni İdmançı
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
            {editingId ? 'İdmançını Redaktə Et' : 'Yeni İdmançı Əlavə Et'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ad, Soyad</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Məsələn: Həsən Əliyev"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Təvəllüd</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cins</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900"
              >
                <option value="M">Kişi</option>
                <option value="F">Qadın</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Klub</label>
              <input
                type="text"
                required
                value={club}
                onChange={e => setClub(e.target.value)}
                placeholder="Məsələn: Qarabağ İK"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ölkə</label>
              <input
                type="text"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="AZE"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-gray-900 uppercase"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-gray-800 transition-colors shadow-md"
            >
              <Save className="w-4 h-4" /> {editingId ? 'Yadda Saxla' : 'Əlavə Et'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : athletes.length === 0 && !isAdding ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Siyahınızda hələ heç bir idmançı yoxdur.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 text-blue-500 hover:text-blue-600 font-bold text-sm"
          >
            İlk idmançınızı əlavə edin
          </button>
        </div>
      ) : athletes.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">İdmançı</th>
                <th className="px-6 py-4 hidden sm:table-cell">Təvəllüd & Cins</th>
                <th className="px-6 py-4">Klub / Ölkə</th>
                <th className="px-6 py-4 text-right print:hidden">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {athletes.map(athlete => (
                <tr key={athlete.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{athlete.name}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-600">
                    {athlete.birthDate ? new Date(athlete.birthDate).toLocaleDateString('az-AZ') : '-'}
                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
                      {athlete.gender === 'F' ? 'Qadın' : 'Kişi'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{athlete.club}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{athlete.country}</div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 print:hidden">
                    <button
                      onClick={() => handleEdit(athlete)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Redaktə et"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(athlete.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
