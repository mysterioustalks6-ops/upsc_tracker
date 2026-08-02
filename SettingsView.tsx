import React, { useState } from 'react';
import { AppConfig, AppStateData, DailyLog, AnalyticsSummary, SyllabusData } from '../types';
import { Settings, Download, Upload, RefreshCw, RotateCcw, BookOpen, Plus, Check } from 'lucide-react';
import { GoogleSheetsSync } from './GoogleSheetsSync';
import { DEFAULT_SYLLABUS } from '../data/defaultSyllabus';

interface SettingsViewProps {
  config: AppConfig;
  stateData: AppStateData;
  logs: DailyLog[];
  analytics: AnalyticsSummary;
  onUpdateConfig: (key: keyof AppConfig, value: number) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetState: () => void;
  onResetToToday: () => void;
  onUpdateSyllabus: (newSyllabus: SyllabusData, isReset?: boolean) => void;
  onImportSheetData: (logs: DailyLog[], mocks: any[], topics: string[], syllabus?: SyllabusData) => void;
  canUndo?: boolean;
  onUndoLastAction?: () => void;
}

export interface ImportValidationResult {
  isValid: boolean;
  sanitizedLogs: DailyLog[];
  sanitizedMocks: any[];
  sanitizedTopics: string[];
  sanitizedSyllabus?: SyllabusData;
  validationErrors: string[];
}

/**
 * Data integrity validation helper for imported Google Sheet / JSON data.
 * Checks timestamps for valid date formatting, sanitizes numeric fields (NaN/null/undefined -> 0),
 * and validates syllabus/topic structures to prevent application crashes.
 */
export const validateAndSanitizeImportData = (
  rawLogs: any[],
  rawMocks: any[],
  rawTopics: any[],
  rawSyllabus?: any
): ImportValidationResult => {
  const errors: string[] = [];

  // Helper to validate and normalize ISO / Date string
  const getValidDateStr = (rawVal: any, fallbackDate: string): string => {
    if (!rawVal) return fallbackDate;
    const str = String(rawVal).trim();
    if (!str) return fallbackDate;
    const timestamp = Date.parse(str);
    if (isNaN(timestamp)) {
      return fallbackDate;
    }
    return str;
  };

  // Helper to ensure numeric fields are valid finite numbers
  const sanitizeNumber = (val: any, defaultVal = 0): number => {
    if (val === null || val === undefined || val === '') return defaultVal;
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) {
      return defaultVal;
    }
    return Math.max(0, num);
  };

  // 1. Sanitize & Validate Daily Logs
  const sanitizedLogs: DailyLog[] = [];
  if (Array.isArray(rawLogs)) {
    rawLogs.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Log entry #${index + 1} was ignored because it is not a valid object.`);
        return;
      }

      // Validate date
      const fallbackToday = new Date().toISOString().split('T')[0];
      const validDate = getValidDateStr(item.date, fallbackToday);
      if (item.date && validDate !== String(item.date).trim()) {
        errors.push(`Log entry #${index + 1} had an invalid date (${item.date}). Normalized to ${validDate}.`);
      }

      sanitizedLogs.push({
        date: validDate,
        topics: sanitizeNumber(item.topics),
        lectures: sanitizeNumber(item.lectures),
        videoHrs: sanitizeNumber(item.videoHrs),
        bookHrs: sanitizeNumber(item.bookHrs),
        revHrs: sanitizeNumber(item.revHrs),
        awHrs: sanitizeNumber(item.awHrs),
        caHrs: sanitizeNumber(item.caHrs),
        mockHrs: sanitizeNumber(item.mockHrs),
        workScore: sanitizeNumber(item.workScore),
        xp: sanitizeNumber(item.xp),
        streak: sanitizeNumber(item.streak),
      });
    });
  }

  // 2. Sanitize & Validate Mock Tests
  const sanitizedMocks: any[] = [];
  if (Array.isArray(rawMocks)) {
    rawMocks.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Mock test #${index + 1} was ignored (invalid object format).`);
        return;
      }

      const fallbackToday = new Date().toISOString().split('T')[0];
      const validDate = getValidDateStr(item.date, fallbackToday);

      sanitizedMocks.push({
        id: String(item.id || `mock_${index}_${Date.now()}`),
        title: String(item.title || `Mock Test #${index + 1}`),
        subject: String(item.subject || 'GS Full Length'),
        paper: String(item.paper || 'GS Paper 1'),
        date: validDate,
        score: sanitizeNumber(item.score, 0),
        totalMarks: sanitizeNumber(item.totalMarks, 200),
        accuracy: sanitizeNumber(item.accuracy, 0),
        timeTakenMins: sanitizeNumber(item.timeTakenMins, 120),
        correctCount: sanitizeNumber(item.correctCount, 0),
        wrongCount: sanitizeNumber(item.wrongCount, 0),
        unattemptedCount: sanitizeNumber(item.unattemptedCount, 0),
      });
    });
  }

  // 3. Sanitize & Validate Completed Topics
  const sanitizedTopics: string[] = [];
  if (Array.isArray(rawTopics)) {
    rawTopics.forEach((t) => {
      if (t !== null && t !== undefined) {
        const topicStr = String(t).trim();
        if (topicStr.length > 0 && !sanitizedTopics.includes(topicStr)) {
          sanitizedTopics.push(topicStr);
        }
      }
    });
  }

  // 4. Sanitize & Validate Syllabus Object
  let sanitizedSyllabus: SyllabusData | undefined = undefined;
  if (rawSyllabus && typeof rawSyllabus === 'object' && !Array.isArray(rawSyllabus)) {
    const cleanSyllabus: SyllabusData = {};
    let validSubjectCount = 0;

    Object.entries(rawSyllabus).forEach(([subject, topics]) => {
      if (typeof subject === 'string' && subject.trim() && Array.isArray(topics)) {
        const cleanTopics = topics
          .filter((top: any) => top && typeof top === 'object' && top.title)
          .map((top: any, idx: number) => ({
            id: String(top.id || `${subject.toLowerCase().replace(/\s+/g, '_')}_${idx}`),
            title: String(top.title).trim(),
            subject: String(top.subject || subject).trim(),
            pyq: ['High', 'Medium', 'Normal'].includes(top.pyq) ? top.pyq : 'Normal',
          }));

        if (cleanTopics.length > 0) {
          cleanSyllabus[subject.trim()] = cleanTopics;
          validSubjectCount++;
        }
      }
    });

    if (validSubjectCount > 0) {
      sanitizedSyllabus = cleanSyllabus;
    }
  }

  return {
    isValid: true,
    sanitizedLogs,
    sanitizedMocks,
    sanitizedTopics,
    sanitizedSyllabus,
    validationErrors: errors,
  };
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  stateData,
  logs,
  analytics,
  onUpdateConfig,
  onExportBackup,
  onImportBackup,
  onResetState,
  onResetToToday,
  onUpdateSyllabus,
  onImportSheetData,
  canUndo = false,
  onUndoLastAction,
}) => {
  const [customText, setCustomText] = useState<string>('');
  const [feedMsg, setFeedMsg] = useState<string | null>(null);

  const handleValidatedImportSheetData = (
    rawLogs: DailyLog[],
    rawMocks: any[],
    rawTopics: string[],
    rawSyllabus?: SyllabusData
  ) => {
    const {
      sanitizedLogs,
      sanitizedMocks,
      sanitizedTopics,
      sanitizedSyllabus,
      validationErrors,
    } = validateAndSanitizeImportData(rawLogs, rawMocks, rawTopics, rawSyllabus);

    if (validationErrors.length > 0) {
      console.warn('Import Data Sanitized & Validated:', validationErrors);
    }

    onImportSheetData(sanitizedLogs, sanitizedMocks, sanitizedTopics, sanitizedSyllabus);
  };

  const handleParseAndFeedSyllabus = () => {
    if (!customText.trim()) return;

    try {
      // 1. Check if valid JSON
      if (customText.trim().startsWith('{')) {
        const parsed = JSON.parse(customText);
        if (typeof parsed === 'object') {
          onUpdateSyllabus(parsed);
          setFeedMsg('✅ Custom syllabus JSON applied successfully!');
          setCustomText('');
          return;
        }
      }

      // 2. Parse line-by-line format: Subject | Topic Title | PYQ (High/Medium/Normal)
      const lines = customText.split('\n').map((l) => l.trim()).filter(Boolean);
      const newSyllabus: SyllabusData = {};

      lines.forEach((line, idx) => {
        const parts = line.split('|').map((p) => p.trim());
        const subject = parts[0] || 'General Studies';
        const title = parts[1] || `Topic ${idx + 1}`;
        const pyq = parts[2] || 'Normal';

        if (!newSyllabus[subject]) {
          newSyllabus[subject] = [];
        }

        newSyllabus[subject].push({
          id: `custom_${idx}_${Date.now()}`,
          title,
          pyq: ['High', 'Medium', 'Normal'].includes(pyq) ? pyq : 'Normal',
        });
      });

      if (Object.keys(newSyllabus).length > 0) {
        onUpdateSyllabus(newSyllabus);
        setFeedMsg(`✅ Applied custom syllabus with ${lines.length} topics across ${Object.keys(newSyllabus).length} subjects!`);
        setCustomText('');
      } else {
        setFeedMsg('⚠️ Could not parse topics. Check format.');
      }
    } catch (e: any) {
      setFeedMsg('❌ Invalid format. Use lines like "Polity | Fundamental Rights | High" or JSON.');
    }
  };

  const handleResetToDefaultSyllabus = () => {
    onUpdateSyllabus(DEFAULT_SYLLABUS, true);
    setFeedMsg('🔄 Syllabus reset to standard UPSC baseline.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 font-sans text-slate-100 pb-10">
      {/* ↩️ UNDO LAST IMPORT / ACTION CARD */}
      {canUndo && onUndoLastAction && (
        <div className="glass-card p-5 rounded-xl border border-amber-500/50 bg-amber-950/20 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-amber-900/60">
            <div className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Galti Se Galat Data Feed Ho Gaya? (Undo Option)</span>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
              UNDO AVAILABLE
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            Agar aapse galti se galat data ya syllabus import/feed ho gaya hai, toh aap neeche <strong>"Undo Last Import / Action"</strong> button par click karke turant purane state par waapas ja sakte hain.
          </p>

          <div className="pt-1">
            <button
              onClick={onUndoLastAction}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs cursor-pointer shadow-lg uppercase tracking-wider transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>↩️ Undo Last Import / Action (Revert Data)</span>
            </button>
          </div>
        </div>
      )}
      {/* 🚀 QUICK RESET TO TODAY CARD */}
      <div className="glass-card p-5 rounded-xl border border-rose-500/40 bg-rose-950/20 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-rose-900/60">
          <div className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Data to Zero (Start Fresh Today)</span>
          </div>
          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono">
            FRESH START
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Agar aap aaj se syllabus tracking bilkul fresh shuru karna chahte hain, toh neeche di gaye button par click karke saare purane study hours, completed topics, aur mock test logs ko <strong>0 (Zero)</strong> kar sakte hain.
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3">
          <button
            onClick={onResetToToday}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs cursor-pointer shadow-lg uppercase tracking-wider transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Fresh Today (Reset Progress to 0)</span>
          </button>
        </div>
      </div>

      {/* 📚 FEED CUSTOM SYLLABUS CARD */}
      <div className="glass-card p-5 rounded-xl border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Feed Custom Syllabus (Google Sheets / Text / JSON)</span>
          </div>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">
            CUSTOM SYLLABUS
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Aap Google Sheets ke <strong>'Syllabus'</strong> tab se bhi syllabus import kar sakte hain, ya apne according niche topics paste kar sakte hain.
        </p>

        <div className="space-y-2">
          <label className="text-[11px] font-mono text-slate-400 block font-bold">
            Paste Topics (Format: <code className="text-cyan-300">Subject | Topic Title | Priority</code>) or JSON:
          </label>
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={`Polity & Governance | Fundamental Rights & DPSP | High
Polity & Governance | Executive & Parliament | High
Modern History | Revolt of 1857 & Freedom Struggle | Medium
Economy | Banking & Monetary Policy | High`}
            className="w-full p-3 rounded-lg bg-[#05070A] border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleParseAndFeedSyllabus}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-md uppercase tracking-wider transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Custom Syllabus</span>
            </button>

            <button
              onClick={handleResetToDefaultSyllabus}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer border border-slate-700 ml-auto transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Default UPSC Syllabus</span>
            </button>
          </div>

          {feedMsg && (
            <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300">
              {feedMsg}
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE WORKSPACE SHEETS LIVE SYNC CARD */}
      <GoogleSheetsSync
        stateData={stateData}
        logs={logs}
        analytics={analytics}
        onImportData={handleValidatedImportSheetData}
      />

      {/* TARGET CONFIGURATIONS */}
      <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-4 shadow-xl">
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span>Base Estimates & Study Target Benchmarks</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <label className="text-slate-300">Total Lectures Target:</label>
            <input
              type="number"
              value={config.targetLectures}
              onChange={(e) => onUpdateConfig('targetLectures', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-slate-300">Avg Lecture Duration (Hours):</label>
            <input
              type="number"
              step="0.1"
              value={config.avgLecDuration}
              onChange={(e) => onUpdateConfig('avgLecDuration', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-slate-300">Estimated Book Reading Hours:</label>
            <input
              type="number"
              value={config.targetBookHrs}
              onChange={(e) => onUpdateConfig('targetBookHrs', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-slate-300">Estimated Revision Hours:</label>
            <input
              type="number"
              value={config.targetRevHrs}
              onChange={(e) => onUpdateConfig('targetRevHrs', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-slate-300">Estimated Answer Writing Hours:</label>
            <input
              type="number"
              value={config.targetAWHours}
              onChange={(e) => onUpdateConfig('targetAWHours', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-slate-300">Estimated Current Affairs Hours:</label>
            <input
              type="number"
              value={config.targetCAHrs}
              onChange={(e) => onUpdateConfig('targetCAHrs', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-slate-300">Estimated Mock Test Hours:</label>
            <input
              type="number"
              value={config.targetMockHrs}
              onChange={(e) => onUpdateConfig('targetMockHrs', Number(e.target.value))}
              className="w-28 px-2.5 py-1 rounded bg-[#0A0F18] border border-slate-800 text-right text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* DATA BACKUP & RESTORE */}
      <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3 shadow-xl">
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider pb-2 border-b border-slate-800">
          📥 Backup & Restore State
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={onExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-md uppercase tracking-wider transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-md uppercase tracking-wider transition-all">
            <Upload className="w-4 h-4" />
            <span>Import JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetState}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold font-mono text-xs cursor-pointer ml-auto uppercase tracking-wider transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
