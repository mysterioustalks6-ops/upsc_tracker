import React, { useState } from 'react';
import { ShieldAlert, Users, Database, Settings, Lock, Unlock, CheckCircle2, AlertTriangle, RefreshCw, Radio, Gift, DollarSign } from 'lucide-react';
import { User } from 'firebase/auth';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  syllabus: any;
  stateData: any;
  onGrantProPass?: (days: number, targetEmail?: string) => void;
  pricingConfig: { [key: string]: number };
  onUpdatePricing: (newPricing: { [key: string]: number }) => void;
  restrictedFeatures: { [key: string]: boolean };
  onUpdateRestrictions: (newRestrictions: { [key: string]: boolean }) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  syllabus,
  stateData,
  onGrantProPass,
  pricingConfig,
  onUpdatePricing,
  restrictedFeatures,
  onUpdateRestrictions
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'pricing' | 'propass' | 'security' | 'announcement' | 'features'>('pricing');
  const [announcementText, setAnnouncementText] = useState('🚨 UPSC Live Target Update: Stay disciplined and maintain daily goal streaks!');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [passDays, setPassDays] = useState(30);

  const [localPricing, setLocalPricing] = useState(pricingConfig);
  const [localRestrictions, setLocalRestrictions] = useState(restrictedFeatures);
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    onUpdatePricing(localPricing);
    onUpdateRestrictions(localRestrictions);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                UPSC Master Admin Command Center
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-mono">SECURE v3.5</span>
              </h2>
              <p className="text-xs text-slate-400">Logged in as Admin: <span className="text-cyan-400 font-mono">{currentUser?.email}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sub-navbar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-2 bg-slate-950/60 border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'pricing' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <DollarSign className="w-4 h-4" /> Pricing Control
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'features' ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings className="w-4 h-4" /> Feature Paywalls
          </button>
          <button
            onClick={() => setActiveTab('propass')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'propass' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Gift className="w-4 h-4" /> Grant Free Pass
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'users' ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users className="w-4 h-4" /> Users
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'security' ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'announcement' ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Radio className="w-4 h-4" /> Broadcast
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-400" /> Custom Pro Pass Pricing Control (INR ₹)
                </h3>
                <p className="text-xs text-slate-400">Set the prices that users see when purchasing Pro Passes on the monetization page.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-mono text-slate-300 block">7 Days Trial Pass (₹)</label>
                  <input
                    type="number"
                    value={localPricing.days7 ?? 99}
                    onChange={(e) => setLocalPricing({ ...localPricing, days7: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-mono text-slate-300 block">30 Days Monthly Pass (₹)</label>
                  <input
                    type="number"
                    value={localPricing.days30 ?? 299}
                    onChange={(e) => setLocalPricing({ ...localPricing, days30: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-mono text-slate-300 block">90 Days Quarterly Pass (₹)</label>
                  <input
                    type="number"
                    value={localPricing.days90 ?? 699}
                    onChange={(e) => setLocalPricing({ ...localPricing, days90: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-mono text-slate-300 block">365 Days Yearly VIP Pass (₹)</label>
                  <input
                    type="number"
                    value={localPricing.days365 ?? 1999}
                    onChange={(e) => setLocalPricing({ ...localPricing, days365: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-red-400" /> Feature Restriction & Paywall Control
                </h3>
                <p className="text-xs text-slate-400">Toggle features to lock them for non-pro users behind a paywall requiring Pro Pass or Ad watch.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-200">AI Coach & Mentor Module</div>
                    <div className="text-[11px] text-slate-400">Require Pro Pass to chat with AI UPSC Coach</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localRestrictions.aiCoach ?? false}
                    onChange={(e) => setLocalRestrictions({ ...localRestrictions, aiCoach: e.target.checked })}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Mock Test Engine</div>
                    <div className="text-[11px] text-slate-400">Require Pro Pass to take full UPSC Prelims Mock Tests</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localRestrictions.mockTest ?? false}
                    onChange={(e) => setLocalRestrictions({ ...localRestrictions, mockTest: e.target.checked })}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Syllabus Customization & Editing</div>
                    <div className="text-[11px] text-slate-400">Restrict editing or adding custom syllabus items</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localRestrictions.syllabusEdit ?? false}
                    onChange={(e) => setLocalRestrictions({ ...localRestrictions, syllabusEdit: e.target.checked })}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Advanced Analytics & Export</div>
                    <div className="text-[11px] text-slate-400">Restrict analytics history and data export</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localRestrictions.analyticsExport ?? false}
                    onChange={(e) => setLocalRestrictions({ ...localRestrictions, analyticsExport: e.target.checked })}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'propass' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-cyan-400" /> Free Pro Pass Distributor
                </h3>
                <p className="text-xs text-slate-400">Grant free pro pass days to yourself or connected users instantly.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Target User Email (Leave blank for current account)</label>
                  <input
                    type="email"
                    placeholder="user@gmail.com"
                    value={targetUserEmail}
                    onChange={(e) => setTargetUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Pass Duration (Days)</label>
                  <select
                    value={passDays}
                    onChange={(e) => setPassDays(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value={7}>7 Days Trial Pro Pass</option>
                    <option value={30}>30 Days Monthly Pro Pass</option>
                    <option value={90}>90 Days Quarterly Pro Pass</option>
                    <option value={365}>365 Days Yearly VIP Pro Pass</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (onGrantProPass) {
                      onGrantProPass(passDays, targetUserEmail);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  🚀 Grant Free Pro Pass Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Active Cloud Users Database</h3>
                <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded border border-cyan-500/30">1 Active Secure Session</span>
              </div>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">User UID / Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Cloud Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    <tr>
                      <td className="p-3 font-bold text-cyan-400 flex items-center gap-2">
                        {currentUser?.photoURL && <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full" />}
                        {currentUser?.email || 'admin@upsc.sys'}
                      </td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">ADMINISTRATOR</span></td>
                      <td className="p-3 text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Synchronized</td>
                      <td className="p-3">
                        <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] cursor-pointer">View Data</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Firewall & Anti-Exploit Protection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Firestore Strict Security Rules</span>
                    <span className="text-xs text-emerald-400 font-mono">ACTIVE (Enforced)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Users can only read and write to their own isolated path (`/users/&#123;userId&#125;/*`).</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Maintenance Lockout Mode</span>
                    <button
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                    >
                      {maintenanceMode ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Blocks regular user access for system patching.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcement' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Global System Announcement Banner</h3>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Broadcast Message to All Users</label>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Broadcast Announcement Now
              </button>
            </div>
          )}

          {savedStatus && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Admin configuration successfully saved and synchronized!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">UPSC Command Security Level: Maximum</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
            >
              Save Configuration
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
