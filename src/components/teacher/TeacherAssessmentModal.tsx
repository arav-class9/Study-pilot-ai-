import React, { useState } from 'react';
import {
  generateTeacherWorksheetAPI,
  TeacherWorksheetResult,
  TeacherWorksheetParams,
} from '../../services/teacherToolsClient';
import {
  X,
  FileText,
  Sparkles,
  Printer,
  Copy,
  Check,
  Download,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TeacherAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultClass?: string;
}

export const TeacherAssessmentModal: React.FC<TeacherAssessmentModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'Science',
  defaultClass = '10',
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [classLevel, setClassLevel] = useState(defaultClass);
  const [board, setBoard] = useState('CBSE');
  const [chapterName, setChapterName] = useState('Chemical Reactions and Equations');
  const [worksheetType, setWorksheetType] = useState<'question_paper' | 'practice_worksheet' | 'chapter_test' | 'revision_drill'>('question_paper');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [totalMarks, setTotalMarks] = useState(40);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<TeacherWorksheetResult | null>(null);
  const [activeTab, setActiveTab] = useState<'paper' | 'answers' | 'rubric'>('paper');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!chapterName.trim()) {
      setErrorMsg('Please enter a chapter name.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const generated = await generateTeacherWorksheetAPI({
        subject,
        classLevel,
        board,
        chapterName: chapterName.trim(),
        worksheetType,
        difficulty,
        totalMarks,
        includeAnswerKey,
        language,
      });

      setResult(generated);
    } catch (err: any) {
      console.error('Worksheet generation error:', err);
      setErrorMsg(err.message || 'Failed to generate assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    let md = `# ${result.title}\n`;
    md += `**Board:** ${result.board} | **Class:** ${result.classLevel} | **Subject:** ${result.subject} | **Max Marks:** ${result.totalMarks} | **Time:** ${result.suggestedDurationMinutes} mins\n\n`;
    md += `### General Instructions:\n`;
    result.instructions.forEach((ins, idx) => {
      md += `${idx + 1}. ${ins}\n`;
    });
    md += `\n---\n\n`;

    result.sections.forEach((sec) => {
      md += `## ${sec.sectionName} (${sec.totalMarks} Marks)\n*${sec.sectionDescription}*\n\n`;
      sec.questions.forEach((q) => {
        md += `**Q${q.questionNumber}.** ${q.questionText} *[${q.marks} Mark${q.marks > 1 ? 's' : ''}]*\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            md += `  (${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
        md += `\n`;
      });
    });

    if (includeAnswerKey && result.answerKeyAndMarkingScheme) {
      md += `\n---\n## Answer Key & Step-by-Step Marking Scheme\n\n`;
      result.answerKeyAndMarkingScheme.forEach((ak) => {
        md += `**Q${ak.questionNumber}:** ${ak.modelAnswer}\n`;
        if (ak.markingCriteria && ak.markingCriteria.length > 0) {
          md += `*Marking Scheme:* ${ak.markingCriteria.join(' | ')}\n\n`;
        }
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-700 via-purple-700 to-pink-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                AI Teacher Assessment & Toolkit
              </h3>
              <p className="text-xs text-indigo-100 font-medium">
                Generate CBSE Question Papers, Classroom Worksheets & Chapter Mastery Tests
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!result ? (
            /* CONFIGURATION FORM */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Assessment Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assessment Format
                  </label>
                  <select
                    value={worksheetType}
                    onChange={(e: any) => {
                      setWorksheetType(e.target.value);
                      if (e.target.value === 'question_paper') setTotalMarks(40);
                      else if (e.target.value === 'chapter_test') setTotalMarks(25);
                      else setTotalMarks(20);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="question_paper">CBSE Question Paper (Section A-E)</option>
                    <option value="practice_worksheet">Formative Classroom Worksheet</option>
                    <option value="chapter_test">20-Min Chapter Diagnostic Test</option>
                    <option value="revision_drill">Rapid Revision Question Drill</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Science">Science (PCB)</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Social Science">Social Science</option>
                  </select>
                </div>

                {/* Class Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Class Level
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="9">Class 9 (NCERT)</option>
                    <option value="10">Class 10 (Board Exam)</option>
                    <option value="11">Class 11 (Senior Secondary)</option>
                    <option value="12">Class 12 (Board / JEE / NEET)</option>
                  </select>
                </div>
              </div>

              {/* Chapter Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Chapter or Topic
                </label>
                <input
                  type="text"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="e.g. Chemical Reactions and Equations / Life Processes / Quadratic Equations"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Marks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Marks
                  </label>
                  <select
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value={20}>20 Marks (Quick Test)</option>
                    <option value={25}>25 Marks (Standard Unit Test)</option>
                    <option value={40}>40 Marks (Periodic Assessment / Half Term)</option>
                    <option value={80}>80 Marks (Full Board Exam Mock Paper)</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Difficulty Profile
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="mixed">Mixed (CBSE Standard 50% Med, 30% Easy, 20% Hard)</option>
                    <option value="easy">Foundational (Remedial & Revision)</option>
                    <option value="medium">Standard Competency</option>
                    <option value="hard">High Order Thinking (HOTS / Olympiad)</option>
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Language Medium
                  </label>
                  <select
                    value={language}
                    onChange={(e: any) => setLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="en">English Medium</option>
                    <option value="hi">हिंदी माध्यम (Hindi Medium)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Generate Step-by-Step Marking Scheme & Answer Key</span>
                </label>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Structuring CBSE Assessment with Marking Rubrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Complete Teacher Assessment</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ASSESSMENT PREVIEW & CONTROLS */
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('paper')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'paper'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Question Paper
                  </button>
                  <button
                    onClick={() => setActiveTab('answers')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'answers'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Marking Scheme & Solutions
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Create New
                  </button>
                </div>
              </div>

              {/* Paper Content */}
              {activeTab === 'paper' && (
                <div id="printable-assessment-sheet" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                  {/* Paper Header */}
                  <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {result.institutionHeader || 'CBSE ACADEMIC ASSESSMENT'}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {result.title}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
                      <span>Board: {result.board}</span>
                      <span>•</span>
                      <span>Class: {result.classLevel}</span>
                      <span>•</span>
                      <span>Subject: {result.subject}</span>
                      <span>•</span>
                      <span>Time: {result.suggestedDurationMinutes} Minutes</span>
                      <span>•</span>
                      <span>Max Marks: {result.totalMarks}</span>
                    </div>
                  </div>

                  {/* General Instructions */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px]">
                      General Instructions:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1">
                      {result.instructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Sections */}
                  <div className="space-y-6">
                    {result.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-4">
                        <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <div>
                            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                              {sec.sectionName}
                            </h4>
                            <p className="text-xs text-slate-500">{sec.sectionDescription}</p>
                          </div>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                            {sec.totalMarks} Marks
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {sec.questions.map((q) => (
                            <div
                              key={q.questionNumber}
                              className="bg-slate-50/70 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mr-1">
                                    Q{q.questionNumber}.
                                  </span>
                                  {q.questionText}
                                </p>
                                <span className="text-xs font-bold text-slate-500 shrink-0">
                                  [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                                </span>
                              </div>

                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                                    >
                                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold text-[10px] flex items-center justify-center">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers & Solutions Tab */}
              {activeTab === 'answers' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      Model Answers & Marking Scheme (For Teachers)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard point-wise evaluation criteria based on NCERT guidelines.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {result.answerKeyAndMarkingScheme.map((ak) => (
                      <div
                        key={ak.questionNumber}
                        className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                            Solution for Question {ak.questionNumber}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed whitespace-pre-line">
                          {ak.modelAnswer}
                        </p>

                        {ak.markingCriteria && ak.markingCriteria.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                            <p className="text-[10px] font-extrabold uppercase text-slate-400">
                              Mark Allocation Breakdown:
                            </p>
                            <ul className="text-xs text-emerald-700 dark:text-emerald-400 list-disc pl-4 space-y-0.5">
                              {ak.markingCriteria.map((mc, mIdx) => (
                                <li key={mIdx}>{mc}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {result.pedagogicalNotes && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl space-y-1 text-xs text-amber-900 dark:text-amber-200">
                      <p className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Teacher Pedagogical Guidance:</span>
                      </p>
                      <p>{result.pedagogicalNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
