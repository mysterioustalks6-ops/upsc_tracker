import React, { useState, useEffect, useRef } from 'react';
import { StudySession, SyllabusData } from '../types';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Flag,
  Clock,
  Edit3,
  Save,
  BarChart3,
  Sparkles,
  PieChart,
  Trash2,
  Calendar,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Zap,
  Tag,
  BookOpen,
  Sliders
} from 'lucide-react';

interface FocusTimerViewProps {
  syllabus?: SyllabusData;
  onSessionSaved?: (session: StudySession) => void;
}

const PRESET_TIMERS = [
  { name: '25m Pomodoro', seconds: 25 * 60, icon: '🎯' },
  { name: '45m Deep Study', seconds: 45 * 60, icon: '⚡' },
  { name: '60m Answer Writing', seconds: 60 * 60, icon: '📝' },
  { name: '120m Mock Test', seconds: 120 * 60, icon: '💯' },
];

const CATEGORIES: StudySession['category'][] = [
  'Book Reading',
  'Video Lecture',
  'Revision',
  'Answer Writing',
  'Current Affairs',
  'Mock Test',
  'Other'
];

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({ syllabus, onSessionSaved }) => {
  // Mode: 'stopwatch' or 'timer'
  const [mode, setMode] = useState<'stopwatch' | 'timer'>(() => {
    try {
      return (localStorage.getItem('upsc_timer_mode') as any) || 'stopwatch';
    } catch {
      return 'stopwatch';
    }
  });

  // Timer State with Background Persistence via Timestamp delta on init
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    try {
      return localStorage.getItem('upsc_timer_is_running') === 'true';
    } catch {
      return false;
    }
  });

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    try {
      return localStorage.getItem('upsc_timer_is_paused') === 'true';
    } catch {
      return false;
    }
  });

  const [initialCountdown, setInitialCountdown] = useState<number>(() => {
    try {
      const savedInit = localStorage.getItem('upsc_timer_initial');
      return savedInit ? parseInt(savedInit, 10) : 25 * 60;
    } catch {
      return 25 * 60;
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    try {
      const savedElapsed = localStorage.getItem('upsc_timer_elapsed');
      const savedTimestamp = localStorage.getItem('upsc_timer_timestamp');
      const isRun = localStorage.getItem('upsc_timer_is_running') === 'true';
      const base = savedElapsed ? parseInt(savedElapsed, 10) : 0;
      if (isRun && savedTimestamp) {
        const diffSec = Math.floor((Date.now() - parseInt(savedTimestamp, 10)) / 1000);
        return Math.max(0, base + diffSec);
      }
      return base;
    } catch {
      return 0;
    }
  });

  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => {
    try {
      const savedCountdown = localStorage.getItem('upsc_timer_countdown');
      const savedTimestamp = localStorage.getItem('upsc_timer_timestamp');
      const isRun = localStorage.getItem('upsc_timer_is_running') === 'true';
      const savedInit = localStorage.getItem('upsc_timer_initial');
      const init = savedInit ? parseInt(savedInit, 10) : 25 * 60;
      const base = savedCountdown ? parseInt(savedCountdown, 10) : init;
      const modeVal = localStorage.getItem('upsc_timer_mode') || 'stopwatch';
      if (isRun && modeVal === 'timer' && savedTimestamp) {
        const diffSec = Math.floor((Date.now() - parseInt(savedTimestamp, 10)) / 1000);
        const rem = base - diffSec;
        if (rem <= 0) return 0;
        return rem;
      }
      return base;
    } catch {
      return 25 * 60;
    }
  });

  const [laps, setLaps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('upsc_timer_laps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sound alert state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Edit Time Modal/Popover
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customHours, setCustomHours] = useState('0');
  const [customMinutes, setCustomMinutes] = useState('25');
  const [customSecondsInput, setCustomSecondsInput] = useState('0');

  // Save Session Modal
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionSubject, setSessionSubject] = useState('Polity & Governance');
  const [sessionCategory, setSessionCategory] = useState<StudySession['category']>('Book Reading');
  const [sessionNotes, setSessionNotes] = useState('');

  // Recorded Sessions History
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem('upsc_os_study_sessions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load study sessions from localStorage', e);
    }
    return [
      {
        id: 'sess_1',
        subject: 'Polity & Governance',
        category: 'Book Reading',
        durationSeconds: 3600,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toLocaleTimeString(),
        notes: 'Read M. Laxmikanth Fundamental Rights Chapter'
      },
      {
        id: 'sess_2',
        subject: 'Indian Economy',
        category: 'Video Lecture',
        durationSeconds: 2700,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toLocaleTimeString(),
        notes: 'Monetary Policy & RBI Inflation Targeting'
      }
    ];
  });

  // Edit Existing Session State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editCategory, setEditCategory] = useState<StudySession['category']>('Book Reading');
  const [editDurationMins, setEditDurationMins] = useState(30);
  const [editNotes, setEditNotes] = useState('');

  // Extract available subjects from syllabus or default
  const availableSubjects = syllabus && Object.keys(syllabus).length > 0
    ? Object.keys(syllabus)
    : ['Polity & Governance', 'Indian Economy', 'Modern History', 'Geography & Maps', 'Environment & Ecology', 'Science & Tech', 'CSAT', 'Optional Subject'];

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upsc_os_study_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save study sessions to localStorage', e);
    }
  }, [sessions]);

  // Persist timer state & timestamp to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('upsc_timer_is_running', isRunning ? 'true' : 'false');
      localStorage.setItem('upsc_timer_is_paused', isPaused ? 'true' : 'false');
      localStorage.setItem('upsc_timer_mode', mode);
      localStorage.setItem('upsc_timer_elapsed', elapsedSeconds.toString());
      localStorage.setItem('upsc_timer_countdown', countdownSeconds.toString());
      localStorage.setItem('upsc_timer_initial', initialCountdown.toString());
      localStorage.setItem('upsc_timer_timestamp', Date.now().toString());
      localStorage.setItem('upsc_timer_laps', JSON.stringify(laps));
    } catch (e) {
      console.warn('Failed to save timer state to localStorage', e);
    }
  }, [isRunning, isPaused, mode, elapsedSeconds, countdownSeconds, initialCountdown, laps]);

  // Main tick engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsedSeconds((prev) => prev + 1);
        } else {
          setCountdownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsRunning(false);
              setIsPaused(false);
              triggerCompletionAlert();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const triggerCompletionAlert = () => {
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {
        console.log('Audio Context beep prevented or not supported');
      }
    }
    // Auto prompt save session
    setIsSavingSession(true);
  };

  // Timer Control Handlers
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setCountdownSeconds(initialCountdown);
    setLaps([]);
    try {
      localStorage.removeItem('upsc_timer_is_running');
      localStorage.removeItem('upsc_timer_is_paused');
      localStorage.removeItem('upsc_timer_elapsed');
      localStorage.removeItem('upsc_timer_countdown');
      localStorage.removeItem('upsc_timer_timestamp');
      localStorage.removeItem('upsc_timer_laps');
    } catch (e) {}
  };

  const handleAddLap = () => {
    const current = mode === 'stopwatch' ? elapsedSeconds : initialCountdown - countdownSeconds;
    setLaps((prev) => [...prev, current]);
  };

  const handleSelectPreset = (sec: number) => {
    setIsRunning(false);
    setIsPaused(false);
    setMode('timer');
    setInitialCountdown(sec);
    setCountdownSeconds(sec);
    setLaps([]);
  };

  // Apply custom edited time
  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(customHours) || 0;
    const m = parseInt(customMinutes) || 0;
    const s = parseInt(customSecondsInput) || 0;
    const totalSec = h * 3600 + m * 60 + s;

    if (mode === 'stopwatch') {
      setElapsedSeconds(totalSec);
    } else {
      setInitialCountdown(totalSec);
      setCountdownSeconds(totalSec);
    }
    setIsEditingTime(false);
  };

  // Open Save Session Dialog
  const handleOpenSaveDialog = () => {
    setIsRunning(false);
    setIsPaused(true);
    setIsSavingSession(true);
  };

  // Complete & Save Session
  const handleConfirmSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSec = mode === 'stopwatch' ? elapsedSeconds : initialCountdown - countdownSeconds;

    if (activeSec < 10) {
      setIsSavingSession(false);
      return;
    }

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      subject: sessionSubject,
      category: sessionCategory,
      durationSeconds: activeSec,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: sessionNotes.trim() || undefined,
      laps: laps.length > 0 ? laps : undefined,
    };

    setSessions((prev) => [newSession, ...prev]);
    if (onSessionSaved) onSessionSaved(newSession);

    // Reset timer state
    handleReset();
    setIsSavingSession(false);
    setSessionNotes('');
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Edit session handler
  const handleStartEditSession = (sess: StudySession) => {
    setEditingSessionId(sess.id);
    setEditSubject(sess.subject);
    setEditCategory(sess.category);
    setEditDurationMins(Math.round(sess.durationSeconds / 60));
    setEditNotes(sess.notes || '');
  };

  const handleSaveEditSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSessionId) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === editingSessionId
          ? {
              ...s,
              subject: editSubject,
              category: editCategory,
              durationSeconds: Math.max(1, editDurationMins) * 60,
              notes: editNotes.trim() || undefined,
            }
          : s
      )
    );
    setEditingSessionId(null);
  };

  // Formatting helpers
  const formatTimeDigital = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  const formatHoursShort = (totalSec: number) => {
    const h = (totalSec / 3600).toFixed(1);
    return `${h}h`;
  };

  // Calculated Stats for Analytics Graphs
  const activeSecondsDisplay = mode === 'stopwatch' ? elapsedSeconds : countdownSeconds;
  const progressRatio = mode === 'timer' && initialCountdown > 0 ? (initialCountdown - countdownSeconds) / initialCountdown : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayTotalSeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalLifetimeSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Group by Subject for Graph
  const subjectTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    subjectTotals[s.subject] = (subjectTotals[s.subject] || 0) + s.durationSeconds;
  });
  const maxSubjectSeconds = Math.max(...Object.values(subjectTotals), 1);

  // Group by Category for Graph
  const categoryTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.durationSeconds;
  });
  const maxCategorySeconds = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-10">
      {/* 🚀 HIGH-TECH HUD STOPWATCH & TIMER CANVAS */}
      <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0A101D] via-[#070B14] to-[#04060B] shadow-2xl relative overflow-hidden">
        {/* Background Glowing Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
              <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span>HIGHTECH STUDY ENGINE</span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${isRunning ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50 animate-pulse' : isPaused ? 'bg-amber-950 text-amber-400 border border-amber-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                  {isRunning ? '● ACTIVE LIVE' : isPaused ? '❚❚ PAUSED' : 'STANDBY'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Precision time recording for UPSC Deep Work Sessions
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#05080E] border border-slate-800 font-mono text-xs">
            <button
              onClick={() => {
                if (isRunning) setIsRunning(false);
                setMode('stopwatch');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⏱️ Stopwatch
            </button>
            <button
              onClick={() => {
                if (isRunning) setIsRunning(false);
                setMode('timer');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'timer'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⏳ Timer
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg transition-colors border ${
                soundEnabled
                  ? 'text-cyan-400 border-cyan-500/40 bg-cyan-950/50'
                  : 'text-slate-500 border-slate-800 bg-slate-900'
              }`}
              title={soundEnabled ? 'Completion Sound FX ON' : 'Completion Sound FX OFF'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PRESET TIMER SELECTION (IF TIMER MODE) */}
        {mode === 'timer' && (
          <div className="flex flex-wrap items-center justify-center gap-2 my-4 relative z-10">
            {PRESET_TIMERS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset.seconds)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  initialCountdown === preset.seconds
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-[#080D18] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* MAIN TIMER DISPLAY DISK */}
        <div className="flex flex-col items-center justify-center my-6 relative z-10">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Circular Progress Outer Ring */}
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" viewBox="0 0 100 100">
              <circle
                className="text-slate-800/80"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
              <circle
                className="text-cyan-400 transition-all duration-300 ease-linear"
                strokeWidth="5"
                strokeDasharray={276.4}
                strokeDashoffset={
                  mode === 'timer'
                    ? 276.4 - 276.4 * progressRatio
                    : 276.4 - (276.4 * ((elapsedSeconds % 60) / 60))
                }
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
            </svg>

            {/* Inner HUD Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-auto">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                {mode === 'stopwatch' ? 'ELAPSED SESSION TIME' : 'REMAINING TIME'}
              </span>

              {/* Glowing Digital Digits */}
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] my-1">
                {formatTimeDigital(activeSecondsDisplay)}
              </div>

              {/* Action buttons under digits */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setIsEditingTime(true)}
                  className="px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-cyan-400" />
                  <span>Edit Time</span>
                </button>
              </div>
            </div>
          </div>

          {/* EDIT TIME MODAL/INLINE FORM */}
          {isEditingTime && (
            <form onSubmit={handleApplyCustomTime} className="mt-4 p-3.5 rounded-xl bg-[#090E1A] border border-cyan-500/40 shadow-2xl flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
              <span className="text-cyan-300 font-bold uppercase text-[11px]">Set Custom Time:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-12 px-2 py-1 rounded bg-[#030508] border border-slate-700 text-center text-white font-bold"
                  placeholder="HH"
                />
                <span>h</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-12 px-2 py-1 rounded bg-[#030508] border border-slate-700 text-center text-white font-bold"
                  placeholder="MM"
                />
                <span>m</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSecondsInput}
                  onChange={(e) => setCustomSecondsInput(e.target.value)}
                  className="w-12 px-2 py-1 rounded bg-[#030508] border border-slate-700 text-center text-white font-bold"
                  placeholder="SS"
                />
                <span>s</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTime(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* MAIN ACTION CONTROL BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {!isRunning && !isPaused && (
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black font-mono text-sm tracking-wider uppercase shadow-lg shadow-cyan-950/60 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START SESSION</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={handlePause}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-sm tracking-wider uppercase shadow-lg shadow-amber-950/60 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>PAUSE</span>
              </button>
            )}

            {isPaused && (
              <button
                onClick={handleResume}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-sm tracking-wider uppercase shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>RESUME</span>
              </button>
            )}

            {(isRunning || isPaused || activeSecondsDisplay !== (mode === 'stopwatch' ? 0 : initialCountdown)) && (
              <>
                <button
                  onClick={handleAddLap}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Record Lap Split"
                >
                  <Flag className="w-4 h-4 text-cyan-400" />
                  <span>SPLIT / LAP</span>
                </button>

                <button
                  onClick={handleOpenSaveDialog}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase shadow-lg shadow-purple-950 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4 text-purple-200" />
                  <span>STOP & SAVE SUMMARY</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Cancel & Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RESET</span>
                </button>
              </>
            )}
          </div>

          {/* LAPS SPLIT DISPLAY */}
          {laps.length > 0 && (
            <div className="mt-5 w-full max-w-md p-3 rounded-xl bg-[#080D18] border border-slate-800 font-mono text-xs">
              <div className="text-[10px] text-cyan-400 font-bold uppercase mb-2 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" />
                <span>Session Laps Recorded ({laps.length})</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {laps.map((lapSec, idx) => (
                  <div key={idx} className="flex justify-between items-center px-2 py-1 bg-[#04060A] rounded border border-slate-800/60">
                    <span className="text-slate-400">Lap #{idx + 1}</span>
                    <span className="text-white font-bold">{formatTimeDigital(lapSec)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAVE SESSION DIALOG MODAL */}
      {isSavingSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleConfirmSaveSession} className="glass-card p-6 rounded-2xl border border-cyan-500/50 max-w-md w-full space-y-4 bg-[#090E18] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-cyan-300 uppercase">Save Study Session Summary</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavingSession(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-center font-mono">
              <span className="text-xs text-slate-400 block uppercase">Logged Duration:</span>
              <span className="text-2xl font-black text-cyan-400">
                {formatTimeDigital(mode === 'stopwatch' ? elapsedSeconds : initialCountdown - countdownSeconds)}
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Subject</label>
              <select
                value={sessionSubject}
                onChange={(e) => setSessionSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#04060A] border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Activity Category</label>
              <select
                value={sessionCategory}
                onChange={(e) => setSessionCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#04060A] border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Session Notes / Key Learning</label>
              <textarea
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Completed Articles 14 to 18, made bullet notes on equality..."
                className="w-full px-3 py-2 rounded-lg bg-[#04060A] border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSavingSession(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-lg shadow-emerald-950"
              >
                Save Session Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📊 VISUAL ANALYTICS & GRAPH BREAKDOWN SECTION */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider">
              Study Time Visual Analytics & Session Graphs
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Today: <strong className="text-emerald-400 font-bold">{formatHoursShort(todayTotalSeconds)}</strong> ({todaySessions.length} sess)</span>
            <span>Total Logged: <strong className="text-cyan-400 font-bold">{formatHoursShort(totalLifetimeSeconds)}</strong></span>
          </div>
        </div>

        {/* 1. SUBJECT TIME DISTRIBUTION GRAPH (DYNAMIC BAR CHART) */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-300 uppercase flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Time Allocation by Subject (Hours)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Auto-generated from logs</span>
          </div>

          <div className="space-y-2 pt-1">
            {Object.keys(subjectTotals).length === 0 ? (
              <div className="text-center py-6 text-xs font-mono text-slate-500">
                No session logs recorded yet. Start the stopwatch above to generate graphs!
              </div>
            ) : (
              Object.entries(subjectTotals).map(([sub, totalSec]) => {
                const pct = Math.round((totalSec / maxSubjectSeconds) * 100);
                const hrs = (totalSec / 3600).toFixed(1);
                return (
                  <div key={sub} className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-200 font-bold">{sub}</span>
                      <span className="text-cyan-400">{hrs} hrs</span>
                    </div>
                    <div className="w-full bg-[#05070A] h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. ACTIVITY CATEGORY BREAKDOWN GRAPH */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-300 uppercase flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-400" />
              Activity Type Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 font-mono text-xs">
            {CATEGORIES.map((cat) => {
              const sec = categoryTotals[cat] || 0;
              const hrs = (sec / 3600).toFixed(1);
              return (
                <div key={cat} className="p-3 rounded-lg bg-[#080D18] border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400 block">{cat}</span>
                    <span className="text-sm font-bold text-purple-300">{hrs} hrs</span>
                  </div>
                  <Tag className="w-4 h-4 text-slate-600" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. RECENT SESSION LOGS TABLE & EDIT/DELETE FUNCTIONALITY */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-slate-300 uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Study Session Log History ({sessions.length})
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <p className="text-xs text-center font-mono text-slate-500 py-4">
                No session history yet.
              </p>
            ) : (
              sessions.map((sess) => (
                <div key={sess.id} className="p-3 rounded-xl bg-[#070B14] border border-slate-800/80 font-mono text-xs space-y-1.5">
                  {editingSessionId === sess.id ? (
                    /* EDIT INLINE FORM */
                    <form onSubmit={handleSaveEditSession} className="space-y-2 p-2 bg-[#04060A] rounded border border-cyan-500/40">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Subject</label>
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#0A0F18] border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as any)}
                            className="w-full px-2 py-1 rounded bg-[#0A0F18] border border-slate-700 text-xs text-white"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Duration (Mins)</label>
                          <input
                            type="number"
                            min="1"
                            value={editDurationMins}
                            onChange={(e) => setEditDurationMins(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 rounded bg-[#0A0F18] border border-slate-700 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Notes</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-[#0A0F18] border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button type="submit" className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer">
                          Save Edit
                        </button>
                        <button type="button" onClick={() => setEditingSessionId(null)} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* VIEW MODE */
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-300">{sess.subject}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                            {sess.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{sess.date} {sess.timestamp}</span>
                          {sess.notes && <span className="text-slate-300 font-sans italic">— {sess.notes}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-emerald-400">
                          {formatTimeDigital(sess.durationSeconds)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditSession(sess)}
                            className="p-1 text-slate-400 hover:text-cyan-300 rounded cursor-pointer"
                            title="Edit session log"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(sess.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                            title="Delete session log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
