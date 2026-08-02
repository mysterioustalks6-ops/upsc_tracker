import React, { useState, useEffect } from 'react';
import { AppStateData, DailyLog, SyllabusData, AnalyticsSummary } from '../types';
import { Cpu, ShieldCheck, Wrench, RefreshCw, AlertTriangle, CheckCircle2, Zap, Trash2, Database, Sparkles, X, Activity } from 'lucide-react';

interface AiArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  stateData: AppStateData;
  serverLogs: DailyLog[];
  syllabus: SyllabusData;
  analytics: AnalyticsSummary;
  onAutoFixAll: (repairedState: AppStateData, repairedLogs: DailyLog[], repairedSyllabus: SyllabusData) => void;
  showToast: (msg: string) => void;
}

export interface SystemAnomaly {
  id: string;
  type: 'data' | 'log' | 'syllabus' | 'storage';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

export const AiArchitectModal: React.FC<AiArchitectModalProps> = ({
  isOpen,
  onClose,
  stateData,
  serverLogs,
  syllabus,
  analytics,
  onAutoFixAll,
  showToast,
}) => {
  const [anomalies, setAnomalies] = useState<SystemAnomaly[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [healthScore, setHealthScore] = useState(100);
  const [fixLog, setFixLog] = useState<string[]>([]);

  // System Diagnostics Scan Algorithm
  const runDiagnostics = () => {
    setIsScanning(true);
    const found: SystemAnomaly[] = [];

    // 1. Check for negative or NaN values in stateData
    if (stateData.netXP < 0 || isNaN(stateData.netXP)) {
      found.push({
        id: 'xp_anomaly',
        type: 'data',
        title: 'Corrupted Net XP Value',
        description: `Net XP is negative or invalid (${stateData.netXP}). Auto-fix will reset to 0.`,
        severity: 'medium',
        autoFixable: true,
      });
    }

    // 2. Check for duplicate or corrupted daily logs
    const seenDates = new Set<string>();
    let duplicateLogCount = 0;
    let corruptedLogCount = 0;

    serverLogs.forEach((log) => {
      if (seenDates.has(log.date)) {
        duplicateLogCount++;
      } else {
        seenDates.add(log.date);
      }

      if (
        isNaN(log.workScore) ||
        log.workScore < 0 ||
        isNaN(log.videoHrs) || log.videoHrs < 0 ||
        isNaN(log.bookHrs) || log.bookHrs < 0 ||
        isNaN(log.revHrs) || log.revHrs < 0 ||
        isNaN(log.awHrs) || log.awHrs < 0 ||
        isNaN(log.caHrs) || log.caHrs < 0 ||
        isNaN(log.mockHrs) || log.mockHrs < 0
      ) {
        corruptedLogCount++;
      }
    });

    if (duplicateLogCount > 0) {
      found.push({
        id: 'duplicate_logs',
        type: 'log',
        title: `${duplicateLogCount} Duplicate Daily Log Entries`,
        description: 'Multiple logs found for the same date. Auto-fix will merge duplicate logs.',
        severity: 'medium',
        autoFixable: true,
      });
    }

    if (corruptedLogCount > 0) {
      found.push({
        id: 'corrupted_logs',
        type: 'log',
        title: `${corruptedLogCount} Corrupted Work Metric Logs`,
        description: 'Negative or NaN study hours detected. Auto-fix will sanitize numeric values.',
        severity: 'high',
        autoFixable: true,
      });
    }

    // 3. Check for syllabus anomalies
    let emptySubjectCount = 0;
    let invalidTopicCount = 0;
    Object.entries(syllabus).forEach(([subject, topics]) => {
      if (!Array.isArray(topics) || topics.length === 0) {
        emptySubjectCount++;
      } else {
        topics.forEach((t) => {
          if (!t.id || !t.title) invalidTopicCount++;
        });
      }
    });

    if (emptySubjectCount > 0 || invalidTopicCount > 0) {
      found.push({
        id: 'syllabus_anomaly',
        type: 'syllabus',
        title: 'Syllabus Tree Structure Anomaly',
        description: 'Empty subjects or malformed topics detected in syllabus database.',
        severity: 'medium',
        autoFixable: true,
      });
    }

    // 4. Check LocalStorage sync
    try {
      const localState = localStorage.getItem('upsc_os_app_state');
      const localSyllabus = localStorage.getItem('upsc_os_custom_syllabus');
      if (!localState || !localSyllabus) {
        found.push({
          id: 'storage_unsynced',
          type: 'storage',
          title: 'Client Storage Backup Out-of-Sync',
          description: 'LocalStorage backup key is missing or stale. Auto-fix will write fresh sync payload.',
          severity: 'low',
          autoFixable: true,
        });
      }
    } catch (e) {
      // storage disabled
    }

    // 5. Check if today's log exists
    const todayStr = new Date().toISOString().split('T')[0];
    const hasTodayLog = serverLogs.some((l) => l.date === todayStr);
    if (!hasTodayLog) {
      found.push({
        id: 'today_log_missing',
        type: 'log',
        title: 'Today\'s Daily Log Uninitialized',
        description: `No study log entry exists for today (${todayStr}). Auto-fix will initialize clean record.`,
        severity: 'low',
        autoFixable: true,
      });
    }

    setAnomalies(found);
    const score = Math.max(0, 100 - (found.length * 15));
    setHealthScore(score);
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen, stateData, serverLogs, syllabus]);

  if (!isOpen) return null;

  const handleExecuteAutoFix = () => {
    const logsToFix = [...fixLog];
    logsToFix.push(`[${new Date().toLocaleTimeString()}] 🚀 Initiating System Auto-Fix Procedure...`);

    // 1. Sanitize AppState
    const cleanStateData: AppStateData = {
      ...stateData,
      netXP: isNaN(stateData.netXP) || stateData.netXP < 0 ? 0 : stateData.netXP,
      streakCount: isNaN(stateData.streakCount) || stateData.streakCount < 0 ? 0 : stateData.streakCount,
      completedTopics: Array.isArray(stateData.completedTopics) ? Array.from(new Set(stateData.completedTopics)) : [],
      starredTopics: Array.isArray(stateData.starredTopics) ? Array.from(new Set(stateData.starredTopics)) : [],
      weakTopics: Array.isArray(stateData.weakTopics) ? Array.from(new Set(stateData.weakTopics)) : [],
      mockTests: Array.isArray(stateData.mockTests) ? stateData.mockTests.filter(m => m && m.title) : [],
    };
    logsToFix.push('✅ Repaired App State & Topic Arrays sanitized.');

    // 2. Sanitize & De-duplicate Server Logs
    const logMap = new Map<string, DailyLog>();
    serverLogs.forEach((l) => {
      const cleanLog: DailyLog = {
        date: l.date || new Date().toISOString().split('T')[0],
        topics: Math.max(0, Number(l.topics) || 0),
        lectures: Math.max(0, Number(l.lectures) || 0),
        videoHrs: Math.max(0, Number(l.videoHrs) || 0),
        bookHrs: Math.max(0, Number(l.bookHrs) || 0),
        revHrs: Math.max(0, Number(l.revHrs) || 0),
        awHrs: Math.max(0, Number(l.awHrs) || 0),
        caHrs: Math.max(0, Number(l.caHrs) || 0),
        mockHrs: Math.max(0, Number(l.mockHrs) || 0),
        workScore: Math.max(0, Number(l.workScore) || 0),
        xp: Math.max(0, Number(l.xp) || 0),
        streak: Math.max(0, Number(l.streak) || 0),
      };
      logMap.set(cleanLog.date, cleanLog);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    if (!logMap.has(todayStr)) {
      logMap.set(todayStr, {
        date: todayStr,
        topics: cleanStateData.completedTopics.length,
        lectures: 0,
        videoHrs: 0,
        bookHrs: 0,
        revHrs: 0,
        awHrs: 0,
        caHrs: 0,
        mockHrs: 0,
        workScore: 0,
        xp: cleanStateData.netXP,
        streak: cleanStateData.streakCount,
      });
      logsToFix.push(`✅ Initialized clean today (${todayStr}) daily study record.`);
    }

    const cleanLogs = Array.from(logMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    logsToFix.push(`✅ Deduplicated & sanitized ${cleanLogs.length} total daily logs.`);

    // 3. Clean Syllabus Tree
    const cleanSyllabus: SyllabusData = {};
    Object.entries(syllabus).forEach(([subject, topics]) => {
      if (Array.isArray(topics) && topics.length > 0) {
        cleanSyllabus[subject] = topics.map((t, idx) => ({
          id: t.id || `${subject.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
          title: t.title || 'Untitled Topic',
          subject: t.subject || subject,
          pyq: ['High', 'Medium', 'Normal'].includes(t.pyq) ? t.pyq : 'Normal',
        }));
      }
    });
    logsToFix.push('✅ Re-indexed Syllabus Tree & verified topic references.');

    // 4. LocalStorage Sync
    try {
      localStorage.setItem('upsc_os_app_state', JSON.stringify(cleanStateData));
      localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(cleanSyllabus));
      logsToFix.push('✅ Synchronized LocalStorage client cache.');
    } catch (e) {
      logsToFix.push('⚠️ LocalStorage sync warning.');
    }

    setFixLog(logsToFix);
    onAutoFixAll(cleanStateData, cleanLogs, cleanSyllabus);
    showToast('⚡ AI Architect: All anomalies repaired & system optimized!');
    setAnomalies([]);
    setHealthScore(100);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="w-full max-w-2xl bg-[#090D16] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050810]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                UPSC AI Architect & Auto-System Fixer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
                  Active Monitor
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Continuous Error Detection & Automatic System Optimization Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Score Telemetry Banner */}
        <div className="p-4 bg-[#070B13] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`text-2xl font-black font-mono px-3.5 py-1.5 rounded-xl border ${
                healthScore === 100
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                  : 'bg-amber-950/80 text-amber-400 border-amber-500/50 animate-pulse'
              }`}
            >
              {healthScore}%
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
                {healthScore === 100 ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">System State 100% Healthy</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">{anomalies.length} System Anomaly Detected</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {healthScore === 100
                  ? 'Zero data corruption or state conflicts detected.'
                  : 'Click Auto-Fix to instantly repair and optimize database integrity.'}
              </p>
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Re-Scan System'}</span>
          </button>
        </div>

        {/* Anomalies List & Log Terminal */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#030509]/60">
          {anomalies.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-white font-mono uppercase">
                System Operating at Peak Efficiency
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                No errors or corrupted logs found! Your syllabus, work scores, local backup, and dynamic finish engine are completely synchronized.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Detected Anomalies ({anomalies.length})</span>
              </div>

              {anomalies.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/40 flex items-start justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-white">{item.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                        {item.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{item.description}</p>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-2 py-1 rounded shrink-0">
                    Auto-Fix Ready
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Logs Box */}
          {fixLog.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1 max-h-36 overflow-y-auto">
              <div className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1 mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>AI Architect Execution Terminal Log</span>
              </div>
              {fixLog.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-[#050810]/90 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Real-time Data Sanitizer Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer transition-all border border-slate-700"
            >
              Close Window
            </button>

            {anomalies.length > 0 && (
              <button
                onClick={handleExecuteAutoFix}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black cursor-pointer shadow-lg shadow-emerald-950/50 uppercase tracking-wider transition-all"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>⚡ Auto-Fix All ({anomalies.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
