import React, { useState } from 'react';
import { MockTest } from '../types';
import { Target, Plus, Trash2, Award, FileText } from 'lucide-react';

interface MockTestViewProps {
  mockTests: MockTest[];
  onAddMockTest: (test: Omit<MockTest, 'id'>) => void;
  onDeleteMockTest: (id: string) => void;
}

export const MockTestView: React.FC<MockTestViewProps> = ({
  mockTests = [],
  onAddMockTest,
  onDeleteMockTest
}) => {
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('200');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !score) return;

    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    onAddMockTest({
      name: name.trim(),
      score: Number(score),
      maxScore: Number(maxScore) || 200,
      subject: subject.trim() || 'General Studies',
      date: todayStr,
      notes: notes.trim()
    });

    setName('');
    setScore('');
    setSubject('');
    setNotes('');
  };

  const totalTests = mockTests.length;
  const avgScore =
    totalTests > 0
      ? mockTests.reduce((acc, t) => acc + (t.score / (t.maxScore || 200)) * 100, 0) / totalTests
      : 0;
  const maxRecorded =
    totalTests > 0
      ? Math.max(...mockTests.map((t) => (t.score / (t.maxScore || 200)) * 100))
      : 0;

  return (
    <div className="space-y-5 font-sans text-slate-100">
      {/* MOCK SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-3.5 rounded-xl border-l-4 border-cyan-500 text-center">
          <div className="text-xl font-black font-mono cyan-glow">{totalTests}</div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
            Total Mocks Logged
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border-l-4 border-emerald-500 text-center">
          <div className="text-xl font-black font-mono emerald-glow">
            {avgScore.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
            Average Score %
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border-l-4 border-orange-500 text-center">
          <div className="text-xl font-black font-mono orange-glow">
            {maxRecorded.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
            Highest Score %
          </div>
        </div>
      </div>

      {/* ADD MOCK TEST FORM */}
      <form
        onSubmit={handleSubmit}
        className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 shadow-xl"
      >
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Add New Mock Test Record</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold tracking-wider">
              Test Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VisionIAS GS Prelims Test 01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold tracking-wider">
              Score Obtained *
            </label>
            <input
              type="number"
              required
              step="0.5"
              placeholder="e.g. 104.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold tracking-wider">
              Max Marks
            </label>
            <input
              type="number"
              placeholder="200"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold tracking-wider">
              Subject Focus
            </label>
            <input
              type="text"
              placeholder="e.g. Polity & Modern History"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold tracking-wider">
              Analysis / Weak Areas
            </label>
            <input
              type="text"
              placeholder="e.g. Silly errors in DPSP & Modern Movements"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-xs font-bold text-slate-950 transition-all shadow-md shadow-orange-950 cursor-pointer font-mono uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mock Record</span>
          </button>
        </div>
      </form>

      {/* MOCK HISTORY TABLE */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-2xl">
        <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-3">
          🎯 Mock Test History
        </div>

        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#0A0F18] text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3 font-semibold uppercase text-[10px]">Test Name</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px]">Subject</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-center">Score</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-center">%</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px]">Date</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px]">Analysis Notes</th>
              <th className="px-4 py-3 font-semibold uppercase text-[10px] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {mockTests.length > 0 ? (
              mockTests.map((t) => {
                const pct = ((t.score / (t.maxScore || 200)) * 100).toFixed(1);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{t.name}</td>
                    <td className="px-4 py-3 text-slate-400">{t.subject || 'GS'}</td>
                    <td className="px-4 py-3 text-center font-bold text-cyan-300">
                      {t.score} / {t.maxScore || 200}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          Number(pct) >= 55
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : Number(pct) >= 45
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{t.date}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {t.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onDeleteMockTest(t.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete test record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500 font-mono">
                  No mock test records logged yet. Add your first score above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
