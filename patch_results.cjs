const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamPage.tsx', 'utf8');

code = code.replace(
  /<div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm text-center flex flex-col gap-6 items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Award className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Exam Evaluation Complete</h2>
              <p className="text-sm text-slate-300">{completedAttempt.title}</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-2">
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col gap-2 text-left">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Marks</span>
                <p className="text-2xl font-bold text-white">
                  {completedAttempt.score} / {completedAttempt.totalMarks}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col gap-2 text-left">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Accuracy</span>
                <p className="text-2xl font-bold text-indigo-400">{completedAttempt.accuracy}%</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col gap-2 text-left">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Time Taken</span>
                <p className="text-2xl font-bold text-white">
                  {formatTimer(completedAttempt.timeTakenSeconds || 0)}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col gap-2 text-left">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Mistakes Logged</span>
                <p className="text-2xl font-bold text-amber-400">
                  {completedAttempt.answers.filter((a) => !a.isCorrect).length} Qs
                </p>
              </div>
            </div>
          </div>`
);

fs.writeFileSync('src/pages/ExamPage.tsx', code);
