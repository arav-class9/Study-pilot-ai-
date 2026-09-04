import React, { useState, useEffect } from 'react';
import { generateChapterMindmapApi } from '../../services/aiClient';
import { GitBranch, Sparkles, X, Loader2, BookOpen, Layers, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface ConceptMindmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  subject: string;
  classLevel?: string;
}

export const ConceptMindmapModal: React.FC<ConceptMindmapModalProps> = ({
  isOpen,
  onClose,
  chapterName,
  subject,
  classLevel,
}) => {
  const [loading, setLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen && chapterName) {
      loadMindmap();
    }
  }, [isOpen, chapterName]);

  const loadMindmap = async () => {
    setLoading(true);
    try {
      const data = await generateChapterMindmapApi({
        chapterName,
        subject,
        classLevel,
      });
      setMindmapData(data);
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (e: any) {
      console.error('Failed to load mindmap:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredNodes = mindmapData?.nodes?.filter((n: any) => 
    activeCategory === 'all' ? true : n.category === activeCategory
  ) || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                  {subject} • AI Mindmap
                </span>
                <span className="text-[10px] text-slate-400">Class {classLevel || '10'}</span>
              </div>
              <h2 className="font-black text-lg sm:text-xl">{chapterName}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-base">Synthesizing AI Concept Graph...</h3>
            <p className="text-xs text-slate-500 max-w-md">
              Mapping core definitions, formulas, NCERT highlights, and exam traps for {chapterName}.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left / Top: Interactive Node Grid & Summary */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 bg-slate-50/50">
              {mindmapData?.summary && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">Exam Board Overview</h4>
                    <p className="text-xs text-indigo-900 mt-1 leading-relaxed">{mindmapData.summary}</p>
                  </div>
                </div>
              )}

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-2">Filter Category:</span>
                {[
                  { id: 'all', label: 'All Concepts' },
                  { id: 'core', label: 'Core Principles' },
                  { id: 'formula', label: 'Formulas' },
                  { id: 'example', label: 'Examples' },
                  { id: 'trap', label: 'Exam Traps' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Node Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredNodes.map((node: any) => {
                  const isSelected = selectedNode?.id === node.id;
                  const categoryColors: any = {
                    core: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    formula: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    example: 'bg-amber-50 text-amber-700 border-amber-200',
                    trap: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${categoryColors[node.category] || 'bg-slate-100 text-slate-700'}`}>
                          {node.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{node.id}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{node.label}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{node.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Selected Node Deep Dive Detail Panel */}
            <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex flex-col justify-between">
              {selectedNode ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Node Focus: {selectedNode.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{selectedNode.id}</span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-black text-slate-900 text-lg">{selectedNode.label}</h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      {selectedNode.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Board Exam Tip</h4>
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Always write the derived SI units and state assumptions clearly when answering this concept in board examinations.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400">
                  Select a concept node to view detailed explanation.
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>AI Concept Graph</span>
                <button
                  onClick={loadMindmap}
                  className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
