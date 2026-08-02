import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStateData, DailyInputs, MockTest, AppConfig, SyllabusData, DailyLog } from './types';
import { INITIAL_STATE, DEFAULT_CONFIG } from './data/initialData';
import { DEFAULT_SYLLABUS } from './data/defaultSyllabus';
import { computeAnalytics, safeNum } from './utils/engine';
import { Header } from './components/Header';
import { SidebarHud } from './components/SidebarHud';
import { DashboardView } from './components/DashboardView';
import { SyllabusView } from './components/SyllabusView';
import { MockTestView } from './components/MockTestView';
import { SettingsView } from './components/SettingsView';
import { FocusTimerView } from './components/FocusTimerView';
import { AiCoachModal } from './components/AiCoachModal';
import { AiArchitectModal } from './components/AiArchitectModal';
import { LoginModal } from './components/LoginModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdSenseMonetizationView } from './components/AdSenseMonetizationView';
import { LayoutDashboard, CheckSquare, Target, Settings, Sparkles, Clock, Tv } from 'lucide-react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'timer' | 'checklist' | 'mock' | 'settings' | 'monetization'>('analytics');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('upsc_admin_pricing_config');
      return saved ? JSON.parse(saved) : { days7: 99, days30: 299, days90: 699, days365: 1999 };
    } catch {
      return { days7: 99, days30: 299, days90: 699, days365: 1999 };
    }
  });

  const [restrictedFeatures, setRestrictedFeatures] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('upsc_admin_restricted_features');
      return saved ? JSON.parse(saved) : { aiCoach: false, mockTest: false, syllabusEdit: false, analyticsExport: false };
    } catch {
      return { aiCoach: false, mockTest: false, syllabusEdit: false, analyticsExport: false };
    }
  });

  useEffect(() => {
    localStorage.setItem('upsc_admin_pricing_config', JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    localStorage.setItem('upsc_admin_restricted_features', JSON.stringify(restrictedFeatures));
  }, [restrictedFeatures]);

  const isAdmin = currentUser?.email === 'mysterioustalks6@gmail.com';

  const handleOpenAiCoach = () => {
    if (restrictedFeatures.aiCoach && !isPremium && !isAdmin) {
      alert('🔒 Blocked by Admin: AI Coach requires Pro Pass or Ad Watch. Please unlock on the Monetization page.');
      setActiveTab('monetization');
      return;
    }
    setIsAiCoachOpen(true);
  };

  const handleTabClick = (tab: any) => {
    if (tab === 'mock' && restrictedFeatures.mockTest && !isPremium && !isAdmin) {
      alert('🔒 Blocked by Admin: Mock Test Engine requires Pro Pass or Ad Watch. Please unlock on the Monetization page.');
      setActiveTab('monetization');
      return;
    }
    setActiveTab(tab);
  };

  const checkSyllabusBlocked = () => {
    if (restrictedFeatures.syllabusEdit && !isPremium && !isAdmin) {
      alert('🔒 Blocked by Admin: Syllabus Customization is locked by Admin. Please unlock on the Monetization page.');
      setActiveTab('monetization');
      return true;
    }
    return false;
  };
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const exp = localStorage.getItem('upsc_premium_expiry');
      if (exp && new Date(exp).getTime() > Date.now()) return true;
      return false;
    } catch {
      return false;
    }
  });
  const [premiumExpiry, setPremiumExpiry] = useState<string | null>(() => {
    try {
      return localStorage.getItem('upsc_premium_expiry');
    } catch {
      return null;
    }
  });

  const handleUnlockPremium = (days: number) => {
    const currentExp = premiumExpiry && new Date(premiumExpiry).getTime() > Date.now() 
      ? new Date(premiumExpiry).getTime() 
      : Date.now();
    const newExp = new Date(currentExp + days * 24 * 60 * 60 * 1000).toISOString();
    setIsPremium(true);
    setPremiumExpiry(newExp);
    localStorage.setItem('upsc_premium_expiry', newExp);
    showToast(`🎉 Pro Pass Activated! Valid for ${days} days.`);
  };
  const [syllabus, setSyllabus] = useState<SyllabusData>(DEFAULT_SYLLABUS);
  const [serverLogs, setServerLogs] = useState<DailyLog[]>([]);
  const [serverTime, setServerTime] = useState<string>(new Date().toISOString());
  const [stateData, setStateData] = useState<AppStateData>(() => {
    try {
      const saved = localStorage.getItem('upsc_os_app_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse local app state:', e);
    }
    return INITIAL_STATE;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'saving' | 'offline'>('online');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isAiArchitectOpen, setIsAiArchitectOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync stateData to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upsc_os_app_state', JSON.stringify(stateData));
    } catch (e) {
      console.warn('Failed to save app state to localStorage:', e);
    }
  }, [stateData]);

  // Sync custom syllabus to localStorage
  useEffect(() => {
    try {
      if (syllabus && Object.keys(syllabus).length > 0) {
        localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(syllabus));
      }
    } catch (e) {
      console.warn('Failed to save syllabus to localStorage:', e);
    }
  }, [syllabus]);

  // 1. Fetch initial application state from server & auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'data', 'appState');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            if (cloudData.state) {
              setStateData(cloudData.state);
            }
            if (cloudData.syllabus && Object.keys(cloudData.syllabus).length > 0) {
              setSyllabus(cloudData.syllabus);
              localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(cloudData.syllabus));
            }
            showToast('☁️ Secure Cloud Data Synced for ' + (user.displayName || user.email));
          }
        } catch (err) {
          console.error('Failed to load user data from Firestore:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('🔒 Google Sign-In Successful!');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      showToast('Login blocked by browser. Please open the website in a new tab to login.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  useEffect(() => {
    const savedCustomSyllabus = localStorage.getItem('upsc_os_custom_syllabus');
    if (savedCustomSyllabus) {
      try {
        const parsed = JSON.parse(savedCustomSyllabus);
        if (parsed && Object.keys(parsed).length > 0) {
          setSyllabus(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse custom syllabus from localStorage', e);
      }
    }
    fetchStateFromServer();
  }, []);

  const fetchStateFromServer = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      // Only update syllabus if server returns a custom non-empty syllabus
      if (data.syllabus && Object.keys(data.syllabus).length > 0) {
        setSyllabus(data.syllabus);
        try {
          localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(data.syllabus));
        } catch (e) {
          console.warn(e);
        }
      } else {
        const savedCustomSyllabus = localStorage.getItem('upsc_os_custom_syllabus');
        if (savedCustomSyllabus) {
          try {
            const parsed = JSON.parse(savedCustomSyllabus);
            if (parsed && Object.keys(parsed).length > 0) {
              setSyllabus(parsed);
            }
          } catch (e) {
            console.warn('Failed to parse custom syllabus from localStorage', e);
          }
        }
      }
      if (data.logs) {
        setServerLogs(data.logs);
      }
      if (data.serverTime) {
        setServerTime(data.serverTime);
      }

      if (data.state && Object.keys(data.state).length > 0) {
        setStateData((prev) => {
          // Keep local array state if server returns empty array or stale state
          const completedTopics =
            data.state.completedTopics && data.state.completedTopics.length > 0
              ? Array.from(new Set([...(prev.completedTopics || []), ...data.state.completedTopics]))
              : prev.completedTopics || [];

          const starredTopics =
            data.state.starredTopics && data.state.starredTopics.length > 0
              ? Array.from(new Set([...(prev.starredTopics || []), ...data.state.starredTopics]))
              : prev.starredTopics || [];

          const weakTopics =
            data.state.weakTopics && data.state.weakTopics.length > 0
              ? Array.from(new Set([...(prev.weakTopics || []), ...data.state.weakTopics]))
              : prev.weakTopics || [];

          return {
            ...prev,
            ...data.state,
            completedTopics,
            starredTopics,
            weakTopics,
            daily: {
              ...(prev.daily || {}),
              ...(data.state.daily || {})
            },
            config: {
              ...(prev.config || {}),
              ...(data.state.config || {})
            },
            mockTests: data.state.mockTests || prev.mockTests || []
          };
        });
      }
      setNetworkStatus('online');
    } catch (err) {
      console.warn('Failed to fetch from server, using local fallback:', err);
      setNetworkStatus('offline');
    }
  };

  // 2. Compute Analytics Summary using engine
  const analytics = useMemo(() => {
    return computeAnalytics(stateData, syllabus, serverLogs, serverTime);
  }, [stateData, syllabus, serverLogs, serverTime]);

  // Helper toast shower
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 3. Mark dirty on local edits
  const markDirty = () => {
    setIsDirty(true);
  };

  // 4. Adjust daily input counters
  const handleAdjDailyInput = (key: keyof DailyInputs, delta: number) => {
    setStateData((prev) => {
      const currentDaily = prev.daily || { lectures: 0, videoHrs: 0, bookHrs: 0, revHrs: 0, awHrs: 0, caHrs: 0, mockHrs: 0 };
      const currentVal = safeNum(currentDaily[key]);
      const newVal = Math.max(0, Number((currentVal + delta).toFixed(2)));
      return {
        ...prev,
        daily: {
          ...currentDaily,
          [key]: newVal
        }
      };
    });
    markDirty();
  };

  // 5. Toggle topic data arrays (completedTopics, starredTopics, weakTopics)
  const handleToggleTopic = (id: string, arrayName: 'completedTopics' | 'starredTopics' | 'weakTopics') => {
    let isNowCompleted = false;
    setStateData((prev) => {
      const currentArray = prev[arrayName] || [];
      const idx = currentArray.indexOf(id);
      let updatedArray: string[];
      if (idx > -1) {
        updatedArray = currentArray.filter((itemId) => itemId !== id);
        isNowCompleted = false;
      } else {
        updatedArray = [...currentArray, id];
        isNowCompleted = true;
      }

      const updatedState = {
        ...prev,
        [arrayName]: updatedArray
      };

      // Immediately write to local storage so page reload/refresh never loses it
      try {
        localStorage.setItem('upsc_os_app_state', JSON.stringify(updatedState));
      } catch (e) {
        console.warn('Failed to write app state to localStorage:', e);
      }

      // Background save to server
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: updatedState, syllabus })
      }).catch((e) => console.warn('Background state sync failed:', e));

      return updatedState;
    });

    if (arrayName === 'completedTopics') {
      showToast(isNowCompleted ? '⚡ Topic Completed! Target Days Reduced.' : '↩️ Topic Marked Pending. Target Days Adjusted.');
    }
    markDirty();
  };

  // 6. Mock test handlers
  const handleAddMockTest = (testData: Omit<MockTest, 'id'>) => {
    const newTest: MockTest = {
      ...testData,
      id: `mock-${Date.now()}`
    };

    setStateData((prev) => ({
      ...prev,
      mockTests: [newTest, ...(prev.mockTests || [])]
    }));
    markDirty();
    showToast('✅ Mock test record added!');
  };

  const handleDeleteMockTest = (id: string) => {
    setStateData((prev) => ({
      ...prev,
      mockTests: (prev.mockTests || []).filter((t) => t.id !== id)
    }));
    markDirty();
    showToast('🗑️ Mock test record removed.');
  };

  // 7. Config update handler
  const handleUpdateConfig = (key: keyof AppConfig, value: number) => {
    setStateData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: Math.max(0.1, safeNum(value))
      }
    }));
    markDirty();
  };

  // 8. Save State API
  const handleSaveState = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setNetworkStatus('saving');

    try {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'data', 'appState');
        await setDoc(docRef, {
          state: stateData,
          syllabus,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        setIsDirty(false);
        setNetworkStatus('online');
        showToast('🔒 Data securely saved to Cloud Firestore!');
      } else {
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: stateData, syllabus })
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Save error');

        setIsDirty(false);
        setNetworkStatus('online');
        showToast('💾 State Saved Successfully!');
        fetchStateFromServer(); // Refresh logs from server
      }
    } catch (err) {
      console.warn('Save failed, relying on local state:', err);
      setIsDirty(false);
      setNetworkStatus('offline');
      showToast('✅ Saved to Local Session');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-save every 30s if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        handleSaveState();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, stateData]);

  // 9. Backup & Restore handlers
  const handleExportBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stateData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `UPSC_Master_OS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('📥 Backup JSON downloaded!');
  };

  const [resetConfirmType, setResetConfirmType] = useState<'today' | 'baseline' | null>(null);

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.config) {
          setStateData((prev) => ({
            ...prev,
            ...imported
          }));
          markDirty();
          showToast('✅ Backup imported successfully!');
        } else {
          showToast('⚠️ Invalid backup format.');
        }
      } catch (err) {
        showToast('❌ Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetState = () => {
    setResetConfirmType('baseline');
  };

  const handleResetToToday = () => {
    setResetConfirmType('today');
  };

  const executeResetToToday = () => {
    const freshState: AppStateData = {
      ...INITIAL_STATE,
      totalActiveDays: 1,
      totalLecturesDone: 0,
      totalVideoHours: 0,
      totalBookHours: 0,
      totalRevHours: 0,
      totalAWHours: 0,
      totalCAHours: 0,
      totalMockHrs: 0,
      completedTopics: [],
      starredTopics: [],
      weakTopics: [],
      daily: {
        lectures: 0,
        videoHrs: 0,
        bookHrs: 0,
        revHrs: 0,
        awHrs: 0,
        caHrs: 0,
        mockHrs: 0
      },
      mockTests: [],
      streakCount: 1,
      longestStreak: 1,
      netXP: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    setStateData(freshState);
    setServerLogs([]);
    try {
      localStorage.setItem('upsc_os_app_state', JSON.stringify(freshState));
      localStorage.removeItem('upsc_os_study_sessions');
      localStorage.removeItem('upsc_os_daily_micro_goals');
    } catch (e) {
      console.warn(e);
    }
    markDirty();
    showToast('🚀 All progress reset to ZERO! Prepared fresh for Day 1 today.');
    setResetConfirmType(null);
  };

  const executeResetBaseline = () => {
    saveUndoSnapshot();
    setStateData(INITIAL_STATE);
    setSyllabus(DEFAULT_SYLLABUS);
    try {
      localStorage.removeItem('upsc_os_app_state');
      localStorage.removeItem('upsc_os_custom_syllabus');
    } catch (e) {
      console.warn(e);
    }
    markDirty();
    showToast('🔄 Baseline state restored.');
    setResetConfirmType(null);
  };

  // Undo Snapshot History State
  const [undoSnapshot, setUndoSnapshot] = useState<{
    syllabus: SyllabusData;
    stateData: AppStateData;
    serverLogs: DailyLog[];
  } | null>(null);

  const saveUndoSnapshot = () => {
    setUndoSnapshot({
      syllabus: JSON.parse(JSON.stringify(syllabus)),
      stateData: JSON.parse(JSON.stringify(stateData)),
      serverLogs: JSON.parse(JSON.stringify(serverLogs)),
    });
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setSyllabus(undoSnapshot.syllabus);
    if (undoSnapshot.syllabus === DEFAULT_SYLLABUS) {
      localStorage.removeItem('upsc_os_custom_syllabus');
    } else {
      localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(undoSnapshot.syllabus));
    }
    setStateData(undoSnapshot.stateData);
    setServerLogs(undoSnapshot.serverLogs);
    setUndoSnapshot(null);
    markDirty();
    showToast('↩️ Undo Successful! Reverted to previous state.');
  };

  const handleUpdateSyllabus = (newSyllabus: SyllabusData, isReset: boolean = false, skipSnapshot: boolean = false) => {
    if (!skipSnapshot) {
      saveUndoSnapshot();
    }
    setSyllabus(newSyllabus);
    if (isReset) {
      localStorage.removeItem('upsc_os_custom_syllabus');
    } else {
      localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(newSyllabus));
    }
    markDirty();
    showToast(isReset ? '🔄 Reset to Default Baseline Syllabus' : '📚 Custom Syllabus Updated & Saved!');
  };

  const handleDeleteTopic = (subject: string, topicId: string) => {
    saveUndoSnapshot();
    const updated = { ...syllabus };
    if (updated[subject]) {
      updated[subject] = updated[subject].filter((t) => t.id !== topicId);
      if (updated[subject].length === 0) {
        delete updated[subject];
      }
    }
    handleUpdateSyllabus(updated, false, true);
    showToast(`🗑️ Deleted topic from ${subject}.`);
  };

  const handleAddCustomTopic = (subject: string, title: string, pyq: string) => {
    saveUndoSnapshot();
    const topicId = `topic_${Date.now()}`;
    const updatedSyllabus = { ...syllabus };
    if (!updatedSyllabus[subject]) {
      updatedSyllabus[subject] = [];
    }
    updatedSyllabus[subject] = [
      ...updatedSyllabus[subject],
      {
        id: topicId,
        title,
        pyq: (['High', 'Medium', 'Normal'].includes(pyq) ? pyq : 'Normal') as 'High' | 'Medium' | 'Normal',
      }
    ];
    handleUpdateSyllabus(updatedSyllabus, false, true);
    showToast(`➕ Topic added to ${subject}!`);
  };

  const handleSessionSaved = (session: any) => {
    const hrsAdded = Number((session.durationSeconds / 3600).toFixed(2));
    if (hrsAdded > 0) {
      let key: keyof DailyInputs | null = null;
      if (session.category === 'Book Reading') key = 'bookHrs';
      else if (session.category === 'Video Lecture') key = 'videoHrs';
      else if (session.category === 'Revision') key = 'revHrs';
      else if (session.category === 'Answer Writing') key = 'awHrs';
      else if (session.category === 'Current Affairs') key = 'caHrs';
      else if (session.category === 'Mock Test') key = 'mockHrs';

      if (key) {
        handleAdjDailyInput(key, hrsAdded);
        showToast(`⏱️ Saved ${hrsAdded}h session & synced with Daily Protocol!`);
      } else {
        showToast(`⏱️ Saved ${hrsAdded}h session!`);
      }
    }
  };

  const handleImportSheetData = (importedLogs: DailyLog[], importedMocks: any[], importedTopics: string[], importedSyllabus?: SyllabusData) => {
    saveUndoSnapshot();
    if (importedLogs.length > 0) {
      setServerLogs(importedLogs);
    }
    if (importedSyllabus && Object.keys(importedSyllabus).length > 0) {
      setSyllabus(importedSyllabus);
      localStorage.setItem('upsc_os_custom_syllabus', JSON.stringify(importedSyllabus));
    }
    setStateData((prev) => ({
      ...prev,
      mockTests: importedMocks.length > 0 ? importedMocks : prev.mockTests,
      completedTopics:
        importedTopics.length > 0
          ? Array.from(new Set([...prev.completedTopics, ...importedTopics]))
          : prev.completedTopics,
    }));
    markDirty();
    showToast('✅ Synced data & syllabus from Google Sheets!');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#05070A] text-slate-100 overflow-hidden font-sans select-none">
      {/* APP HEADER */}
      <Header
        isDirty={isDirty}
        isSyncing={isSyncing}
        networkStatus={networkStatus}
        onSave={handleSaveState}
        onOpenAiCoach={handleOpenAiCoach}
        onOpenAiArchitect={() => setIsAiArchitectOpen(true)}
        onResetToToday={handleResetToToday}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
      />

      {/* MAIN CONTAINER GRID */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 gap-4 p-3 sm:p-5 overflow-hidden">
        {/* LEFT SIDEBAR: HUD & AI ENGINE */}
        {isSidebarOpen && (
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 h-auto lg:h-full max-h-[45vh] lg:max-h-full flex flex-col min-h-0 overflow-y-auto pr-1 space-y-4">
            <SidebarHud
              analytics={analytics}
              stateData={stateData}
              onAdjDailyInput={handleAdjDailyInput}
            />
          </div>
        )}

        {/* RIGHT MAIN: TABS & VIEWS */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#080D1A]/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
          {/* TAB NAVIGATION */}
          <nav className="flex items-center gap-1.5 p-2.5 sm:p-3 bg-[#050812]/90 border-b border-slate-800/80 overflow-x-auto shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>Dashboard & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'timer'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'timer' ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>Focus Timer & Study Log</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <CheckSquare className={`w-4 h-4 ${activeTab === 'checklist' ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>Syllabus Master</span>
            </button>

            <button
              onClick={() => handleTabClick('mock')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'mock'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Target className={`w-4 h-4 ${activeTab === 'mock' ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>Mock Tests {restrictedFeatures.mockTest && !isPremium && !isAdmin && '🔒'}</span>
            </button>

            <button
              onClick={() => handleTabClick('settings')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>Settings & Data</span>
            </button>

            <button
              onClick={() => handleTabClick('monetization')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'monetization'
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Tv className={`w-4 h-4 ${activeTab === 'monetization' ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>AdSense & Pro Pass</span>
            </button>
          </nav>

          {/* VIEW AREA */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === 'analytics' && (
                  <DashboardView analytics={analytics} logs={serverLogs} onResetToToday={handleResetToToday} />
                )}

                {activeTab === 'timer' && (
                  <FocusTimerView
                    syllabus={syllabus}
                    onSessionSaved={handleSessionSaved}
                  />
                )}

                {activeTab === 'checklist' && (
                  <SyllabusView
                    syllabus={syllabus}
                    completedTopicIds={stateData.completedTopics}
                    starredTopicIds={stateData.starredTopics}
                    weakTopicIds={stateData.weakTopics}
                    onToggleTopic={(sub, id) => {
                      if (checkSyllabusBlocked()) return;
                      handleToggleTopic(sub, id);
                    }}
                    onAddTopic={(sub, title, pyq) => {
                      if (checkSyllabusBlocked()) return;
                      handleAddCustomTopic(sub, title, pyq);
                    }}
                    onDeleteTopic={(sub, id) => {
                      if (checkSyllabusBlocked()) return;
                      handleDeleteTopic(sub, id);
                    }}
                    onResetSyllabus={() => {
                      if (checkSyllabusBlocked()) return;
                      handleUpdateSyllabus(DEFAULT_SYLLABUS, true);
                    }}
                    onUndoLastAction={handleUndo}
                    canUndo={!!undoSnapshot}
                  />
                )}

                {activeTab === 'mock' && (
                  <MockTestView
                    mockTests={stateData.mockTests}
                    onAddMockTest={handleAddMockTest}
                    onDeleteMockTest={handleDeleteMockTest}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    config={stateData.config}
                    stateData={stateData}
                    logs={serverLogs}
                    analytics={analytics}
                    onUpdateConfig={handleUpdateConfig}
                    onExportBackup={handleExportBackup}
                    onImportBackup={handleImportBackup}
                    onResetState={handleResetState}
                    onResetToToday={handleResetToToday}
                    onUpdateSyllabus={handleUpdateSyllabus}
                    onImportSheetData={handleImportSheetData}
                    canUndo={!!undoSnapshot}
                    onUndoLastAction={handleUndo}
                  />
                )}

                {activeTab === 'monetization' && (
                  <AdSenseMonetizationView
                    onUnlockPremium={handleUnlockPremium}
                    isPremium={isPremium}
                    premiumExpiry={premiumExpiry}
                    pricingConfig={pricingConfig}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* LOGIN MODAL GATE */}
      <LoginModal
        isOpen={!currentUser}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* ADMIN PANEL MODAL */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        syllabus={syllabus}
        stateData={stateData}
        pricingConfig={pricingConfig}
        onUpdatePricing={setPricingConfig}
        restrictedFeatures={restrictedFeatures}
        onUpdateRestrictions={setRestrictedFeatures}
        onGrantProPass={(days, targetEmail) => {
          handleUnlockPremium(days);
          showToast(`🎁 Successfully granted ${days}-day Pro Pass to ${targetEmail || currentUser?.email || 'admin'}!`);
          setIsAdminModalOpen(false);
        }}
      />

      {/* BOTTOM CONSOLE FOOTER */}
      <footer className="h-8 w-full bg-[#05070A] border-t border-slate-800/80 flex items-center px-4 font-mono text-[10px] text-slate-500 shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>UPSC MASTER OS v6.0.0 // AUTHENTICATED // DB_STATE_STABLE</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-cyan-600">#WORKLOAD-SYNC-ACTIVE</span>
          <span className="text-slate-700 uppercase">DYNAMIC ETA ENGINE</span>
        </div>
      </footer>

      {/* TOAST NOTIFICATION WITH UNDO OPTION */}
      {toastMessage && (
        <div className="fixed bottom-10 right-5 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-xl flex items-center gap-3">
          <span>{toastMessage}</span>
          {undoSnapshot && (
            <button
              onClick={() => {
                handleUndo();
                setToastMessage(null);
              }}
              className="ml-1 px-2.5 py-1 rounded bg-slate-950 text-amber-300 hover:bg-slate-900 border border-amber-400/50 font-bold cursor-pointer transition-all uppercase tracking-wider text-[11px]"
            >
              ↩️ Undo
            </button>
          )}
        </div>
      )}

      {/* AI ARCHITECT SYSTEM AUTO-FIXER MODAL */}
      <AiArchitectModal
        isOpen={isAiArchitectOpen}
        onClose={() => setIsAiArchitectOpen(false)}
        stateData={stateData}
        serverLogs={serverLogs}
        syllabus={syllabus}
        analytics={analytics}
        onAutoFixAll={(repairedState, repairedLogs, repairedSyllabus) => {
          setStateData(repairedState);
          setServerLogs(repairedLogs);
          setSyllabus(repairedSyllabus);
          setIsDirty(true);
        }}
        showToast={showToast}
      />

      {/* AI STRATEGIC COACH MODAL */}
      <AiCoachModal
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        analytics={analytics}
        completedTopicsCount={(stateData.completedTopics || []).length}
        weakTopicsCount={(stateData.weakTopics || []).length}
      />

      {/* RESET CONFIRMATION MODAL (Replaces browser confirm dialog) */}
      {resetConfirmType && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0D18] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-mono text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-3">
              <span className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400">
                ⚠️
              </span>
              <span>
                {resetConfirmType === 'today' ? 'Reset Progress to Day 1 (Aaj Se Shuru)' : 'Restore Baseline State'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {resetConfirmType === 'today'
                ? 'Kya aap bilkul fresh AAJ SE SHURU krna chahte hain? Aapke sabhi completed topics, study hours, aur mock test logs ZERO (0) ho jayenge.'
                : 'Kya aap saara data reset karke system ko default state par laana chahte hain?'}
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setResetConfirmType(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer transition-all border border-slate-700"
              >
                Cancel / Baad Me
              </button>
              <button
                onClick={resetConfirmType === 'today' ? executeResetToToday : executeResetBaseline}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black cursor-pointer shadow-lg shadow-rose-950 transition-all uppercase tracking-wider flex items-center gap-2"
              >
                <span>🚀 Haan, Reset Karein</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
