const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamPage.tsx', 'utf8');

code = code.replace(
  /className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"/g,
  'className="flex-1 min-h-[56px] py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"'
);

code = code.replace(
  /className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md cursor-pointer"/g,
  'className="flex-1 min-h-[56px] py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm cursor-pointer transition-colors"'
);

fs.writeFileSync('src/pages/ExamPage.tsx', code);
