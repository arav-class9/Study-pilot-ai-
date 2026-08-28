import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { CheckSquare, Square, Plus, Trash2, Sparkles, Check } from 'lucide-react';

export const FocusTasks: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, clearCompletedTasks, selectedSubject } =
    useFocus();
  const [newText, setNewText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addTask(newText, selectedSubject);
    setNewText('');
  };

  const suggestions = [
    `Solve 5 ${selectedSubject} practice problems`,
    `Review key formulas & definitions`,
    `Take notes on weak concepts`,
    `Complete active chapter quiz`,
  ];

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-300">
          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Session Micro-Goals ({completedCount}/{tasks.length})
          </span>
        </div>

        {completedCount > 0 && (
          <button
            onClick={clearCompletedTasks}
            className="text-[9px] text-slate-400 hover:text-rose-400 font-bold transition-colors cursor-pointer"
          >
            Clear Done
          </button>
        )}
      </div>

      {/* Input Field */}
      <form onSubmit={handleAdd} className="flex items-center gap-1.5">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add goal for this session..."
          className="flex-1 bg-slate-950/80 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-indigo-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
          title="Add Goal"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Suggestions if few tasks */}
      {tasks.length < 2 && (
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Quick Add Suggestions:
          </span>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 2).map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addTask(sug, selectedSubject)}
                className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition-colors text-left truncate cursor-pointer"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between gap-2 p-2 rounded-xl border text-xs transition-all ${
              task.completed
                ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
            >
              {task.completed ? (
                <div className="w-4 h-4 rounded-md bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className={`truncate ${task.completed ? 'line-through' : 'font-medium'}`}>
                {task.text}
              </span>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              {task.completed && (
                <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  +10 XP
                </span>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
