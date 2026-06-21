import React, { useState, useEffect } from 'react';
import { fetchMatchDetails } from '../api';
import { Volume2, Trophy, Minimize, Maximize } from 'lucide-react';
import { t } from '../i18n';

function getKataDetails(scores) {
  if (!scores || scores.length < 5) {
    return { droppedMinIdx: 0, droppedMaxIdx: 4, total: 0 };
  }
  const indexed = scores.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);
  const droppedMinIdx = indexed[0].idx;
  const droppedMaxIdx = indexed[indexed.length - 1].idx;
  const middleValues = indexed.slice(1, 4).map(item => item.val);
  const total = middleValues.reduce((sum, val) => sum + val, 0);
  return {
    droppedMinIdx,
    droppedMaxIdx,
    total: parseFloat(total.toFixed(1))
  };
}

export default function SpectatorBoard({ matchId, onBack, language }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Background modes: 'light' (clean minimalist), 'green' (chroma key), 'transparent' (OBS overlay)
  const [bgMode, setBgMode] = useState('light');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Poll match details every 1 second (1000ms)
  useEffect(() => {
    if (!matchId) return;

    loadDetails();
    const interval = setInterval(loadDetails, 1000);

    return () => clearInterval(interval);
  }, [matchId]);

  async function loadDetails() {
    try {
      const data = await fetchMatchDetails(matchId);
      setMatch(data);
      setError(null);
    } catch (err) {
      console.error("Spectator sync error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Format seconds to MM:SS
  function formatTime(totalSeconds) {
    if (totalSeconds === undefined) return "03:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  }

  if (loading && !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define background classes based on mode
  const bgClasses = 
    bgMode === 'green' ? 'bg-[#00ff00]' : 
    bgMode === 'transparent' ? 'bg-transparent' : 
    'bg-[#f9fafb] text-gray-900';

  const isKata = match?.categoryType === 'kata';
  const kataAka = isKata ? getKataDetails(match?.kataScoresAka || [7.5, 7.5, 7.5, 7.5, 7.5]) : null;
  const kataAo = isKata ? getKataDetails(match?.kataScoresAo || [7.5, 7.5, 7.5, 7.5, 7.5]) : null;

  if (isKata) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-300 ${bgClasses}`}>
        {/* Control overlay header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-auto bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-gray-100 max-w-xl mx-auto shadow-xs">
          <div className="flex gap-2">
            <button 
              onClick={() => setBgMode('light')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${bgMode === 'light' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Light
            </button>
            <button 
              onClick={() => setBgMode('green')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${bgMode === 'green' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Chroma Key
            </button>
            <button 
              onClick={() => setBgMode('transparent')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${bgMode === 'transparent' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              OBS Overlay
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button 
              onClick={onBack}
              className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {t('logout', language)} (Geri)
            </button>
          </div>
        </div>

        {/* Main Scoreboard Layout */}
        <div className="flex-1 grid grid-cols-2 h-full divide-x-8 divide-white relative">
          
          {/* AKA - RED SIDE (Left) */}
          <div className="bg-red-500 text-white flex flex-col justify-between p-12 py-24 select-none relative">
            {/* Athlete Info */}
            <div className="space-y-2 text-left">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{match?.athleteAka?.name}</h1>
              <p className="text-xl text-red-100 font-bold uppercase tracking-wider">{match?.athleteAka?.club} ({match?.athleteAka?.country})</p>
            </div>

            {/* Giant Total Score */}
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-[14rem] sm:text-[20rem] font-black font-mono leading-none tracking-tighter drop-shadow-md">
                {kataAka.total.toFixed(1)}
              </span>
            </div>

            {/* 5 Judges Scores */}
            <div className="grid grid-cols-5 gap-3 pt-6 border-t border-red-400/30">
              {(match?.kataScoresAka || [7.5, 7.5, 7.5, 7.5, 7.5]).map((score, idx) => {
                const isMin = idx === kataAka.droppedMinIdx;
                const isMax = idx === kataAka.droppedMaxIdx;
                const isDropped = isMin || isMax;
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      isDropped 
                        ? 'bg-red-600/30 border-red-400/20 opacity-40' 
                        : 'bg-white text-gray-900 border-white shadow-lg scale-105'
                    }`}
                  >
                    <span className={`text-xs font-bold block mb-1 ${isDropped ? 'text-red-300' : 'text-gray-400'}`}>H{idx + 1}</span>
                    <div className="relative">
                      <span className={`text-2xl sm:text-3xl font-black font-mono ${isDropped ? 'line-through text-red-200' : 'text-gray-900'}`}>
                        {score.toFixed(1)}
                      </span>
                      {isDropped && (
                        <span className="absolute -top-3 -right-2 text-[8px] font-extrabold text-red-200 uppercase bg-red-700 px-0.5 rounded">
                          {isMin ? 'Min' : 'Max'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AO - BLUE SIDE (Right) */}
          <div className="bg-blue-600 text-white flex flex-col justify-between p-12 py-24 select-none relative">
            {/* Athlete Info */}
            <div className="space-y-2 text-right">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{match?.athleteAo?.name}</h1>
              <p className="text-xl text-blue-100 font-bold uppercase tracking-wider">{match?.athleteAo?.club} ({match?.athleteAo?.country})</p>
            </div>

            {/* Giant Total Score */}
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-[14rem] sm:text-[20rem] font-black font-mono leading-none tracking-tighter drop-shadow-md">
                {kataAo.total.toFixed(1)}
              </span>
            </div>

            {/* 5 Judges Scores */}
            <div className="grid grid-cols-5 gap-3 pt-6 border-t border-blue-500/30">
              {(match?.kataScoresAo || [7.5, 7.5, 7.5, 7.5, 7.5]).map((score, idx) => {
                const isMin = idx === kataAo.droppedMinIdx;
                const isMax = idx === kataAo.droppedMaxIdx;
                const isDropped = isMin || isMax;
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      isDropped 
                        ? 'bg-blue-700/30 border-blue-500/20 opacity-40' 
                        : 'bg-white text-gray-900 border-white shadow-lg scale-105'
                    }`}
                  >
                    <span className={`text-xs font-bold block mb-1 ${isDropped ? 'text-blue-300' : 'text-gray-400'}`}>H{idx + 1}</span>
                    <div className="relative">
                      <span className={`text-2xl sm:text-3xl font-black font-mono ${isDropped ? 'line-through text-blue-200' : 'text-gray-900'}`}>
                        {score.toFixed(1)}
                      </span>
                      {isDropped && (
                        <span className="absolute -top-3 -right-2 text-[8px] font-extrabold text-blue-200 uppercase bg-blue-700 px-0.5 rounded">
                          {isMin ? 'Min' : 'Max'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER BOX: ROUND INFO & KATA INDICATOR */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-900 border-8 border-gray-100 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center z-10 w-[240px] sm:w-[320px]">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-500 mb-1">
              {match?.roundName}
            </span>
            
            <div className="text-3xl sm:text-4xl font-black tracking-widest text-gray-800 leading-none my-3 uppercase font-mono bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
              {t('kataLabel', language)}
            </div>

            {match?.status === 'live' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider live-pulse mt-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {t('matchStatusLive', language)}
              </span>
            )}

            {match?.status === 'completed' && (
              <div className="mt-4 p-2 bg-green-50 border border-green-100 rounded-xl text-center w-full">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('spectatorWinner', language)}</p>
                <p className="text-xs font-black text-green-950 truncate mt-0.5">
                  {match.winnerId === match.athleteAkaId ? match.athleteAka?.name : match.athleteAo?.name}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans overflow-hidden transition-colors duration-300 ${bgClasses}`}>
      
      {/* Control overlay header (hidden in pure OBS or can be toggled, but small and clean) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-auto bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-gray-100 max-w-xl mx-auto shadow-xs">
        <div className="flex gap-2">
          <button 
            onClick={() => setBgMode('light')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${bgMode === 'light' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            Light
          </button>
          <button 
            onClick={() => setBgMode('green')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${bgMode === 'green' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            Chroma Key
          </button>
          <button 
            onClick={() => setBgMode('transparent')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${bgMode === 'transparent' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            OBS Overlay
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button 
            onClick={onBack}
            className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {t('logout', language)} (Geri)
          </button>
        </div>
      </div>

      {/* Main Scoreboard Layout */}
      <div className="flex-1 grid grid-cols-2 h-full divide-x-8 divide-white relative">
        
        {/* AKA - RED SIDE (Left) */}
        <div className="bg-red-500 text-white flex flex-col justify-between p-12 py-24 select-none relative">
          {/* Athlete Info */}
          <div className="space-y-2 text-left">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{match?.athleteAka?.name}</h1>
            <p className="text-xl text-red-100 font-bold uppercase tracking-wider">{match?.athleteAka?.club} ({match?.athleteAka?.country})</p>
          </div>

          {/* Huge Score */}
          <div className="flex justify-center my-auto relative">
            <span className="text-[14rem] sm:text-[22rem] font-black font-mono leading-none tracking-tighter drop-shadow-md">
              {match?.scoreAka}
            </span>
            {match?.senshu === 'Aka' && (
              <span className="absolute top-4 right-10 bg-amber-500 text-white border-4 border-white text-xl font-black px-3 py-1 rounded-2xl shadow-md rotate-12">
                SENSHU
              </span>
            )}
          </div>

          {/* Warnings (WKF) */}
          <div className="flex gap-3 justify-start pt-6">
            {['C', 'K', 'HC', 'H'].map(w => {
              const active = match?.warningsAka?.includes(w);
              return (
                <div
                  key={w}
                  className={`w-12 h-12 flex items-center justify-center font-black text-lg rounded-xl border-4 transition-all ${
                    active 
                      ? 'bg-amber-400 border-white text-[#111827] scale-110 shadow-md' 
                      : 'bg-red-600/40 border-red-400 text-red-200'
                  }`}
                >
                  {w}
                </div>
              );
            })}
          </div>
        </div>

        {/* AO - BLUE SIDE (Right) */}
        <div className="bg-blue-600 text-white flex flex-col justify-between p-12 py-24 select-none relative">
          {/* Athlete Info */}
          <div className="space-y-2 text-right">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{match?.athleteAo?.name}</h1>
            <p className="text-xl text-blue-100 font-bold uppercase tracking-wider">{match?.athleteAo?.club} ({match?.athleteAo?.country})</p>
          </div>

          {/* Huge Score */}
          <div className="flex justify-center my-auto relative">
            <span className="text-[14rem] sm:text-[22rem] font-black font-mono leading-none tracking-tighter drop-shadow-md">
              {match?.scoreAo}
            </span>
            {match?.senshu === 'Ao' && (
              <span className="absolute top-4 left-10 bg-amber-500 text-white border-4 border-white text-xl font-black px-3 py-1 rounded-2xl shadow-md -rotate-12">
                SENSHU
              </span>
            )}
          </div>

          {/* Warnings (WKF) */}
          <div className="flex gap-3 justify-end pt-6">
            {['C', 'K', 'HC', 'H'].map(w => {
              const active = match?.warningsAo?.includes(w);
              return (
                <div
                  key={w}
                  className={`w-12 h-12 flex items-center justify-center font-black text-lg rounded-xl border-4 transition-all ${
                    active 
                      ? 'bg-amber-400 border-white text-[#111827] scale-110 shadow-md' 
                      : 'bg-blue-700/40 border-blue-500 text-blue-200'
                  }`}
                >
                  {w}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER BOX: TIMER & ROUND INFO */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-900 border-8 border-gray-100 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center z-10 w-[240px] sm:w-[320px]">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-500 mb-1">
            {match?.roundName}
          </span>
          
          {/* Big countdown numbers */}
          <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-gray-800 leading-none my-2">
            {/* Countdown placeholder since timer runs locally on score app. 
                In actual systems, score app posts secondsLeft to server and we render it */}
            {formatTime(match?.secondsLeft !== undefined ? match.secondsLeft : 180)}
          </div>

          {match?.status === 'live' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider live-pulse mt-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {t('matchStatusLive', language)}
            </span>
          )}

          {match?.status === 'completed' && (
            <div className="mt-4 p-2 bg-green-50 border border-green-100 rounded-xl text-center w-full">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('spectatorWinner', language)}</p>
              <p className="text-xs font-black text-green-950 truncate mt-0.5">
                {match.winnerId === match.athleteAkaId ? match.athleteAka?.name : match.athleteAo?.name}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
