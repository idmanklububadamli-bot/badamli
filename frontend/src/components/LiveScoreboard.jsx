import React, { useState, useEffect, useRef } from 'react';
import { fetchMatchDetails, updateMatchScore } from '../api';
import { Play, Pause, RotateCcw, Save, ArrowLeft, Volume2, ShieldAlert, Monitor, Check } from 'lucide-react';
import { t } from '../i18n';

export default function LiveScoreboard({ matchId, onBack, categories, language }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scoreboard states
  const [scoreAka, setScoreAka] = useState(0);
  const [scoreAo, setScoreAo] = useState(0);
  const [warningsAka, setWarningsAka] = useState([]); 
  const [warningsAo, setWarningsAo] = useState([]);
  const [senshu, setSenshu] = useState(null); 
  const [kataScoresAka, setKataScoresAka] = useState([7.5, 7.5, 7.5, 7.5, 7.5]);
  const [kataScoresAo, setKataScoresAo] = useState([7.5, 7.5, 7.5, 7.5, 7.5]);

  // WKF Judge Flags states
  const [wkfMode, setWkfMode] = useState(true); // WKF Flags mode active by default
  const [judgeFlags, setJudgeFlags] = useState(['none', 'none', 'none', 'none']); // 4 judges: 'none', 'Aka', 'Ao'

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState(180); 
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const lastSyncRef = useRef(180);

  // Fetch match details on mount
  useEffect(() => {
    if (matchId) {
      loadMatchDetails();
    }
    return () => clearInterval(timerRef.current);
  }, [matchId]);

  async function loadMatchDetails() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMatchDetails(matchId);
      setMatch(data);
      setScoreAka(data.scoreAka || 0);
      setScoreAo(data.scoreAo || 0);
      setWarningsAka(data.warningsAka || []);
      setWarningsAo(data.warningsAo || []);
      setSenshu(data.senshu || null);
      setSecondsLeft(data.secondsLeft !== undefined ? data.secondsLeft : 180);
      lastSyncRef.current = data.secondsLeft !== undefined ? data.secondsLeft : 180;

      if (data.kataScoresAka) {
        setKataScoresAka(data.kataScoresAka);
      } else {
        setKataScoresAka([7.5, 7.5, 7.5, 7.5, 7.5]);
      }
      if (data.kataScoresAo) {
        setKataScoresAo(data.kataScoresAo);
      } else {
        setKataScoresAo([7.5, 7.5, 7.5, 7.5, 7.5]);
      }
      
      // Mark match status as 'live'
      await updateMatchScore(matchId, {
        ...data,
        status: 'live'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Timer Countdown logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            playBuzzer();
            syncScoresAndTimer(0, true);
            return 0;
          }
          const nextSec = prev - 1;
          // Sync timer with backend every 5 seconds to keep OBS monitor updated
          if (Math.abs(lastSyncRef.current - nextSec) >= 5) {
            syncScoresAndTimer(nextSec, false);
          }
          return nextSec;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      // Sync on pause
      if (match) {
        syncScoresAndTimer(secondsLeft, false);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Sync to database
  async function syncScoresAndTimer(sec, complete = false) {
    if (!matchId) return;
    lastSyncRef.current = sec;
    try {
      await updateMatchScore(matchId, {
        scoreAka,
        scoreAo,
        warningsAka,
        warningsAo,
        senshu,
        secondsLeft: sec,
        status: complete ? 'completed' : 'live',
        winnerId: complete ? getWinner() : null
      });
    } catch (e) {
      console.error("Failsafe sync error:", e);
    }
  }

  // Get Kata details helper
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

  // Synchronize Kata Scores to backend
  async function syncKataScores(newAka, newAo, complete = false) {
    if (!matchId) return;
    const totalAka = getKataDetails(newAka).total;
    const totalAo = getKataDetails(newAo).total;
    try {
      let winnerId = null;
      if (complete) {
        if (totalAka > totalAo) {
          winnerId = match?.athleteAkaId;
        } else if (totalAo > totalAka) {
          winnerId = match?.athleteAoId;
        } else {
          winnerId = match?.athleteAkaId; // Default
        }
      }
      await updateMatchScore(matchId, {
        scoreAka: totalAka,
        scoreAo: totalAo,
        kataScoresAka: newAka,
        kataScoresAo: newAo,
        status: complete ? 'completed' : 'live',
        winnerId: winnerId || null
      });
    } catch (e) {
      console.error("Failsafe sync error:", e);
    }
  }

  // Update a single judge score
  function updateJudgeScore(side, judgeIdx, delta) {
    if (side === 'Aka') {
      const newScores = [...kataScoresAka];
      const nextVal = parseFloat((newScores[judgeIdx] + delta).toFixed(1));
      if (nextVal >= 5.0 && nextVal <= 10.0) {
        newScores[judgeIdx] = nextVal;
        setKataScoresAka(newScores);
        syncKataScores(newScores, kataScoresAo, false);
      }
    } else {
      const newScores = [...kataScoresAo];
      const nextVal = parseFloat((newScores[judgeIdx] + delta).toFixed(1));
      if (nextVal >= 5.0 && nextVal <= 10.0) {
        newScores[judgeIdx] = nextVal;
        setKataScoresAo(newScores);
        syncKataScores(kataScoresAka, newScores, false);
      }
    }
  }

  // Audio Buzzer using Web Audio API
  function playBuzzer() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.value = 440; 
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 1500);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  }

  // Format seconds to MM:SS
  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Calculate votes
  const akaVotes = judgeFlags.filter(f => f === 'Aka').length;
  const aoVotes = judgeFlags.filter(f => f === 'Ao').length;

  // Decide if scoring buttons are unlocked
  const isAkaUnlocked = !wkfMode || akaVotes >= 2;
  const isAoUnlocked = !wkfMode || aoVotes >= 2;

  // Scoring handlers
  function addPoints(side, pts) {
    if (side === 'Aka') {
      if (!isAkaUnlocked) return;
      const newScore = Math.max(0, scoreAka + pts);
      setScoreAka(newScore);
      if (senshu === null && pts > 0 && scoreAo === 0) {
        setSenshu('Aka');
      }
    } else {
      if (!isAoUnlocked) return;
      const newScore = Math.max(0, scoreAo + pts);
      setScoreAo(newScore);
      if (senshu === null && pts > 0 && scoreAka === 0) {
        setSenshu('Ao');
      }
    }

    // Reset flags automatically after a score is awarded
    setJudgeFlags(['none', 'none', 'none', 'none']);

    // Trigger immediate backend sync
    setTimeout(() => {
      syncScoresAndTimer(secondsLeft, false);
    }, 100);
  }

  // Toggle warnings
  function toggleWarning(side, level) {
    const currentList = side === 'Aka' ? [...warningsAka] : [...warningsAo];
    const setter = side === 'Aka' ? setWarningsAka : setWarningsAo;

    const index = currentList.indexOf(level);
    if (index > -1) {
      const levels = ['C', 'K', 'HC', 'H'];
      const removeIndex = levels.indexOf(level);
      const filtered = currentList.filter(l => levels.indexOf(l) < removeIndex);
      setter(filtered);
    } else {
      const levels = ['C', 'K', 'HC', 'H'];
      const addIndex = levels.indexOf(level);
      const toAdd = levels.slice(0, addIndex + 1);
      setter(toAdd);

      if (level === 'H') {
        setTimerRunning(false);
        alert(`Hansoku! ${side === 'Aka' ? 'Ao (Mavi)' : 'Aka (Qırmızı)'} avtomatik qalib elan olunur.`);
      }
    }

    setTimeout(() => {
      syncScoresAndTimer(secondsLeft, false);
    }, 100);
  }

  // Toggle single judge flag
  function handleJudgeFlagChange(judgeIndex, vote) {
    const updatedFlags = [...judgeFlags];
    if (updatedFlags[judgeIndex] === vote) {
      updatedFlags[judgeIndex] = 'none'; // Toggle off
    } else {
      updatedFlags[judgeIndex] = vote;
    }
    setJudgeFlags(updatedFlags);
  }

  function handleResetFlags() {
    setJudgeFlags(['none', 'none', 'none', 'none']);
  }

  // Determine Match Winner
  function getWinner() {
    if (warningsAka.includes('H')) return match?.athleteAoId;
    if (warningsAo.includes('H')) return match?.athleteAkaId;

    if (scoreAka > scoreAo) return match?.athleteAkaId;
    if (scoreAo > scoreAka) return match?.athleteAoId;

    if (scoreAka === scoreAo && senshu) {
      return senshu === 'Aka' ? match?.athleteAkaId : match?.athleteAoId;
    }
    return match?.athleteAkaId; // Referee Decision default
  }

  // Save match scores to API
  async function handleSaveMatch() {
    setLoading(true);
    setTimerRunning(false);
    try {
      const isKata = cat?.type === 'kata';
      let winnerId = null;
      let scoreAkaToSave = scoreAka;
      let scoreAoToSave = scoreAo;

      if (isKata) {
        scoreAkaToSave = getKataDetails(kataScoresAka).total;
        scoreAoToSave = getKataDetails(kataScoresAo).total;
        if (scoreAkaToSave > scoreAoToSave) {
          winnerId = match?.athleteAkaId;
        } else if (scoreAoToSave > scoreAkaToSave) {
          winnerId = match?.athleteAoId;
        } else {
          winnerId = match?.athleteAkaId; // Fallback
        }
      } else {
        winnerId = getWinner();
      }
      
      const payload = {
        scoreAka: scoreAkaToSave,
        scoreAo: scoreAoToSave,
        warningsAka,
        warningsAo,
        senshu,
        winnerId,
        secondsLeft,
        status: 'completed'
      };

      if (isKata) {
        payload.kataScoresAka = kataScoresAka;
        payload.kataScoresAo = kataScoresAo;
      }

      await updateMatchScore(matchId, payload);
      alert('Matç nəticələri yadda saxlanıldı və püşkatma ağacı yeniləndi.');
      onBack(); 
    } catch (err) {
      alert('Xəta baş verdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !match) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center space-y-4">
        <p className="text-sm text-red-600">Xəta baş verdi: {error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold">Geri Dön</button>
      </div>
    );
  }

  const cat = categories.find(c => c.id === match?.categoryId);
  const isKata = cat?.type === 'kata';
  const akaKata = getKataDetails(kataScoresAka);
  const aoKata = getKataDetails(kataScoresAo);

  if (isKata) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {t('logout', language)} (Geri)
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {cat?.name || 'Şito-ryu Karate'}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-2">
              {match?.roundName} ({t('kataLabel', language)})
            </span>
          </div>

          {/* OBS and Save Buttons */}
          <div className="flex items-center gap-2">
            {/* OBS Monitor Link */}
            <a
              href={`#`}
              onClick={(e) => {
                e.preventDefault();
                window.open(`${window.location.origin}?tab=spectator&matchId=${matchId}&lang=${language}`, '_blank', 'width=1280,height=720');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              title="Aç pəncərədə yayım ekranı"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OBS / {t('spectatorMode', language)}</span>
            </a>

            <button 
              onClick={handleSaveMatch}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {t('confirmScores', language)}
            </button>
          </div>
        </div>

        {/* Main Scoreboard Layout */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* AKA - RED SIDE (Left) */}
          <div className="p-6 flex flex-col items-center justify-between space-y-6 bg-red-50/5">
            <div className="text-center w-full">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white uppercase tracking-wider mb-2">
                AKA ({t('spectatorAka', language)})
              </span>
              <h2 className="text-base font-bold text-gray-900 truncate">{match?.athleteAka?.name}</h2>
              <p className="text-xs text-gray-400 truncate mt-0.5">{match?.athleteAka?.club}</p>
            </div>

            {/* Total Score */}
            <div className="text-center">
              <span className="text-sm font-bold text-gray-400 block uppercase tracking-wider mb-1">
                {t('kataTotal', language)}
              </span>
              <span className="text-8xl font-black font-mono text-red-500 leading-none select-none">
                {akaKata.total.toFixed(1)}
              </span>
            </div>

            {/* 5 Judges Scores Grid */}
            <div className="w-full space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                {t('judgesFlags', language)}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {kataScoresAka.map((score, idx) => {
                  const isMin = idx === akaKata.droppedMinIdx;
                  const isMax = idx === akaKata.droppedMaxIdx;
                  const isDropped = isMin || isMax;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center p-2 rounded-xl border bg-white transition-all ${
                        isDropped ? 'border-gray-200 bg-gray-50/50' : 'border-red-100 shadow-xs'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-gray-400 block mb-1">H{idx + 1}</span>
                      <div className="relative">
                        <span 
                          className={`text-xl font-extrabold font-mono ${
                            isDropped ? 'line-through text-gray-300' : 'text-gray-900'
                          }`}
                        >
                          {score.toFixed(1)}
                        </span>
                        {isDropped && (
                          <span className="absolute -top-3 -right-2 text-[8px] font-extrabold text-red-500 uppercase tracking-tighter bg-red-50 px-0.5 rounded">
                            {isMin ? 'Min' : 'Max'}
                          </span>
                        )}
                      </div>
                      
                      {/* Increment/Decrement Buttons */}
                      <div className="flex flex-col gap-1 mt-3">
                        <button 
                          onClick={() => updateJudgeScore('Aka', idx, 0.1)}
                          className="w-6 h-6 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-full font-bold text-xs cursor-pointer transition-colors"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => updateJudgeScore('Aka', idx, -0.1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full font-bold text-xs cursor-pointer transition-colors"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AO - BLUE SIDE (Right) */}
          <div className="p-6 flex flex-col items-center justify-between space-y-6 bg-blue-50/5">
            <div className="text-center w-full">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider mb-2">
                AO ({t('spectatorAo', language)})
              </span>
              <h2 className="text-base font-bold text-gray-900 truncate">{match?.athleteAo?.name}</h2>
              <p className="text-xs text-gray-400 truncate mt-0.5">{match?.athleteAo?.club}</p>
            </div>

            {/* Total Score */}
            <div className="text-center">
              <span className="text-sm font-bold text-gray-400 block uppercase tracking-wider mb-1">
                {t('kataTotal', language)}
              </span>
              <span className="text-8xl font-black font-mono text-blue-500 leading-none select-none">
                {aoKata.total.toFixed(1)}
              </span>
            </div>

            {/* 5 Judges Scores Grid */}
            <div className="w-full space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                {t('judgesFlags', language)}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {kataScoresAo.map((score, idx) => {
                  const isMin = idx === aoKata.droppedMinIdx;
                  const isMax = idx === aoKata.droppedMaxIdx;
                  const isDropped = isMin || isMax;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center p-2 rounded-xl border bg-white transition-all ${
                        isDropped ? 'border-gray-200 bg-gray-50/50' : 'border-blue-100 shadow-xs'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-gray-400 block mb-1">H{idx + 1}</span>
                      <div className="relative">
                        <span 
                          className={`text-xl font-extrabold font-mono ${
                            isDropped ? 'line-through text-gray-300' : 'text-gray-900'
                          }`}
                        >
                          {score.toFixed(1)}
                        </span>
                        {isDropped && (
                          <span className="absolute -top-3 -right-2 text-[8px] font-extrabold text-blue-500 uppercase tracking-tighter bg-blue-50 px-0.5 rounded">
                            {isMin ? 'Min' : 'Max'}
                          </span>
                        )}
                      </div>
                      
                      {/* Increment/Decrement Buttons */}
                      <div className="flex flex-col gap-1 mt-3">
                        <button 
                          onClick={() => updateJudgeScore('Ao', idx, 0.1)}
                          className="w-6 h-6 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full font-bold text-xs cursor-pointer transition-colors"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => updateJudgeScore('Ao', idx, -0.1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full font-bold text-xs cursor-pointer transition-colors"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Action Panel for Sound / Signals */}
        <div className="flex justify-center items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
          <button
            onClick={playBuzzer}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            Buzzer Səs Siqnalı
          </button>
        </div>

        {/* Explanation banner */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2 justify-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider text-center">
          <span>* Kata Qaydaları: Hər bir idmançı üçün 5 hakimin balları daxil edilir. Ən yüksək və ən aşağı ballar silinir, yerdə qalan 3 balın cəmi yekun xalı müəyyən edir.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('logout', language)} (Geri)
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {cat?.name || 'Şito-ryu Karate'}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400 ml-2">
            {match?.roundName}
          </span>
        </div>

        {/* OBS and Save Buttons */}
        <div className="flex items-center gap-2">
          {/* OBS Monitor Link */}
          <a
            href={`#`}
            onClick={(e) => {
              e.preventDefault();
              window.open(`${window.location.origin}?tab=spectator&matchId=${matchId}&lang=${language}`, '_blank', 'width=1280,height=720');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            title="Aç pəncərədə seyrici ekranı"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OBS / {t('spectatorMode', language)}</span>
          </a>

          <button 
            onClick={handleSaveMatch}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {t('saveParams', language)}
          </button>
        </div>
      </div>

      {/* Main Scoreboard Layout */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* AKA - RED SIDE (Left, cols 1-2) */}
        <div className="md:col-span-2 p-6 flex flex-col items-center justify-between space-y-6 bg-red-50/5">
          <div className="text-center w-full">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white uppercase tracking-wider mb-2">
              AKA ({t('spectatorAka', language)})
            </span>
            <h2 className="text-base font-bold text-gray-900 truncate">{match?.athleteAka?.name}</h2>
            <p className="text-xs text-gray-400 truncate mt-0.5">{match?.athleteAka?.club}</p>
          </div>

          {/* Big Score Display */}
          <div className="relative">
            <span className="text-8xl font-black font-mono text-red-500 leading-none select-none">
              {scoreAka}
            </span>
            {senshu === 'Aka' && (
              <span className="absolute -top-1 -right-4 bg-amber-500 text-white text-[9px] font-extrabold px-1 rounded shadow-xs">
                S
              </span>
            )}
          </div>

          {/* Score adjustments */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <button 
                onClick={() => addPoints('Aka', 1)}
                disabled={!isAkaUnlocked}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  isAkaUnlocked 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={!isAkaUnlocked ? "Hakim təsdiqi gözlənilir" : "Yuko +1"}
              >
                +1
              </button>
              <button 
                onClick={() => addPoints('Aka', 2)}
                disabled={!isAkaUnlocked}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  isAkaUnlocked 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={!isAkaUnlocked ? "Hakim təsdiqi gözlənilir" : "Waza-ari +2"}
              >
                +2
              </button>
              <button 
                onClick={() => addPoints('Aka', 3)}
                disabled={!isAkaUnlocked}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  isAkaUnlocked 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={!isAkaUnlocked ? "Hakim təsdiqi gözlənilir" : "Ippon +3"}
              >
                +3
              </button>
            </div>
            
            <button 
              onClick={() => {
                // Deducting points is always unlocked for referee correction
                const newScore = Math.max(0, scoreAka - 1);
                setScoreAka(newScore);
                setTimeout(() => syncScoresAndTimer(secondsLeft, false), 100);
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 text-[10px] font-bold rounded transition-colors cursor-pointer"
            >
              Xalı Azalt (-1)
            </button>
          </div>

          {/* Warnings list */}
          <div className="w-full space-y-2 border-t border-gray-100 pt-4">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider text-center mb-1">
              {t('tableCategory', language).split('/')[0]} {t('judgesFlags', language).split(' ')[1]} (Warnings)
            </p>
            <div className="flex justify-center gap-1">
              {['C', 'K', 'HC', 'H'].map(w => {
                const isSelected = warningsAka.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWarning('Aka', w)}
                    className={`w-9 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-red-500 border-red-500 text-white shadow-xs' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - TIMER & MOCK JUDGES (Col 3) */}
        <div className="p-4 flex flex-col items-center justify-between space-y-6 bg-gray-50/20">
          
          {/* Timer Block */}
          <div className="text-center w-full">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Timer</span>
            <div className="text-4xl font-extrabold font-mono text-gray-800 leading-none">
              {formatTime(secondsLeft)}
            </div>

            <div className="flex justify-center gap-1.5 mt-3">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white shadow-xs transition-colors cursor-pointer ${
                  timerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(180);
                  setTimeout(() => syncScoresAndTimer(180, false), 100);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full shadow-xs transition-colors cursor-pointer"
                title="Sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WKF JUDGES FLAGS PANEL */}
          <div className="w-full border-t border-b border-gray-100 py-4 flex flex-col items-center space-y-3">
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
                {t('judgesFlags', language)}
              </span>
              <button
                onClick={() => setWkfMode(!wkfMode)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-colors cursor-pointer ${
                  wkfMode ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-400'
                }`}
              >
                WKF {wkfMode ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Flag selectors for 4 judges */}
            <div className="space-y-2 w-full px-1">
              {[0, 1, 2, 3].map(idx => {
                const currentVote = judgeFlags[idx];
                return (
                  <div key={idx} className="flex items-center justify-between text-[9px] font-bold text-gray-500 bg-white border border-gray-100 p-1.5 rounded-lg">
                    <span>H{idx+1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleJudgeFlagChange(idx, 'Aka')}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                          currentVote === 'Aka' 
                            ? 'bg-red-500 border-red-500 text-white' 
                            : 'border-gray-200 hover:bg-red-50 text-red-500'
                        }`}
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJudgeFlagChange(idx, 'Ao')}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                          currentVote === 'Ao' 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'border-gray-200 hover:bg-blue-50 text-blue-500'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Votes Tally Display */}
            {wkfMode && (
              <div className="flex gap-4 text-[9px] font-extrabold uppercase text-gray-400">
                <span className={akaVotes >= 2 ? 'text-red-500 font-black' : ''}>Aka: {akaVotes}/2</span>
                <span className={aoVotes >= 2 ? 'text-blue-500 font-black' : ''}>Ao: {aoVotes}/2</span>
              </div>
            )}

            <button
              onClick={handleResetFlags}
              className="text-[8px] font-extrabold text-gray-400 hover:text-gray-900 uppercase tracking-widest cursor-pointer"
            >
              {t('resetFlags', language)}
            </button>
          </div>

          {/* Senshu Toggle */}
          <div className="w-full flex flex-col items-center">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Senshu</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
              <button
                onClick={() => {
                  setSenshu(senshu === 'Aka' ? null : 'Aka');
                  setTimeout(() => syncScoresAndTimer(secondsLeft, false), 100);
                }}
                className={`px-3 py-1 text-[9px] font-bold transition-colors cursor-pointer ${
                  senshu === 'Aka' ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Aka
              </button>
              <button
                onClick={() => {
                  setSenshu(null);
                  setTimeout(() => syncScoresAndTimer(secondsLeft, false), 100);
                }}
                className={`px-2.5 py-1 text-[9px] font-bold border-x border-gray-200 transition-colors cursor-pointer ${
                  senshu === null ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                X
              </button>
              <button
                onClick={() => {
                  setSenshu(senshu === 'Ao' ? null : 'Ao');
                  setTimeout(() => syncScoresAndTimer(secondsLeft, false), 100);
                }}
                className={`px-3 py-1 text-[9px] font-bold transition-colors cursor-pointer ${
                  senshu === 'Ao' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Ao
              </button>
            </div>
          </div>
        </div>

        {/* AO - BLUE SIDE (Right, cols 4-5) */}
        <div className="md:col-span-2 p-6 flex flex-col items-center justify-between space-y-6 bg-blue-50/5">
          <div className="text-center w-full">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider mb-2">
              AO ({t('spectatorAo', language)})
            </span>
            <h2 className="text-base font-bold text-gray-900 truncate">{match?.athleteAo?.name}</h2>
            <p className="text-xs text-gray-400 truncate mt-0.5">{match?.athleteAo?.club}</p>
          </div>

          {/* Big Score Display */}
          <div className="relative">
            <span className="text-8xl font-black font-mono text-blue-500 leading-none select-none">
              {scoreAo}
            </span>
            {senshu === 'Ao' && (
              <span className="absolute -top-1 -right-4 bg-amber-500 text-white text-[9px] font-extrabold px-1 rounded shadow-xs">
                S
              </span>
            )}
          </div>

          {/* Score adjustments */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <button 
                onClick={() => addPoints('Ao', 1)}
                disabled={!isAoUnlocked}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  isAoUnlocked 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={!isAoUnlocked ? "Hakim təsdiqi gözlənilir" : "Yuko +1"}
              >
                +1
              </button>
              <button 
                onClick={() => addPoints('Ao', 2)}
                disabled={!isAoUnlocked}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  isAoUnlocked 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={!isAoUnlocked ? "Hakim təsdiqi gözlənilir" : "Waza-ari +2"}
              >
                +2
              </button>
              <button 
                onClick={() => addPoints('Ao', 3)}
                disabled={!isAoUnlocked}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                  isAoUnlocked 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={!isAoUnlocked ? "Hakim təsdiqi gözlənilir" : "Ippon +3"}
              >
                +3
              </button>
            </div>
            
            <button 
              onClick={() => {
                const newScore = Math.max(0, scoreAo - 1);
                setScoreAo(newScore);
                setTimeout(() => syncScoresAndTimer(secondsLeft, false), 100);
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 text-[10px] font-bold rounded transition-colors cursor-pointer"
            >
              Xalı Azalt (-1)
            </button>
          </div>

          {/* Warnings list */}
          <div className="w-full space-y-2 border-t border-gray-100 pt-4">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider text-center mb-1">
              {t('tableCategory', language).split('/')[0]} {t('judgesFlags', language).split(' ')[1]} (Warnings)
            </p>
            <div className="flex justify-center gap-1">
              {['C', 'K', 'HC', 'H'].map(w => {
                const isSelected = warningsAo.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWarning('Ao', w)}
                    className={`w-9 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 text-white shadow-xs' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Explanation banner */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-2 justify-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
        <span>* WKF Qaydaları: Xal vermək üçün ən azı 2 yan hakimin (H1-H4) eyni bayrağı qaldırması vacibdir.</span>
      </div>
    </div>
  );
}
