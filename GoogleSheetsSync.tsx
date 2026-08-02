import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, initAuth, logoutGoogle, getAccessToken } from '../lib/googleAuth';
import {
  createUPSCSpreadsheet,
  syncDataToGoogleSheet,
  fetchSpreadsheetData,
  fetchPublicGoogleSheetCSV,
  parsePastedSyllabusText,
  SpreadsheetInfo
} from '../lib/googleSheets';
import { AppStateData, DailyLog, AnalyticsSummary } from '../types';
import { GoogleAuthErrorHandlerModal } from './GoogleAuthErrorHandlerModal';
import { GoogleConsoleChecklist } from './GoogleConsoleChecklist';
import {
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Upload,
  Download,
  Link,
  Clipboard,
  Sparkles,
  Copy,
  Check,
  FileCode,
  ShieldAlert
} from 'lucide-react';

interface GoogleSheetsSyncProps {
  stateData: AppStateData;
  logs: DailyLog[];
  analytics: AnalyticsSummary;
  onImportData: (logs: DailyLog[], mocks: any[], topics: string[], syllabus?: any) => void;
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  stateData,
  logs,
  analytics,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'public_url' | 'paste' | 'file_upload' | 'oauth' | 'checklist'>('oauth');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string>('');
  
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetInfo | null>(() => {
    const saved = localStorage.getItem('upsc_os_sheet_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [customSheetId, setCustomSheetId] = useState<string>('');
  const [publicUrlInput, setPublicUrlInput] = useState<string>('');
  const [pastedTextInput, setPastedTextInput] = useState<string>('');
  const [copiedSample, setCopiedSample] = useState<boolean>(false);

  const [showConfirmSync, setShowConfirmSync] = useState<boolean>(false);
  const [showConfirmImport, setShowConfirmImport] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const downloadSampleCSV = () => {
    const csvContent = `Subject,Topic Title,Priority
Polity & Governance,Fundamental Rights & DPSP,High
Polity & Governance,Executive & Parliament,High
Modern History,Revolt of 1857 & Freedom Struggle,Medium
Indian Economy,Banking & Monetary Policy,High
Geography,Physical Geography & Climate,Medium
Environment & Ecology,Biodiversity & Climate Change,High
Science & Technology,Space & Biotechnology,Normal`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'UPSC_Syllabus_GoogleSheet_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMsg({ type: 'success', text: 'UPSC Google Sheet Template file downloaded!' });
  };

  const copySampleRows = () => {
    const sample = `Polity & Governance\tFundamental Rights & DPSP\tHigh
Polity & Governance\tExecutive & Parliament\tHigh
Modern History\tRevolt of 1857 & Freedom Struggle\tMedium
Indian Economy\tBanking & Monetary Policy\tHigh`;
    navigator.clipboard.writeText(sample);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2500);
    setStatusMsg({ type: 'success', text: 'Sample format copied to clipboard! Paste into Google Sheets or Tab 2.' });
  };

  const triggerAuthErrorModal = (msg: string) => {
    setAuthErrorMsg(msg);
    setErrorModalOpen(true);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMsg({ type: 'success', text: `Signed in as ${res.user.email}! Google Drive & Sheets live sync enabled.` });
      }
    } catch (err: any) {
      console.warn('Google Sign-in error:', err);
      const errMsg = err.message || 'Google Sign-In failed.';
      setStatusMsg({
        type: 'error',
        text: errMsg
      });
      triggerAuthErrorModal(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setStatusMsg({ type: 'info', text: 'Logged out from Google Account' });
  };

  const handleCreateSheet = async () => {
    const tok = token || (await getAccessToken());
    if (!tok) {
      const msg = 'Please sign in with Google first.';
      setStatusMsg({ type: 'error', text: msg });
      triggerAuthErrorModal(msg);
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Creating new UPSC Master OS Spreadsheet in your Google Drive...' });
    try {
      const info = await createUPSCSpreadsheet(tok);
      setSpreadsheet(info);
      localStorage.setItem('upsc_os_sheet_info', JSON.stringify(info));
      setStatusMsg({ type: 'success', text: `🎉 Success! Created Google Sheet "${info.title}" in your Google Drive!` });
    } catch (err: any) {
      const errMsg = err.message || 'Failed to create spreadsheet';
      setStatusMsg({ type: 'error', text: errMsg });
      triggerAuthErrorModal(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const executeSyncToSheet = async () => {
    setShowConfirmSync(false);
    const tok = token || (await getAccessToken());
    if (!tok) {
      const msg = 'Google session expired. Please sign in again.';
      setStatusMsg({ type: 'error', text: msg });
      triggerAuthErrorModal(msg);
      return;
    }
    if (!spreadsheet) {
      setStatusMsg({ type: 'error', text: 'No Google Sheet connected. Create or attach a Sheet first.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Syncing UPSC Master OS metrics to Google Sheets...' });
    try {
      await syncDataToGoogleSheet(tok, spreadsheet.spreadsheetId, stateData, logs, analytics);
      setStatusMsg({
        type: 'success',
        text: `🚀 Success! App Data & Analysis synced to "${spreadsheet.title}" at ${new Date().toLocaleTimeString()}!`,
      });
    } catch (err: any) {
      const errMsg = err.message || 'Sync to Google Sheets failed';
      setStatusMsg({ type: 'error', text: errMsg });
      triggerAuthErrorModal(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const executeImportFromSheet = async () => {
    setShowConfirmImport(false);
    const tok = token || (await getAccessToken());
    if (!tok) {
      const msg = 'Google session expired. Please sign in again.';
      setStatusMsg({ type: 'error', text: msg });
      triggerAuthErrorModal(msg);
      return;
    }
    if (!spreadsheet) {
      setStatusMsg({ type: 'error', text: 'No Google Sheet connected.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Fetching & analyzing data from Google Sheets...' });
    try {
      const { importedLogs, importedMocks, importedTopics, importedSyllabus } = await fetchSpreadsheetData(
        tok,
        spreadsheet.spreadsheetId
      );
      onImportData(importedLogs, importedMocks, importedTopics, importedSyllabus);
      setStatusMsg({
        type: 'success',
        text: `🎉 Successfully imported ${importedLogs.length} daily logs, ${importedMocks.length} mock tests, ${importedTopics.length} completed topics ${importedSyllabus ? '& custom syllabus ' : ''}from Google Sheet!`,
      });
    } catch (err: any) {
      const errMsg = err.message || 'Import failed';
      setStatusMsg({ type: 'error', text: errMsg });
      triggerAuthErrorModal(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMsg({ type: 'info', text: `Reading ${file.name}...` });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('File content is empty.');
        const { importedSyllabus, totalCount } = parsePastedSyllabusText(text);
        onImportData([], [], [], importedSyllabus);
        setStatusMsg({
          type: 'success',
          text: `🎉 Success! Imported ${totalCount} topics directly from ${file.name}!`,
        });
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: err.message || 'Could not parse CSV file. Make sure columns are: Subject, Topic Title, Priority',
        });
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setStatusMsg({ type: 'error', text: 'Error reading file.' });
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleImportPublicSheet = async () => {
    if (!publicUrlInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste a valid Google Sheet URL or ID.' });
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Fetching Google Sheet data...' });
    try {
      const { importedSyllabus, totalCount } = await fetchPublicGoogleSheetCSV(publicUrlInput);
      onImportData([], [], [], importedSyllabus);
      setStatusMsg({
        type: 'success',
        text: `🚀 Success! Imported ${totalCount} syllabus topics directly from your Google Sheet!`
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to fetch public Google Sheet. Make sure sharing is "Anyone with link can view".'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportPastedText = () => {
    if (!pastedTextInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste copied Google Sheet cells first.' });
      return;
    }
    setLoading(true);
    try {
      const { importedSyllabus, totalCount } = parsePastedSyllabusText(pastedTextInput);
      onImportData([], [], [], importedSyllabus);
      setStatusMsg({
        type: 'success',
        text: `🎉 Imported ${totalCount} topics directly into your UPSC Syllabus checklist!`
      });
      setPastedTextInput('');
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Could not parse pasted text.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttachExistingSheet = () => {
    if (!customSheetId.trim()) return;
    const cleanId = customSheetId.trim().split('/d/')[1]?.split('/')[0] || customSheetId.trim();
    const info: SpreadsheetInfo = {
      spreadsheetId: cleanId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cleanId}`,
      title: 'Connected Google Sheet',
    };
    setSpreadsheet(info);
    localStorage.setItem('upsc_os_sheet_info', JSON.stringify(info));
    setCustomSheetId('');
    setStatusMsg({ type: 'success', text: 'Attached existing Google Sheet!' });
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-emerald-500/30 space-y-4 shadow-xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              Google Sheets & Drive Live Sync
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                GOOGLE OAUTH
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Google Account connect karke live Drive Spreadsheet se study metrics feed, sync aur import karein.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer border border-slate-700"
              title="Sign Out Google Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold cursor-pointer transition-all"
            title="Download Sample Template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template</span>
          </button>
        </div>
      </div>

      {/* MODE TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-[#0A0F18] border border-slate-800 rounded-lg text-xs font-mono">
        <button
          onClick={() => setActiveTab('oauth')}
          className={`py-2 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'oauth'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>1. Live OAuth</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`py-2 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>2. GCP Setup Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('public_url')}
          className={`py-2 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'public_url'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>3. Sheet Link</span>
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`py-2 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'paste'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>4. Copy & Paste</span>
        </button>

        <button
          onClick={() => setActiveTab('file_upload')}
          className={`py-2 px-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'file_upload'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>5. CSV File</span>
        </button>
      </div>

      {/* STATUS BANNER */}
      {statusMsg && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : statusMsg.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              : 'bg-sky-950/60 border-sky-500/40 text-sky-300'
          }`}
        >
          {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
          {statusMsg.type === 'info' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
          <span className="leading-relaxed">{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: OAUTH GOOGLE ACCOUNT LIVE SYNC */}
      {activeTab === 'oauth' && (
        <div className="space-y-4">
          {!user ? (
            <div className="p-4 rounded-xl bg-[#0A0F18] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Google Account Direct Live Connection</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Connect your Google Account to create Google Spreadsheets automatically in your Drive and feed analysis data.
                  </p>
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md cursor-pointer shrink-0 border border-slate-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="font-sans font-medium text-slate-800">Sign in with Google</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* USER ACCOUNT BAR */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F18] border border-slate-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-8 h-8 rounded-full border border-emerald-500/40" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                    {user.email?.[0].toUpperCase() || 'G'}
                  </div>
                )}
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <span>{user.displayName || 'Google User'}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                      CONNECTED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                </div>
              </div>

              {/* SPREADSHEET CONNECTION BAR */}
              {spreadsheet ? (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>{spreadsheet.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-md">
                        ID: {spreadsheet.spreadsheetId}
                      </div>
                    </div>

                    <a
                      href={spreadsheet.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-mono font-bold transition-all"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setShowConfirmSync(true)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sync App Data to Sheet</span>
                    </button>

                    <button
                      onClick={() => setShowConfirmImport(true)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Import Sheet to App</span>
                    </button>

                    <button
                      onClick={() => {
                        setSpreadsheet(null);
                        localStorage.removeItem('upsc_os_sheet_info');
                      }}
                      className="text-xs text-slate-400 hover:text-rose-400 font-mono underline ml-auto cursor-pointer"
                    >
                      Unlink Sheet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#0A0F18] border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 font-mono">No Google Sheet Attached</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleCreateSheet}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New UPSC Master Sheet in Google Drive</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">
                      Or Attach Existing Google Sheet URL / ID:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
                        value={customSheetId}
                        onChange={(e) => setCustomSheetId(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#05070A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        onClick={handleAttachExistingSheet}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono border border-slate-700 cursor-pointer"
                      >
                        Attach Sheet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLIC GOOGLE SHEET URL IMPORT */}
      {activeTab === 'public_url' && (
        <div className="p-4 rounded-xl bg-[#0A0F18] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-emerald-300 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Google Sheet URL Paste Karein</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              DIRECT LINK
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-400">⚡ Google Sheet Connect Karne Ke Easy Steps:</p>
            <p>1. Apne Google Sheet me top-right <strong>"Share"</strong> button par click karein.</p>
            <p>2. Access level ko <strong>"Anyone with the link can view"</strong> par set karke link copy karein.</p>
            <p>3. Link ko niche box me paste karke <strong>"Fetch & Import Syllabus"</strong> dabayein!</p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="https://docs.google.com/spreadsheets/d/1ABC.../edit"
              value={publicUrlInput}
              onChange={(e) => setPublicUrlInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#05070A] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                💡 Standard columns format: <code>Subject | Topic Title | Priority</code>
              </span>
              <button
                onClick={handleImportPublicSheet}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs cursor-pointer uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Fetch & Import Syllabus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COPY-PASTE GOOGLE SHEET CELLS */}
      {activeTab === 'paste' && (
        <div className="p-4 rounded-xl bg-[#0A0F18] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-cyan-400" />
              <span>Copy Google Sheet Rows → Paste Here</span>
            </div>
            <button
              onClick={copySampleRows}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer border border-slate-700"
            >
              {copiedSample ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSample ? 'Copied!' : 'Copy Sample Format'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Google Sheet me rows ko select karke <strong>Ctrl + C</strong> (Copy) karein, aur yahan box me <strong>Ctrl + V</strong> (Paste) kar dein:
          </p>

          <textarea
            rows={5}
            value={pastedTextInput}
            onChange={(e) => setPastedTextInput(e.target.value)}
            placeholder={`Polity & Governance	Fundamental Rights & DPSP	High
Polity & Governance	Executive & Parliament	High
Modern History	Revolt of 1857 & Freedom Struggle	Medium
Indian Economy	Banking & Monetary Policy	High`}
            className="w-full p-3 rounded-lg bg-[#05070A] border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-detects Tabs, Pipes, or CSV.
            </span>
            <button
              onClick={handleImportPastedText}
              disabled={loading || !pastedTextInput.trim()}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import Pasted Topics</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: CSV FILE UPLOAD */}
      {activeTab === 'file_upload' && (
        <div className="p-4 rounded-xl bg-[#0A0F18] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold font-mono text-emerald-300 uppercase flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload Google Sheet CSV File (.csv)</span>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer border border-slate-700"
            >
              <FileCode className="w-3 h-3 text-emerald-400" />
              <span>Download Template</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Google Sheet me <strong>File → Download → Comma-separated values (.csv)</strong> click karke file download karein, aur use yahan drag or select karein:
          </p>

          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 rounded-xl p-6 text-center bg-[#05070A] transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-mono text-slate-200 font-bold">
              Click to browse or drop CSV file here
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Supports .csv files exported from Google Sheets or Excel
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: GCP SETUP CHECKLIST */}
      {activeTab === 'checklist' && <GoogleConsoleChecklist />}

      {/* CONFIRM SYNC MODAL */}
      {showConfirmSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0F172A] border border-emerald-500/40 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Confirm Google Sheets Export</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              This will update cells in <strong>"{spreadsheet?.title}"</strong> with your latest UPSC Master OS logs ({logs.length} daily logs, {stateData.mockTests.length} mock test records, and syllabus stats).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmSync(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeSyncToSheet}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs cursor-pointer uppercase tracking-wider"
              >
                Confirm Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM IMPORT MODAL */}
      {showConfirmImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0F172A] border border-cyan-500/40 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Confirm Google Sheets Import</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to import data from <strong>"{spreadsheet?.title}"</strong>? This will merge spreadsheet records into your local application state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmImport(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeImportFromSheet}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer uppercase tracking-wider"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE AUTH ERROR HANDLER MODAL */}
      <GoogleAuthErrorHandlerModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorMessage={authErrorMsg}
        onRetrySignIn={handleSignIn}
        onOpenFallbackTab={() => setActiveTab('public_url')}
      />
    </div>
  );
};

