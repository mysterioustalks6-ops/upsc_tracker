import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalyticsSummary, DailyLog } from '../types';
import { TrendingUp, Calendar, Zap, Target, BookOpen, Clock, ShieldCheck, Play, RotateCcw, ListTodo, Plus, CheckSquare, Square, Trash2, CheckCircle2, Sparkles, Trophy, Award, Flame, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyGoalItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

interface DashboardViewProps {
  analytics: AnalyticsSummary;
  logs: DailyLog[];
  onResetToToday?: () => void;
}

const DEFAULT_MICRO_GOALS: DailyGoalItem[] = [
  { id: 'goal_1', text: 'Read 5 pages of Polity / Core Book', completed: false, category: 'Reading' },
  { id: 'goal_2', text: 'Review 1 Map / Atlas region', completed: false, category: 'Mapping' },
  { id: 'goal_3', text: 'Write 1 GS Mains Answer', completed: false, category: 'Practice' },
  { id: 'goal_4', text: 'Solve 10 Prelims PYQs', completed: false, category: 'Practice' },
  { id: 'goal_5', text: 'Revise Current Affairs highlights', completed: false, category: 'Revision' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ analytics, logs, onResetToToday }) => {
  const maxTopicsLog = Math.max(...logs.map((l) => l.topics || 0), 10);
  const maxWorkScoreLog = Math.max(...logs.map((l) => l.workScore || 0), 10);

  // Daily Micro Goals State
  const [goals, setGoals] = useState<DailyGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem('upsc_os_daily_micro_goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load daily goals from localStorage', e);
    }
    return DEFAULT_MICRO_GOALS;
  });

  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Reading');

  // Hinglish Motivational Quotes List
  const HINGLISH_QUOTES = [
    { text: "Safar thoda mushkil hai par himmat nahi harunga, IAS ka sapna dekha hai to LBSNAA zaroor jaunga!", author: "UPSC Aspirant Spirit 🌟" },
    { text: "Log tumhari safalta dekhte hain, par uske peeche ki raaton ki mehnat aur sacrifices sirf tum jaante ho.", author: "LBSNAA Goal 📚" },
    { text: "Prelims ho ya Mains, har PYQ aur revision ek step aage le jata hai. Give your 100% today!", author: "Consistency Master ⚡" },
    { text: "Jab duniya so rahi hogi, tabhi tujhe jaag kar padhna hoga. Bada sapna dekha hai to mehnat bhi badi karni padegi.", author: "Focus Mode 🔥" },
    { text: "Revision hi topper aur aspirant ke beech ka asli farak hai. Discipline always beats motivation!", author: "Topper Mindset 🎯" },
    { text: "Musibatein aur doubts sabke raaste me aate hain, par jo jhukta nahi vahi IAS/IPS banta hai.", author: "Courage & Patience 🛡️" },
    { text: "Ek din tera naam bhi UPSC Final PDF List me hoga, bas aaj ka daily target complete kar!", author: "UPSC Dream 📜" },
    { text: "Time hi sabse bada weapon hai UPSC me. Har ek ghanta count karo, streak banaye rakho!", author: "Time Management ⏳" },
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % HINGLISH_QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [HINGLISH_QUOTES.length]);

  const handleNextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % HINGLISH_QUOTES.length);
  };

  useEffect(() => {
    try {
      localStorage.setItem('upsc_os_daily_micro_goals', JSON.stringify(goals));
    } catch (e) {
      console.warn('Failed to save daily goals', e);
    }
  }, [goals]);

  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal: DailyGoalItem = {
      id: `goal_${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      category: newGoalCategory,
    };
    setGoals((prev) => [...prev, newGoal]);
    setNewGoalText('');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleResetGoals = () => {
    if (confirm('Reset daily micro-goals to standard suggestions?')) {
      setGoals(DEFAULT_MICRO_GOALS);
    }
  };

  const [lastCelebratedPct, setLastCelebratedPct] = useState<number>(0);

  const fireCelebrationConfetti = (type: 'streak' | 'goals' | 'rank' | 'general' = 'general') => {
    try {
      if (type === 'streak') {
        confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.65 } });
        confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.65 } });
      } else if (type === 'goals') {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'] });
      } else {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'] });
      }
    } catch (e) {
      console.warn('Confetti trigger ignored:', e);
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Auto trigger confetti on hitting 100% daily goals or 7-day streak milestone
  useEffect(() => {
    if (progressPct === 100 && totalCount > 0 && lastCelebratedPct !== 100) {
      setLastCelebratedPct(100);
      fireCelebrationConfetti('goals');
    } else if (progressPct < 100) {
      setLastCelebratedPct(progressPct);
    }
  }, [progressPct, totalCount, lastCelebratedPct]);

  // Check milestone eligibility
  const isStreak7Reached = analytics.currentStreak >= 7;
  const isStreak3Reached = analytics.currentStreak >= 3;
  const isAllGoalsDone = progressPct === 100 && totalCount > 0;

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-6">
      {/* 🔥 HINGLISH MOTIVATIONAL QUOTE BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#0C0F19] to-orange-950/20 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group"
      >
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5 shadow-lg shadow-amber-950/40">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/40 uppercase font-bold tracking-wider shadow-sm">
                🔥 UPSC Hinglish Motivation
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs font-mono text-amber-400/90 font-semibold"
                >
                  {HINGLISH_QUOTES[currentQuoteIndex].author}
                </motion.span>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="text-sm sm:text-base font-sans font-semibold text-slate-100 italic leading-relaxed"
              >
                "{HINGLISH_QUOTES[currentQuoteIndex].text}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={handleNextQuote}
          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0 self-end sm:self-center z-10 active:scale-95 shadow-lg"
        >
          <span>Agla Quote ➡️</span>
        </button>

        {/* 10-second visual timer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-950/50 overflow-hidden">
          <div
            key={currentQuoteIndex}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-[10000ms] ease-linear w-full origin-left"
          />
        </div>
      </motion.div>

      {/* QUICK START BANNER */}
      {onResetToToday && (
        <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/60 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
                START PREPARATION TODAY (AAJ SE SHURU)
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono uppercase font-bold">
                DAY 1 RESET
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Agar aap aaj se syllabus tracking bilkul fresh shuru karna chahte hain, toh yahan click karke saari purani timeline zero (0) karke aaj se DAY 1 launch karein!
            </p>
          </div>
          <button
            onClick={onResetToToday}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-xs cursor-pointer shadow-xl shadow-emerald-950/50 uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Prep Today (Day 1)</span>
          </button>
        </div>
      )}

      {/* 🏆 MILESTONES & STREAK CELEBRATION SHOWCASE */}
      <div className="p-5 sm:p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-[#0A0D18] to-indigo-950/20 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-xs sm:text-sm font-bold font-mono text-amber-400 uppercase tracking-wider">
              Preparation Milestones & Streaks
            </span>
          </div>

          <button
            onClick={() => fireCelebrationConfetti('general')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950 transition-all cursor-pointer border border-purple-400/30 hover:scale-105 active:scale-95"
          >
            <PartyPopper className="w-4 h-4 text-amber-300" />
            <span>Celebrate Milestone 🎉</span>
          </button>
        </div>

        {/* BADGES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Badge 1: 7-Day Streak */}
          <div
            onClick={() => {
              fireCelebrationConfetti('streak');
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isStreak7Reached
                ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 shadow-xl shadow-amber-950/40 hover:scale-[1.02]'
                : 'bg-[#080D18] border-slate-800/80 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Flame className={`w-6 h-6 ${isStreak7Reached ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/10 uppercase font-bold">
                {analytics.currentStreak}/7 Days
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs sm:text-sm font-bold block">7-Day Streak Master</span>
              <span className="text-[10px] font-mono text-slate-400">
                {isStreak7Reached ? '🎉 Milestone Unlocked!' : '3+ Days to unlock'}
              </span>
            </div>
          </div>

          {/* Badge 2: 3-Day Momentum */}
          <div
            onClick={() => {
              fireCelebrationConfetti('streak');
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isStreak3Reached
                ? 'bg-orange-950/30 border-orange-500/50 text-orange-300 shadow-xl shadow-orange-950/40 hover:scale-[1.02]'
                : 'bg-[#080D18] border-slate-800/80 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Zap className={`w-6 h-6 ${isStreak3Reached ? 'text-orange-400' : 'text-slate-600'}`} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/10 uppercase font-bold">
                3-Day Streak
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs sm:text-sm font-bold block">3-Day Momentum</span>
              <span className="text-[10px] font-mono text-slate-400">
                {isStreak3Reached ? '⚡ Momentum Active' : 'Consistent study streak'}
              </span>
            </div>
          </div>

          {/* Badge 3: 100% Micro-Goals Crusher */}
          <div
            onClick={() => {
              fireCelebrationConfetti('goals');
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isAllGoalsDone
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 shadow-xl shadow-emerald-950/40 hover:scale-[1.02]'
                : 'bg-[#080D18] border-slate-800/80 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Award className={`w-6 h-6 ${isAllGoalsDone ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/10 uppercase font-bold">
                {progressPct}% Done
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs sm:text-sm font-bold block">100% Daily Crusher</span>
              <span className="text-[10px] font-mono text-slate-400">
                {isAllGoalsDone ? '🎯 All Goals Met Today!' : 'Complete today\'s tasks'}
              </span>
            </div>
          </div>

          {/* Badge 4: Cadet Rank */}
          <div
            onClick={() => {
              fireCelebrationConfetti('rank');
            }}
            className="p-4 rounded-2xl border bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-xl shadow-purple-950/40 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Trophy className="w-6 h-6 text-purple-400" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/10 uppercase font-bold">
                Lvl {analytics.rankLevel}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xs sm:text-sm font-bold block">{analytics.rankTitle}</span>
              <span className="text-[10px] font-mono text-slate-400">
                Rank Badge ({analytics.rankXpPct}% XP)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 DAILY GOALS & MICRO-TASKS SECTION */}
      <div className="p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4 bg-gradient-to-br from-[#090E1A]/90 to-[#050812]/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ListTodo className="w-5 h-5 text-cyan-400" />
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
              Today's Micro-Goals
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
              {completedCount}/{totalCount} Completed ({progressPct}%)
            </span>
          </div>

          <button
            onClick={handleResetGoals}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 underline cursor-pointer transition-colors"
          >
            Reset Default Goals
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-[#05070A] rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* GOALS CHECKLIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => handleToggleGoal(goal.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                goal.completed
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400'
                  : 'bg-[#0A0F18]/80 border-slate-800 hover:border-slate-700 text-slate-200 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {goal.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span
                  className={`text-xs sm:text-sm font-sans truncate ${
                    goal.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {goal.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {goal.category && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {goal.category}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGoal(goal.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ADD MICRO-GOAL FORM */}
        <form onSubmit={handleAddGoal} className="flex flex-wrap items-center gap-2.5 pt-2">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Add micro-goal (e.g. Read 5 pages, Review map)..."
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-[#05070A] border border-slate-800 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <select
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#05070A] border border-slate-800 text-xs sm:text-sm font-mono text-slate-300"
          >
            <option value="Reading">Reading</option>
            <option value="Practice">Practice</option>
            <option value="Revision">Revision</option>
            <option value="Mapping">Mapping</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </form>
      </div>

      {/* 1. MASTER WORKLOAD OVERVIEW - KPI GRID WITH LEFT BORDER ACCENTS */}
      <div>
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Master Workload Overview</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 border-l-4 border-l-cyan-500 shadow-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1 font-bold">Total Syllabus Hours</span>
            <span className="text-xl sm:text-3xl font-black text-white font-mono">
              {analytics.totalWorkload.toFixed(0)} <span className="text-xs text-slate-400 font-normal">hrs</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 block mt-1">({analytics.totalTopicsCount} Total Topics)</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 border-l-4 border-l-emerald-500 shadow-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1 font-bold">Completed Hours</span>
            <span className="text-xl sm:text-3xl font-black emerald-glow font-mono">
              {analytics.completedWork.toFixed(0)} <span className="text-xs text-slate-400 font-normal">hrs</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 block mt-1">({analytics.completedTopicsCount} Topics Done)</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 border-l-4 border-l-orange-500 shadow-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1 font-bold">Remaining Hours</span>
            <span className="text-xl sm:text-3xl font-black orange-glow font-mono">
              {analytics.remainingWork.toFixed(0)} <span className="text-xs text-slate-400 font-normal">hrs</span>
            </span>
            <span className="text-[10px] font-mono text-orange-400 block mt-1">({analytics.totalTopicsCount - analytics.completedTopicsCount} Topics Left)</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 border-l-4 border-l-purple-500 shadow-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1 font-bold">Avg Daily Study Speed</span>
            <span className="text-xl sm:text-3xl font-black purple-glow font-mono">
              {analytics.weightedProductivity.toFixed(1)} <span className="text-xs text-slate-400 font-normal">hrs/day</span>
            </span>
            <span className="text-[10px] font-mono text-purple-400 block mt-1">(Real-time Dynamic Velocity)</span>
          </div>
        </div>
      </div>

      {/* 2. PERFORMANCE TRENDS */}
      <div>
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Performance Trends</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topics Completed History */}
          <div className="glass-card p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-2 uppercase">
              Topics Completed History (Daily Logs)
            </div>
            <div className="h-32 flex items-end gap-1.5 pt-4 pb-1 px-2 bg-[#0A0F18] rounded-lg border border-slate-800">
              {logs.length > 0 ? (
                logs.slice(-10).map((l, idx) => {
                  const pct = Math.max(8, (l.topics / maxTopicsLog) * 100);
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      <div
                        className="w-full max-w-[20px] rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-400 group-hover:to-cyan-200 transition-all shadow-md shadow-cyan-950"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-500 mt-1 truncate w-full text-center">
                        {l.date.slice(5)}
                      </span>
                      {/* Tooltip */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                        {l.topics} Topics
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 text-xs font-mono m-auto">
                  No log history recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Work Score History */}
          <div className="glass-card p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-2 uppercase">
              Daily Work Score History
            </div>
            <div className="h-32 flex items-end gap-1.5 pt-4 pb-1 px-2 bg-[#0A0F18] rounded-lg border border-slate-800">
              {logs.length > 0 ? (
                logs.slice(-10).map((l, idx) => {
                  const pct = Math.max(8, (l.workScore / maxWorkScoreLog) * 100);
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      <div
                        className="w-full max-w-[20px] rounded-t bg-gradient-to-t from-orange-600 to-amber-400 group-hover:from-orange-400 group-hover:to-amber-200 transition-all shadow-md shadow-orange-950"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-500 mt-1 truncate w-full text-center">
                        {l.date.slice(5)}
                      </span>
                      {/* Tooltip */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                        Score: {l.workScore}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 text-xs font-mono m-auto">
                  No log history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAYS & STREAKS */}
      <div>
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Days & Streaks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono text-white">{analytics.activeDays}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Active Days
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono text-rose-400">{analytics.missedDays}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Missed Days
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono cyan-glow">{analytics.currentStreak}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Current Streak
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono purple-glow">
              {analytics.longestStreak}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Longest Streak
            </div>
          </div>
        </div>
      </div>

      {/* 4. REQUIRED DAILY PACE */}
      <div>
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Required Daily Pace (To Meet Predicted ETA)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3.5 rounded-xl border border-cyan-500/30 text-center">
            <div className="text-lg font-black font-mono cyan-glow">
              {analytics.requiredDailyWorkScore.toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Req. Work Score
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono text-white">
              {analytics.requiredDailyLectures.toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Req. Lectures
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono emerald-glow">
              {analytics.requiredDailyBookHrs.toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Req. Book Hrs
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl text-center">
            <div className="text-lg font-black font-mono orange-glow">
              {analytics.requiredDailyRevHrs.toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
              Req. Rev Hrs
            </div>
          </div>
        </div>
      </div>

      {/* 5. DETAILED CATEGORY STATISTICS TABLE */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-2xl">
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Detailed Category Statistics</span>
        </div>

        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#0A0F18] text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3 font-semibold uppercase text-[10px]">Category</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-right">Target / Total</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-right">Completed</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-right">Remaining</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-right">% Done</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-semibold">Lectures</td>
              <td className="px-4 py-3 text-right">1,800</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-bold">{analytics.activeLectures}</td>
              <td className="px-4 py-3 text-right orange-glow">
                {Math.max(0, 1800 - analytics.activeLectures)}
              </td>
              <td className="px-4 py-3 text-right">
                {((analytics.activeLectures / 1800) * 100).toFixed(1)}%
              </td>
            </tr>

            <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-semibold">Video Hours</td>
              <td className="px-4 py-3 text-right">4,500 h</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                {analytics.activeVideoHrs.toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right orange-glow">
                {Math.max(0, 4500 - analytics.activeVideoHrs).toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right">
                {((analytics.activeVideoHrs / 4500) * 100).toFixed(1)}%
              </td>
            </tr>

            <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-semibold">Book Reading Hours</td>
              <td className="px-4 py-3 text-right">1,500 h</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                {analytics.activeBookHrs.toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right orange-glow">
                {Math.max(0, 1500 - analytics.activeBookHrs).toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right">
                {((analytics.activeBookHrs / 1500) * 100).toFixed(1)}%
              </td>
            </tr>

            <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-semibold">Revision Hours</td>
              <td className="px-4 py-3 text-right">500 h</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                {analytics.activeRevHrs.toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right orange-glow">
                {Math.max(0, 500 - analytics.activeRevHrs).toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right">
                {((analytics.activeRevHrs / 500) * 100).toFixed(1)}%
              </td>
            </tr>

            <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-semibold">Answer Writing Hours</td>
              <td className="px-4 py-3 text-right">500 h</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                {analytics.activeAWHrs.toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right orange-glow">
                {Math.max(0, 500 - analytics.activeAWHrs).toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right">
                {((analytics.activeAWHrs / 500) * 100).toFixed(1)}%
              </td>
            </tr>

            <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-semibold">Current Affairs Hours</td>
              <td className="px-4 py-3 text-right">500 h</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                {analytics.activeCAHrs.toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right orange-glow">
                {Math.max(0, 500 - analytics.activeCAHrs).toFixed(1)} h
              </td>
              <td className="px-4 py-3 text-right">
                {((analytics.activeCAHrs / 500) * 100).toFixed(1)}%
              </td>
            </tr>

            <tr className="bg-[#0A0F18]/80 font-bold">
              <td className="px-4 py-3 text-cyan-300">Syllabus Topics Total</td>
              <td className="px-4 py-3 text-right">{analytics.totalTopicsCount}</td>
              <td className="px-4 py-3 text-right text-emerald-400">
                {analytics.completedTopicsCount}
              </td>
              <td className="px-4 py-3 text-right orange-glow">
                {analytics.totalTopicsCount - analytics.completedTopicsCount}
              </td>
              <td className="px-4 py-3 text-right text-cyan-300">{analytics.topicProgressPct}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
