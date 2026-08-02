import React from 'react';
import { AlertTriangle, ExternalLink, X, ShieldAlert, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface GoogleAuthErrorHandlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
  onRetrySignIn?: () => void;
  onOpenFallbackTab?: () => void;
}

export const GoogleAuthErrorHandlerModal: React.FC<GoogleAuthErrorHandlerModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  onRetrySignIn,
  onOpenFallbackTab,
}) => {
  if (!isOpen) return null;

  const is403AccessDenied =
    errorMessage?.includes('403') ||
    errorMessage?.includes('access_denied') ||
    errorMessage?.includes('not completed the Google verification process') ||
    errorMessage?.includes('Access blocked');

  const devOrigin = 'https://ais-dev-zrl2bmye2ozgv66jojeukf-614316937972.asia-southeast1.run.app';
  const firebaseAuthHandler = 'https://impactful-matrix-29v0l.firebaseapp.com/__/auth/handler';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-xl w-full bg-[#0B111E] border border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>Google Cloud Authorization Error Handler</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                SOLVE 403 / VERIFICATION
              </span>
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              {is403AccessDenied
                ? 'Error 403: Google Verification & Test User Access Required'
                : 'Google Sign-In / OAuth Issue Detected'}
            </h2>
          </div>
        </div>

        {/* ERROR SUMMARY MSG */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="break-words max-h-24 overflow-y-auto">{errorMessage}</div>
          </div>
        )}

        {/* STEP BY STEP FIX GUIDANCE */}
        <div className="space-y-3 font-sans">
          <div className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
            🛠️ Step-by-Step Fix in Google Cloud Console (1 Minute Solution):
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            {/* Step 1 */}
            <div className="p-3 rounded-lg bg-[#05070A] border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300 font-mono flex items-center gap-2">
                <span>Step 1: Add your Google Email to "Test Users"</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                  SOLVES ERROR 403
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Open <strong>Google Cloud Console &gt; OAuth consent screen &gt; Test Users &gt; + ADD USERS</strong> and enter your email address (e.g. <code>mysterioustalks6@gmail.com</code>).
              </p>
              <p className="text-[10px] text-emerald-400">
                💡 Or click <strong>"PUBLISH APP"</strong> on the OAuth consent screen to remove test user limits!
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-lg bg-[#05070A] border border-slate-800 space-y-1.5">
              <div className="font-bold text-cyan-300 font-mono">
                Step 2: Add Authorised Redirect URIs & Origins
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In <strong>Credentials &gt; OAuth 2.0 Web Client ID</strong>, add these exact URLs:
              </p>
              <div className="space-y-1 font-mono text-[10px]">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-slate-500">Origin: </span>
                  <code>{devOrigin}</code>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-slate-500">Redirect URI: </span>
                  <code>{firebaseAuthHandler}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 100% INSTANT FALLBACK BANNER */}
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 space-y-1.5">
          <div className="font-bold font-mono text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>100% Guaranteed Zero-Login Alternative:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You don't need to wait for GCP approval! You can instantly import your Google Sheet syllabus by using <strong>Direct Sheet Link</strong>, <strong>Copy-Paste Rows</strong>, or <strong>CSV File Upload</strong>.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition-all cursor-pointer shadow-md"
          >
            <span>Open Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            {onOpenFallbackTab && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFallbackTab();
                }}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-md transition-all uppercase tracking-wider"
              >
                Use Direct Import (No Login)
              </button>
            )}

            {onRetrySignIn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetrySignIn();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs cursor-pointer border border-slate-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
