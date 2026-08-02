import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, AiCoachMessage } from '../types';
import { X, Sparkles, Send, Bot, User, RefreshCw, Volume2, VolumeX, Flame, Zap, Award, BookOpen, Target, Copy, Check } from 'lucide-react';

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: AnalyticsSummary;
  completedTopicsCount: number;
  weakTopicsCount: number;
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({
  isOpen,
  onClose,
  analytics,
  completedTopicsCount,
  weakTopicsCount
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<'sprint' | 'mains' | 'weak' | 'planner'>('sprint');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<AiCoachMessage[]>([
    {
      id: 'm-init',
      role: 'assistant',
      content: `🏛️ **UPSC AI STRATEGIC ARCHITECT & MENTOR v3.0 ONLINE**

I have loaded your real-time Civil Services performance telemetry:
- **Rank Title**: ${analytics.rankTitle} (Level ${analytics.rankLevel})
- **Predicted Finish Date**: **${analytics.estimatedFinishDate}** (${analytics.remainingDays} days remaining)
- **Velocity Target**: **${analytics.requiredDailyTotalHours.toFixed(1)} hrs/day** required
- **Recovery Status**: ${analytics.isRecoveryMode ? '⚠️ RECOVERY MODE ACTIVE (Pace boost required)' : '✅ OPTIMAL MOMENTUM'}
- **Weak Topics Flagged**: **${weakTopicsCount} Topics**

Choose a Strategic Mode or ask any UPSC query in Hindi / Hinglish / English below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Stop speech when modal closes
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const strategicModes = [
    { id: 'sprint', label: '⚡ Prelims Velocity Sprint', prompt: '⚡ Provide a high-yield 7-Day Prelims speed sprint timetable focusing on my highest weightage subjects.' },
    { id: 'mains', label: '✍️ Mains Answer Writing Master', prompt: '✍️ Give me a daily 2-hour GS Mains answer writing template with intro-body-diagram-conclusion structure.' },
    { id: 'weak', label: '🔬 Re-engineer Weak Topics', prompt: '🔬 Analyze my flagged weak topics and generate a 3-step revision & active recall framework.' },
    { id: 'planner', label: '🎯 30-Day Custom Timetable', prompt: '🎯 Draft a comprehensive 30-day UPSC timetable based on my target required study hours.' }
  ];

  const quickPrompts = [
    '⚡ How to cover GS1, GS2, GS3, GS4 in parallel?',
    '📖 Ideal 1-7-30 day revision cycle framework',
    '✍️ How to write high-scoring answers in Mains?',
    '🎯 How to analyze Mock Test mistakes & negative marks?'
  ];

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[*#_`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt.trim();
    if (!textToSend || loading) return;

    const userMsg: AiCoachMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: textToSend,
          summaryMetrics: analytics,
          completedTopicsCount,
          weakTopicsCount,
          activeMode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI strategy.');
      }

      const botMsg: AiCoachMessage = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'I could not generate a strategic response at this moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: AiCoachMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `❌ **AI Architect Error**: ${err.message || 'Server communication issue.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="w-full max-w-3xl bg-[#090D16] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-[#050810]/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                UPSC AI Strategic Coach v3.0
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                  Gemini 3.6 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hi-Tech AI Mentor, Study Plan Generator & Weakness Diagnosis System
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

        {/* Telemetry Dashboard Banner */}
        <div className="p-3 bg-[#060912] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Finish Target</div>
            <div className="text-cyan-400 font-bold">{analytics.estimatedFinishDate}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Target Hours/Day</div>
            <div className="text-emerald-400 font-bold">{analytics.requiredDailyTotalHours.toFixed(1)} hrs</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">UPSC Rank</div>
            <div className="text-amber-300 font-bold truncate">{analytics.rankTitle}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Weak Topics</div>
            <div className="text-rose-400 font-bold">{weakTopicsCount} Topics</div>
          </div>
        </div>

        {/* Strategic Modes Selector */}
        <div className="p-2.5 bg-[#050810] border-b border-slate-800 flex gap-2 overflow-x-auto text-xs font-mono shrink-0">
          {strategicModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id as any);
                handleSend(mode.prompt);
              }}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeMode === mode.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border-orange-400 shadow-md'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Quick Prompts Chips */}
        <div className="px-3 py-2 bg-[#030509] border-b border-slate-800/80 flex gap-2 overflow-x-auto text-[11px] font-mono shrink-0">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-cyan-500/20 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#020408]/70 font-sans text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="p-2 rounded-xl bg-orange-950/80 border border-orange-500/30 text-orange-400 shrink-0 h-fit mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] p-4 rounded-2xl relative group ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-slate-950 font-semibold rounded-tr-none shadow-md shadow-orange-950'
                    : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</div>

                {/* Response Actions (Speech & Copy) */}
                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                        title="Listen Voice Reader"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 text-rose-400" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-cyan-400" />
                            <span>🔊 Listen Coach</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 shrink-0 h-fit mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs py-2 bg-slate-900/60 p-3 rounded-xl border border-cyan-500/30">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Synthesizing high-yield Civil Services strategic response...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#050810]/95">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask UPSC Master AI Coach anything (e.g. 'Mains Answer Writing Strategy for GS3')..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#020408] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-orange-950"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
