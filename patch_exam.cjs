const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamPage.tsx', 'utf8');

// 1. Container
code = code.replace(
  'className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto px-4 sm:px-6"',
  'className="flex flex-col gap-6 pb-24 md:pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"'
);

// 2. Header banner - anti-slop
code = code.replace(
  /<div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col gap-4">
            <div className="max-w-2xl flex flex-col gap-3">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Exam Simulator
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Configure your board parameters, select chapters, and run a timed assessment. The engine enforces curriculum weightage and negative marking.
              </p>
            </div>
          </div>`
);

// 3. Curriculum Coverage Banner -> Standardized
code = code.replace(
  /<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Curriculum Status
                </h2>
              </div>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold whitespace-nowrap">
                {curriculumCoverage.availableChapters} / {curriculumCoverage.totalChapters} Active
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Board</span>
                <p className="text-base font-bold text-slate-900">{board}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Class Level</span>
                <p className="text-base font-bold text-slate-900">Class {classLevel}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Topics</span>
                <p className="text-base font-bold text-indigo-700">{curriculumCoverage.totalTopics} Topics</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Question Pool</span>
                <p className="text-base font-bold text-slate-900">{curriculumCoverage.availableQuestionsCount} Qs</p>
              </div>
            </div>
          </div>`
);

// 4. Chapter Selection styling
code = code.replace(
  /className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 \${/g,
  "className={`min-h-[56px] p-4 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${"
);

code = code.replace(
  /'bg-indigo-50\/70 border-indigo-500 shadow-xs'/g,
  "'bg-indigo-50 border-indigo-600'"
);

// 5. Select elements
code = code.replace(
  /className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"/g,
  'className="w-full h-12 bg-white border border-slate-200 text-sm font-medium rounded-xl px-4 cursor-pointer outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"'
);

// 6. Exam Format Buttons touch targets
code = code.replace(
  /className={`p-2\.5 rounded-2xl border text-left cursor-pointer transition-all \${/g,
  "className={`min-h-[72px] p-4 rounded-2xl border text-left cursor-pointer transition-colors ${"
);

code = code.replace(
  /<div className="text-\[10px\] text-slate-500">\{type.desc\}<\/div>/g,
  '<div className="text-xs text-slate-500 mt-1">{type.desc}</div>'
);

// 7. Start Exam Button
code = code.replace(
  /className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all mt-4"/g,
  'className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-3 transition-colors mt-6"'
);

// 8. Exam Header Bar
code = code.replace(
  /className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4"/g,
  'className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5"'
);

// 9. Options
code = code.replace(
  /className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer \${/g,
  "className={`w-full min-h-[64px] text-left p-4 rounded-2xl border transition-colors flex items-center gap-4 cursor-pointer ${"
);
code = code.replace(
  /className="text-xs sm:text-sm font-semibold">\{opt\}<\/span>/g,
  'className="text-sm font-medium text-slate-800 leading-relaxed">{opt}</span>'
);
code = code.replace(
  /className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0"/g,
  'className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center shrink-0"'
);

// 10. Question Palette touch targets
code = code.replace(
  /className={`h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center relative \${btnStyle} \${/g,
  "className={`h-11 min-w-[44px] rounded-xl text-sm font-medium border transition-colors cursor-pointer flex items-center justify-center relative ${btnStyle} ${"
);

// 11. Prev/Next Buttons
code = code.replace(
  /className="px-3\.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"/g,
  'className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"'
);
code = code.replace(
  /className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs disabled:opacity-30 cursor-pointer"/g,
  'className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm disabled:opacity-30 cursor-pointer"'
);

fs.writeFileSync('src/pages/ExamPage.tsx', code);
