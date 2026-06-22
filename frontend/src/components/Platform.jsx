import React from 'react';
import { 
  Shield, 
  Users, 
  Calendar, 
  Award, 
  Database, 
  TrendingUp, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { t } from '../i18n';

export default function Platform({ language }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      
      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-4 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-bold tracking-wider uppercase rounded-full">
            Badamlı Online Platforması
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Yarış günü və idmançı datalarını bir mərkəzdən idarə edən peşəkar rəqəmsal ekosistem
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Badamlı Online turnir yaradılmasından qeydiyyata, püşkatmalardan canlı scoreboard-a, nəticələrdən podium ekranına qədər bütün əməliyyat axınını vahid premium standartda birləşdirir.
          </p>
        </div>
      </div>

      {/* Database & Reuse Capability Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex gap-4 items-start">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Kəsintisiz İdmançı Datası
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Qeydiyyatdan keçən hər bir idmançının məlumatları (ad, soyad, klub, ölkə) sistemimizdə daimi olaraq saxlanılır. Növbəti turnirlərdə məşqçilər eyni idmançıları yenidən yazmaq məcburiyyətində qalmır, tək kliklə rosterdən seçərək yeni yarışlara qeydiyyat edə bilirlər.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex gap-4 items-start">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Yaş və Çəki Bölünmə Məntiqi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yarış vaxtı idmançıların kateqoriyalara bölünməsi beynəlxalq standartlara uyğun avtomatlaşdırılmışdır. Yaş qrupu, doğum tarixi və çəki dərəcəsi məntiqi sistem tərəfindən yoxlanılır və idmançılar yalnız özlərinə uyğun olan rəsmi kateqoriyalarda yarışa bilirlər.
            </p>
          </div>
        </div>
      </div>

      {/* Main Modules */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Platformanın Əsas Modulları
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Turnir İdarəetməsi</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Turnir məlumatları, məkan, tarix, xəritə koordinatları və idarəçi icazələri vahid administrativ paneldə tənzimlənir.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Qeydiyyat Portalı</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Klub rəhbərləri və məşqçilər üçün sadələşdirilmiş qeydiyyat, idmançı siyahıları və kateqoriya təyinatı modulu.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Püşkatma və Brackets</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              WKF və digər rəsmi döyüş növlərinin qaydalarına tam uyğun olaraq avtomatik püşkatma (bracket generation) və byes hesablanması.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Canlı Scoreboard</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hakim xalları, cərimələr, Senshu üstünlüyü və anlıq taymer ilə tatami operatorları üçün peşəkar idarəetmə lövhəsi.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Tatami Cədvəli</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bir neçə tataminin eyni vaxtda sinxron planlaşdırılması, görüş ardıcıllığı və vaxt cədvəlinin idarə edilməsi.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-all hover:-translate-y-0.5 shadow-2xs">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Nəticələr və Statistika</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Qaliblərin avtomatik elan olunması, medal sıralaması, klub reytinqi və rəsmi hesabatların avtomatik formalaşması.
            </p>
          </div>

        </div>
      </div>

      {/* Operation Flow / Əməliyyat Axını */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Turnirin İdarə olunma Mərhələləri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-blue-500">01. Tədbir Qurulur</div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Turnir adı, məkanı, tarixi və kateqoriyalar yaradılır.</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-blue-500">02. Qeydiyyat</div>
            <p className="text-[10px] text-slate-400 leading-relaxed">İdmançılar yaş və çəki limitlərinə uyğun qeydiyyatdan keçirilir.</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-blue-500">03. Püşkatma</div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Saniyələr ərzində beynəlxalq standartlarda püşkatma qurulur.</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-blue-500">04. Canlı Turnir</div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Tatami lövhələri işə düşür və nəticələr anlıq olaraq sayta yansıyır.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
