import React from 'react';
import { motion } from 'motion/react';
import { AnalyticsSummary, AppStateData, DailyInputs } from '../types';
import { Brain, Flame, Minus, Plus, Award, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface SidebarHudProps {
  analytics: AnalyticsSummary;
  stateData: AppStateData;
  onAdjDailyInput: (key: keyof DailyInputs, delta: number) => void;
}

export const SidebarHud: React.FC<SidebarHudProps> = ({
  analytics,
  stateData,
  onAdjDailyInput
}) => {
  const d = stateData.daily;

  return (
    <aside className="w-full flex flex-col gap-4 shrink-0">
      {/* 1. DYNAMIC AI ETA ENGINE */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 backdrop-blur-xl shadow-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold cyan-glow font-mono uppercase tracking-wider">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Dynamic AI ETA Engine</span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase font-bold tracking-widest shadow-sm">
            Live
          </span>
        </div>

        <div className="text-center py-3.5 my-1 bg-[#040711] rounded-xl border border-slate-800/90 shadow-inner relative overflow-hidden">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            Predicted Finish Target
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono my-1 tracking-tight gradient-text-genz">
            {analytics.estimatedFinishDate}
          </div>
          <div className="text-xs font-bold cyan-glow font-mono flex items-center justify-center gap-1">
            <span>⚡ {analytics.remainingDays} Days Remaining</span>
          </div>

          <div className="mt-2.5 mx-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300/90 bg-cyan-950/20 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 leading-relaxed">
            💡 <strong>SUB-TOPIC TIMELINE:</strong> Topic Time = Sub-topics × 2.5 Hrs. Topic mark complete karte hi topic ka total calculated time remaining time se automatically minus ho jata hai aur Target Date paas aati hai!
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono mt-3.5">
          <div className="flex justify-between items-center px-3 py-1.5 rounded-xl bg-[#040711]/80 border border-slate-800/80">
            <span className="text-slate-400">📊 Progress:</span>
            <span className="font-black emerald-glow text-sm">
              {analytics.overallProgressPct.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center px-3 py-1.5 rounded-xl bg-[#040711]/80 border border-slate-800/80">
            <span className="text-slate-400">⚠️ Recovery:</span>
            <span
              className={`font-bold ${
                analytics.isRecoveryMode ? 'text-rose-400 font-black animate-pulse' : 'text-emerald-400'
              }`}
            >
              {analytics.isRecoveryMode ? 'ACTIVE (Pace Drop)' : 'OFF (Optimal)'}
            </span>
          </div>

          <div className="flex justify-between items-center px-3 py-1.5 rounded-xl bg-[#040711]/80 border border-slate-800/80">
            <span className="text-slate-400">🔥 Streak:</span>
            <span className="font-bold text-pink-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-pink-500/20 text-pink-400" />
              {analytics.currentStreak} Days
            </span>
          </div>

          <div className="flex justify-between items-center px-3 py-1.5 rounded-xl bg-[#040711]/80 border border-slate-800/80">
            <span className="text-slate-400">⏱️ Target/Day:</span>
            <span className="font-black orange-glow text-xs">
              {analytics.requiredDailyTotalHours.toFixed(1)} hrs
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. TOPIC PROGRESS RING */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 backdrop-blur-xl text-center relative shadow-xl"
      >
        <div className="text-xs font-bold cyan-glow font-mono uppercase tracking-wider mb-2.5">
          📖 Syllabus Progress Ring
        </div>

        <div className="relative w-24 h-24 mx-auto my-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-800/80"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-cyan-400 transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * analytics.topicProgressPct) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-base font-black text-white font-mono">
            {analytics.topicProgressPct}%
          </div>
        </div>

        <div className="text-xs text-slate-300 font-mono mt-1 font-bold">
          {analytics.completedTopicsCount} / {analytics.totalTopicsCount} Syllabus Topics Done
        </div>
      </motion.div>

      {/* 3. DAILY EFFORT & REWARDS LOGGER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-amber-500/30 backdrop-blur-xl shadow-xl"
      >
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
          <div className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>🏆 Daily Effort & Rewards Logger</span>
          </div>
          <span className="text-[10px] text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
            +10 XP / Hr
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
          {/* Lectures */}
          <div className="p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-sky-400 mb-1.5">Lectures</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjDailyInput('lectures', -1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-white text-sm">{d.lectures}</span>
              <button
                onClick={() => onAdjDailyInput('lectures', 1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Hours */}
          <div className="p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-purple-400 mb-1.5">Video Hrs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjDailyInput('videoHrs', -0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-white text-sm">{d.videoHrs.toFixed(1)}</span>
              <button
                onClick={() => onAdjDailyInput('videoHrs', 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Book Hours */}
          <div className="p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Book Hrs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjDailyInput('bookHrs', -0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-white text-sm">{d.bookHrs.toFixed(1)}</span>
              <button
                onClick={() => onAdjDailyInput('bookHrs', 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Revision Hours */}
          <div className="p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-amber-400 mb-1.5">Rev Hrs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjDailyInput('revHrs', -0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-white text-sm">{d.revHrs.toFixed(1)}</span>
              <button
                onClick={() => onAdjDailyInput('revHrs', 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Answer Writing */}
          <div className="p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-pink-400 mb-1.5">Ans Wrt Hrs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjDailyInput('awHrs', -0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-white text-sm">{d.awHrs.toFixed(1)}</span>
              <button
                onClick={() => onAdjDailyInput('awHrs', 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Affairs */}
          <div className="p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-rose-400 mb-1.5">Curr Aff Hrs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjDailyInput('caHrs', -0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-white text-sm">{d.caHrs.toFixed(1)}</span>
              <button
                onClick={() => onAdjDailyInput('caHrs', 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mock Test */}
          <div className="col-span-2 p-2.5 rounded-xl bg-[#040711] border border-slate-800/80 flex flex-col items-center hover:border-slate-700 transition-all">
            <span className="text-[10px] uppercase font-bold text-amber-300 mb-1.5">Mock Test Hrs</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAdjDailyInput('mockHrs', -0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-white text-sm">{d.mockHrs.toFixed(1)}</span>
              <button
                onClick={() => onAdjDailyInput('mockHrs', 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold border border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-slate-800 text-center font-mono text-xs flex items-center justify-between">
          <span className="text-slate-400 font-bold uppercase text-[11px]">Daily Work Score:</span>
          <span className="font-black orange-glow text-base">
            {analytics.todayWorkScore.toFixed(1)}
          </span>
        </div>
      </motion.div>

      {/* 4. GAMIFICATION & CIVIL SERVICE RANK */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-amber-500/30 backdrop-blur-xl shadow-xl"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold orange-glow uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-orange-500" />
            Civil Services Rank
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-slate-950 font-mono uppercase tracking-wider">
            LVL {analytics.rankLevel}
          </span>
        </div>

        <div className="text-center font-mono font-black orange-glow text-sm tracking-wide uppercase my-1.5">
          {analytics.rankTitle}
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5 uppercase font-bold">
          <span>XP: <strong className="text-white">{Math.floor(stateData.netXP)}</strong></span>
          <span>Level: {Math.floor(analytics.rankXpPct)}%</span>
        </div>

        <div className="w-full bg-[#040711] h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 h-full transition-all duration-500"
            style={{ width: `${analytics.rankXpPct}%` }}
          />
        </div>
      </motion.div>
    </aside>
  );
};
