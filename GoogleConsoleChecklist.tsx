import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, ExternalLink, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';

export const GoogleConsoleChecklist: React.FC = () => {
  const [copiedDevUrl, setCopiedDevUrl] = useState(false);
  const [copiedAuthHandler, setCopiedAuthHandler] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    appName: true,
    origins: true,
    redirects: true,
    scopes: true,
    testUsers: false,
  });

  const devOrigin = 'https://ais-dev-zrl2bmye2ozgv66jojeukf-614316937972.asia-southeast1.run.app';
  const firebaseAuthHandler = 'https://impactful-matrix-29v0l.firebaseapp.com/__/auth/handler';

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, type: 'dev' | 'auth') => {
    navigator.clipboard.writeText(text);
    if (type === 'dev') {
      setCopiedDevUrl(true);
      setTimeout(() => setCopiedDevUrl(false), 2000);
    } else {
      setCopiedAuthHandler(true);
      setTimeout(() => setCopiedAuthHandler(false), 2000);
    }
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-amber-500/30 space-y-4 shadow-xl font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-2">
              Google Cloud Console Verification Checklist
            </h3>
            <p className="text-[11px] text-slate-400">
              Follow this 1-minute checklist to fix 403 Access Denied or Verification errors in Google Sheets.
            </p>
          </div>
        </div>

        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer"
        >
          <span>Open GCP Console</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* CHECKLIST ITEMS */}
      <div className="space-y-3">
        {/* Item 1 */}
        <div
          onClick={() => toggleCheck('appName')}
          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
            checkedItems.appName ? 'bg-slate-900/80 border-emerald-500/40' : 'bg-[#0A0F18] border-slate-800'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {checkedItems.appName ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold font-mono text-slate-200 flex items-center gap-2">
              <span>1. Application Name & Support Email</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                OAuth Consent Screen
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In Google Cloud Console &gt; <strong>OAuth Consent Screen</strong>, ensure App Name (e.g. <code>UPSC Civil Services OS</code>) and User Support Email are saved.
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div
          onClick={() => toggleCheck('origins')}
          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
            checkedItems.origins ? 'bg-slate-900/80 border-emerald-500/40' : 'bg-[#0A0F18] border-slate-800'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {checkedItems.origins ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="space-y-1.5 text-xs flex-1">
            <div className="font-bold font-mono text-slate-200 flex items-center gap-2">
              <span>2. Authorised JavaScript Origins</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                CRITICAL
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In Credentials &gt; OAuth 2.0 Web Client ID, add this app domain under <strong>Authorised JavaScript origins</strong>:
            </p>
            <div className="flex items-center gap-2 p-2 rounded bg-[#05070A] border border-slate-800 font-mono text-[11px] text-cyan-300">
              <span className="truncate flex-1">{devOrigin}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(devOrigin, 'dev');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] shrink-0 cursor-pointer"
              >
                {copiedDevUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDevUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div
          onClick={() => toggleCheck('redirects')}
          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
            checkedItems.redirects ? 'bg-slate-900/80 border-emerald-500/40' : 'bg-[#0A0F18] border-slate-800'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {checkedItems.redirects ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="space-y-1.5 text-xs flex-1">
            <div className="font-bold font-mono text-slate-200 flex items-center gap-2">
              <span>3. Authorised Redirect URIs</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                CRITICAL
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Add Firebase Auth redirect handler under <strong>Authorised redirect URIs</strong>:
            </p>
            <div className="flex items-center gap-2 p-2 rounded bg-[#05070A] border border-slate-800 font-mono text-[11px] text-cyan-300">
              <span className="truncate flex-1">{firebaseAuthHandler}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(firebaseAuthHandler, 'auth');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] shrink-0 cursor-pointer"
              >
                {copiedAuthHandler ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAuthHandler ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Item 4 */}
        <div
          onClick={() => toggleCheck('scopes')}
          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
            checkedItems.scopes ? 'bg-slate-900/80 border-emerald-500/40' : 'bg-[#0A0F18] border-slate-800'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {checkedItems.scopes ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold font-mono text-slate-200 flex items-center gap-2">
              <span>4. Google Sheets & Drive Scopes</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In OAuth Consent Screen &gt; Scopes, ensure <code>.../auth/spreadsheets</code> and <code>.../auth/drive.file</code> are added.
            </p>
          </div>
        </div>

        {/* Item 5 */}
        <div
          onClick={() => toggleCheck('testUsers')}
          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
            checkedItems.testUsers ? 'bg-slate-900/80 border-emerald-500/40' : 'bg-[#0A0F18] border-slate-800'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {checkedItems.testUsers ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold font-mono text-amber-300 flex items-center gap-2">
              <span>5. Add Test Users OR Publish App (Fixes Error 403)</span>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded font-mono">
                FIXES 403 ERROR
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              If your app is in <strong>Testing Publishing Status</strong>, you MUST add your email address under <strong>OAuth consent screen &gt; Test Users &gt; + ADD USERS</strong>.
            </p>
            <p className="text-slate-400 text-[10px]">
              💡 Alternative: Click <strong>"PUBLISH APP"</strong> in OAuth consent screen so anyone can sign in without needing test user approval.
            </p>
          </div>
        </div>
      </div>

      {/* NO-LOGIN GUARANTEE BANNER */}
      <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold font-mono text-emerald-300 block mb-0.5">
            100% Guaranteed Zero-Login Fallback Always Available:
          </span>
          <p className="text-[11px] text-slate-300">
            If you don't want to configure Google Cloud Console right now, you can instantly import your UPSC syllabus using <strong>Tab 2 (Sheet Link)</strong>, <strong>Tab 3 (Copy & Paste)</strong>, or <strong>Tab 4 (CSV File Upload)</strong> without logging into Google!
          </p>
        </div>
      </div>
    </div>
  );
};
