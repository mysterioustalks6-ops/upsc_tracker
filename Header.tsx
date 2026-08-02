import React from 'react';
import { Shield, Sparkles, Maximize2, Save, Wifi, Play, PanelLeft, PanelLeftClose, Cpu } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  isDirty: boolean;
  isSyncing: boolean;
  networkStatus: 'online' | 'saving' | 'offline';
  onSave: () => void;
  onOpenAiCoach: () => void;
  onOpenAiArchitect?: () => void;
  onResetToToday?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  currentUser?: User | null;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDirty,
  isSyncing,
  networkStatus,
  onSave,
  onOpenAiCoach,
  onOpenAiArchitect,
  onResetToToday,
  isSidebarOpen = true,
  onToggleSidebar,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  onOpenAdminPanel
}) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-[#080D1A]/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 shrink-0 gap-3 shadow-2xl z-30">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-orange-400/40 p-0.5">
          <div className="w-full h-full bg-[#080D1A] rounded-[14px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              <span className="gradient-text-genz">UPSC MASTER OS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono font-bold">
                v6.0
              </span>
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono font-bold tracking-wider uppercase hidden md:inline-flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Ultra-Fluid Architecture
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
            ⚡ Civil Services AI Operating System • Gemini 3.6 Speed Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Hide Left HUD Panel' : 'Show Left HUD Panel'}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer font-mono ${
              isSidebarOpen
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-cyan-400" />
            ) : (
              <PanelLeft className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden md:inline">
              {isSidebarOpen ? 'Hide HUD' : 'Show HUD'}
            </span>
          </button>
        )}

        {/* AI ARCHITECT SYSTEM HEALTH FIXER DOCK BUTTON */}
        {onOpenAiArchitect && (
          <button
            onClick={onOpenAiArchitect}
            title="Open AI Architect & Auto-System Fixer Terminal"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-950/90 to-slate-900/90 hover:from-cyan-900 hover:to-slate-800 text-cyan-300 border border-cyan-500/50 cursor-pointer shadow-lg shadow-cyan-950/50 transition-all uppercase hover:scale-105 active:scale-95"
          >
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden lg:inline">AI Architect</span>
            <span className="lg:hidden">Architect</span>
          </button>
        )}

        {onResetToToday && (
          <button
            onClick={onResetToToday}
            title="Start preparation today with fresh zero stats"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/50 transition-all border border-emerald-400/40 cursor-pointer uppercase tracking-wider font-mono hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-100" />
            <span className="hidden sm:inline">Start Today</span>
          </button>
        )}

        <button
          onClick={onOpenAiCoach}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-xl shadow-purple-950/60 transition-all border border-purple-400/40 cursor-pointer hover:scale-105 active:scale-95 font-mono"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">AI Strategic Coach</span>
          <span className="sm:hidden">AI Coach</span>
        </button>

        <button
          onClick={toggleFullScreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-all cursor-pointer hover:scale-105"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <Wifi
            className={`w-3.5 h-3.5 ${
              networkStatus === 'online'
                ? 'emerald-glow'
                : networkStatus === 'saving'
                ? 'orange-glow animate-spin'
                : 'text-rose-500'
            }`}
          />
          <span className="hidden md:inline text-slate-300 text-[11px] uppercase font-bold tracking-wider">
            {networkStatus === 'online' ? 'Synced' : networkStatus === 'saving' ? 'Syncing...' : 'Offline'}
          </span>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-6 h-6 rounded-full border border-cyan-500/50" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                {currentUser.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="hidden xl:inline text-slate-200 truncate max-w-[100px]">{currentUser.displayName || currentUser.email}</span>
            {onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="ml-1 text-[10px] px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded border border-red-500/40 font-bold cursor-pointer"
                title="Admin Command Center"
              >
                Admin
              </button>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="ml-1 text-[10px] px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded border border-rose-500/40 font-bold cursor-pointer"
                title="Sign Out"
              >
                Sign Out
              </button>
            )}
          </div>
        ) : (
          onGoogleSignIn && (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all border border-slate-300 shadow-md cursor-pointer"
              title="Sign in with Google to Secure Data in Cloud"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline">Google Login</span>
            </button>
          )
        )}

        <button
          onClick={onSave}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xl cursor-pointer font-mono uppercase tracking-wider ${
            isDirty
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black animate-pulse hover:scale-105'
              : 'bg-slate-800/90 hover:bg-slate-700 text-cyan-400 border border-cyan-800/80'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isSyncing ? 'Saving...' : isDirty ? 'Unsaved' : 'Save'}</span>
        </button>
      </div>
    </header>
  );
};
