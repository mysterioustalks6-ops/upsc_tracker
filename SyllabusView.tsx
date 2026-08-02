import React, { useState } from 'react';
import { SyllabusData } from '../types';
import { Search, Star, AlertTriangle, CheckSquare, Square, Filter, Plus, X, Trash2, RotateCcw, Flame, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SyllabusViewProps {
  syllabus: SyllabusData;
  completedTopicIds: string[];
  starredTopicIds: string[];
  weakTopicIds: string[];
  onToggleTopic: (id: string, arrayName: 'completedTopics' | 'starredTopics' | 'weakTopics') => void;
  onAddTopic?: (subject: string, title: string, pyq: string) => void;
  onDeleteTopic?: (subject: string, id: string) => void;
  onResetSyllabus?: () => void;
  onUndoLastAction?: () => void;
  canUndo?: boolean;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  syllabus,
  completedTopicIds = [],
  starredTopicIds = [],
  weakTopicIds = [],
  onToggleTopic,
  onAddTopic,
  onDeleteTopic,
  onResetSyllabus,
  onUndoLastAction,
  canUndo = false,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pyqFilter, setPyqFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add Topic state
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPyq, setNewPyq] = useState('Normal');

  const subjects = Object.keys(syllabus);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTitle.trim()) return;
    if (onAddTopic) {
      onAddTopic(newSubject.trim(), newTitle.trim(), newPyq);
    }
    setNewTitle('');
    setIsAdding(false);
  };

  // Flatten topics with subject context
  const allTopics = subjects.flatMap((subject) =>
    (syllabus[subject] || []).map((t) => ({
      ...t,
      subject
    }))
  );

  const filteredTopics = allTopics.filter((item) => {
    if (selectedSubject !== 'ALL' && item.subject !== selectedSubject) return false;
    if (pyqFilter !== 'ALL' && item.pyq !== pyqFilter) return false;

    const isCompleted = completedTopicIds.includes(item.id);
    const isStarred = starredTopicIds.includes(item.id);
    const isWeak = weakTopicIds.includes(item.id);

    if (statusFilter === 'COMPLETED' && !isCompleted) return false;
    if (statusFilter === 'PENDING' && isCompleted) return false;
    if (statusFilter === 'STARRED' && !isStarred) return false;
    if (statusFilter === 'WEAK' && !isWeak) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubject = item.subject.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 font-sans text-slate-100">
      {/* FILTER CONTROLS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl bg-[#090E1A]/90 border border-slate-800/90 backdrop-blur-xl space-y-4 shadow-2xl"
      >
        <div className="flex flex-wrap gap-3 items-center">
          {/* Subject Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-mono text-cyan-400 block mb-1.5 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Subject Filter
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono cursor-pointer transition-all"
            >
              <option value="ALL">All Subjects ({allTopics.length})</option>
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj} ({syllabus[subj]?.length || 0})
                </option>
              ))}
            </select>
          </div>

          {/* PYQ Weightage Filter */}
          <div className="w-40">
            <label className="text-[11px] font-mono text-amber-400 block mb-1.5 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> PYQ Priority
            </label>
            <select
              value={pyqFilter}
              onChange={(e) => setPyqFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono cursor-pointer transition-all"
            >
              <option value="ALL">All PYQs</option>
              <option value="High">🔥 High Priority</option>
              <option value="Medium">⚡ Medium</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <label className="text-[11px] font-mono text-purple-400 block mb-1.5 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono cursor-pointer transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">⏳ Pending Only</option>
              <option value="COMPLETED">✅ Completed</option>
              <option value="STARRED">⭐ Starred</option>
              <option value="WEAK">⚠️ Flagged Weak</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search topic keyword (e.g., Buddhism, Fundamental Rights, Budget)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-all"
          />
        </div>
      </motion.div>

      {/* TOPIC LIST COUNTER & ACTION BUTTONS */}
      <div className="flex flex-wrap justify-between items-center text-xs font-mono text-slate-400 px-1 gap-2">
        <span className="font-bold">
          Showing <strong className="text-cyan-400">{filteredTopics.length}</strong> of{' '}
          {allTopics.length} topics
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* UNDO BUTTON */}
          {canUndo && onUndoLastAction && (
            <button
              onClick={onUndoLastAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold cursor-pointer transition-all text-xs hover:scale-105 active:scale-95 shadow-md"
              title="Undo last syllabus import / change"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>↩️ Undo Import</span>
            </button>
          )}

          {/* RESET / PURGE SYLLABUS BUTTON */}
          {onResetSyllabus && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete custom imported syllabus and restore the default UPSC syllabus?')) {
                  onResetSyllabus();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 font-bold cursor-pointer transition-all text-xs hover:scale-105 active:scale-95 shadow-md"
              title="Reset to default baseline syllabus"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Syllabus</span>
            </button>
          )}

          {onAddTopic && (
            <button
              onClick={() => {
                setNewSubject(selectedSubject !== 'ALL' ? selectedSubject : subjects[0] || 'General Studies');
                setIsAdding(!isAdding);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold cursor-pointer transition-all text-xs hover:scale-105 active:scale-95 shadow-md"
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Close' : 'Add Custom Topic'}</span>
            </button>
          )}
        </div>
      </div>

      {/* INLINE ADD TOPIC FORM */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateTopic}
            className="p-4 rounded-2xl border border-cyan-500/40 space-y-3 bg-[#090E1A]/90 backdrop-blur-xl shadow-2xl"
          >
            <div className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add New Topic to Syllabus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Polity, History"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Topic Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Supreme Court vs High Court Powers"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-mono text-slate-400">PYQ Priority:</label>
                <select
                  value={newPyq}
                  onChange={(e) => setNewPyq(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#040711] border border-slate-800 text-xs text-white font-mono"
                >
                  <option value="High">🔥 High</option>
                  <option value="Medium">⚡ Medium</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-lg shadow-cyan-950 transition-all hover:scale-105 active:scale-95"
              >
                Save Topic
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* TOPIC CARDS GRID */}
      <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic, index) => {
            const isCompleted = completedTopicIds.includes(topic.id);
            const isStarred = starredTopicIds.includes(topic.id);
            const isWeak = weakTopicIds.includes(topic.id);

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-[#060912]/60 border-slate-800/60 opacity-60'
                    : 'bg-[#090E1A]/90 border-slate-800/90 hover:border-cyan-500/50 hover:scale-[1.005] shadow-lg'
                }`}
              >
                {/* Completion Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTopic(topic.id, 'completedTopics');
                  }}
                  className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-all cursor-pointer hover:scale-110 active:scale-90"
                  title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                >
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Main Content */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onToggleTopic(topic.id, 'completedTopics')}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#040711] text-slate-300 border border-slate-800 font-bold">
                      {topic.subject}
                    </span>

                    {/* Sub-topics & Time Badge */}
                    {(() => {
                      const subCount = (topic.microTopics && Array.isArray(topic.microTopics) && topic.microTopics.length > 0)
                        ? topic.microTopics.length
                        : 1;
                      const topicHrs = (subCount * 2.5).toFixed(1).replace('.0', '');
                      return (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                          ⏱️ {subCount} Sub-topic{subCount > 1 ? 's' : ''} ({topicHrs} hrs)
                        </span>
                      );
                    })()}

                    {/* PYQ Badge */}
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        topic.pyq === 'High'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm'
                          : topic.pyq === 'Medium'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      {topic.pyq === 'High'
                        ? '🔥 High PYQ'
                        : topic.pyq === 'Medium'
                        ? '⚡ Medium PYQ'
                        : 'PYQ'}
                    </span>
                  </div>

                  <div
                    className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                      isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {topic.title}
                  </div>

                  {/* Micro / Sub-topics list */}
                  {topic.microTopics && Array.isArray(topic.microTopics) && topic.microTopics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {topic.microTopics.map((sub, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                            isCompleted
                              ? 'bg-slate-900/60 text-slate-600 line-through'
                              : 'bg-slate-800/70 text-slate-300 border border-slate-700/60'
                          }`}
                        >
                          • {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Action Toggles (Star, Weak, Delete) */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTopic(topic.id, 'starredTopics');
                    }}
                    title={isStarred ? 'Unstar' : 'Star Topic'}
                    className={`p-2 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer ${
                      isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTopic(topic.id, 'weakTopics');
                    }}
                    title={isWeak ? 'Unflag Weak Topic' : 'Flag as Weak Topic'}
                    className={`p-2 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer ${
                      isWeak ? 'text-rose-400 fill-rose-400' : 'text-slate-600 hover:text-rose-300'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>

                  {onDeleteTopic && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete topic "${topic.title}"?`)) {
                          onDeleteTopic(topic.subject, topic.id);
                        }
                      }}
                      title="Delete this topic"
                      className="p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-[#090E1A]/60 rounded-2xl border border-slate-800 text-slate-400 font-mono text-xs">
            No syllabus topics matched your active filters.
          </div>
        )}
      </div>
    </div>
  );
};

