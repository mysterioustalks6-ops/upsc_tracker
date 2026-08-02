import React, { useState, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, Tv, DollarSign, Shield, Zap, Award, Gift } from 'lucide-react';

interface AdSenseMonetizationViewProps {
  onUnlockPremium: (days: number) => void;
  isPremium: boolean;
  premiumExpiry: string | null;
  pricingConfig: { [key: string]: number };
}

export const AdSenseMonetizationView: React.FC<AdSenseMonetizationViewProps> = ({
  onUnlockPremium,
  isPremium,
  premiumExpiry,
  pricingConfig
}) => {
  const [watchingAd, setWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(30);
  const [adWatchedCount, setAdWatchedCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('upsc_ad_watched_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    let timer: any;
    if (watchingAd && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    } else if (watchingAd && adCountdown === 0) {
      setWatchingAd(false);
      const newCount = adWatchedCount + 1;
      setAdWatchedCount(newCount);
      localStorage.setItem('upsc_ad_watched_count', newCount.toString());
      onUnlockPremium(1); // Unlock 1 day premium per watched ad
      setAdCountdown(30);
    }
    return () => clearTimeout(timer);
  }, [watchingAd, adCountdown, adWatchedCount, onUnlockPremium]);

  const startWatchingAd = () => {
    setAdCountdown(30);
    setWatchingAd(true);
  };

  const prices = {
    days7: pricingConfig?.days7 ?? 99,
    days30: pricingConfig?.days30 ?? 299,
    days90: pricingConfig?.days90 ?? 699,
    days365: pricingConfig?.days365 ?? 1999
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Google AdSense & Premium Rewards Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Watch Ads or Buy Pass to Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Pro UPSC Features</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Support the UPSC AI platform by watching short sponsor videos or upgrading with the admin-configured Pro Passes below.
            </p>
          </div>
          
          <div className="bg-slate-950/80 border border-indigo-500/40 p-4 rounded-2xl text-center shrink-0 min-w-[200px] shadow-lg">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-mono">Account Status</div>
            <div className={`text-sm font-bold flex items-center justify-center gap-1.5 ${isPremium ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPremium ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              {isPremium ? 'PREMIUM ACTIVE' : 'FREE SCHOLAR'}
            </div>
            {isPremium && premiumExpiry && (
              <div className="text-[11px] text-slate-400 mt-1 font-mono">Valid till: {new Date(premiumExpiry).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Ad Watch Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Watch & Earn Card */}
        <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-cyan-400" /> Sponsored Video Ad Watch
              </h2>
              <span className="text-xs px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono rounded">
                Watched: {adWatchedCount} Videos
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Click below to watch a 30-second sponsored UPSC study partner message. Upon completion, 1 day of premium access is instantly credited to your account!
            </p>
          </div>

          {watchingAd ? (
            <div className="p-6 bg-slate-950 border border-cyan-500/40 rounded-xl text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 text-xl font-black font-mono animate-pulse">
                {adCountdown}s
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">Playing Sponsored UPSC Partner Ad...</div>
                <div className="text-xs text-slate-400">Please do not close window until countdown finishes.</div>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-1000"
                  style={{ width: `${((30 - adCountdown) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={startWatchingAd}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer text-sm"
            >
              <Play className="w-5 h-5 fill-slate-950" /> Watch 30s Ad & Unlock 1 Day Premium
            </button>
          )}

          {/* AdSense Banner Box Simulation */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-dashed border-slate-800 text-center text-slate-500 text-[11px] font-mono">
            [ Google AdSense Responsive Banner Slot: ad-slot-upsc-portal-9921 ]
          </div>
        </div>

        {/* Direct Upgrade / Buy Card */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 p-6 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Pro Pass Tiers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlock all features instantly with admin-set pricing.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <button
              onClick={() => {
                onUnlockPremium(7);
                alert(`🎉 7 Days Trial Pass successfully activated!`);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-white cursor-pointer transition-colors"
            >
              <span>7 Days Trial</span>
              <span className="text-cyan-400 font-bold">₹{prices.days7}</span>
            </button>

            <button
              onClick={() => {
                onUnlockPremium(30);
                alert(`🎉 30 Days Monthly Pass successfully activated!`);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-white cursor-pointer transition-colors"
            >
              <span>30 Days Monthly</span>
              <span className="text-cyan-400 font-bold">₹{prices.days30}</span>
            </button>

            <button
              onClick={() => {
                onUnlockPremium(90);
                alert(`🎉 90 Days Quarterly Pass successfully activated!`);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-white cursor-pointer transition-colors"
            >
              <span>90 Days Quarterly</span>
              <span className="text-cyan-400 font-bold">₹{prices.days90}</span>
            </button>

            <button
              onClick={() => {
                onUnlockPremium(365);
                alert(`🎉 365 Days Yearly VIP Pass successfully activated!`);
              }}
              className="w-full p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950 border border-cyan-500/40 flex items-center justify-between text-cyan-300 cursor-pointer transition-colors font-bold"
            >
              <span>365 Days Yearly VIP</span>
              <span>₹{prices.days365}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
