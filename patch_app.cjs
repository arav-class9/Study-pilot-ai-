const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard imports with React.lazy
const importsToReplace = [
  'HomePage', 'AITutorPage', 'LearnPage', 'PracticeQuizPage',
  'WeaknessRadarPage', 'StudyPlanPage', 'ProgressPage', 'ProfilePage',
  'AdminPage', 'MistakesPage', 'ExamPage', 'ParentDashboardPage',
  'TeacherDashboardPage'
];

importsToReplace.forEach(page => {
  const regex = new RegExp(`import \\{ ${page} \\} from '\\./pages/${page}';`, 'g');
  appCode = appCode.replace(regex, `const ${page} = React.lazy(() => import('./pages/${page}').then(module => ({ default: module.${page} })));`);
});

// Wrap the active tab switch in Suspense
const switchRegex = /const renderContent = \(\) => \{\s*switch \(activeTab\) \{([\s\S]*?)\}\s*\};/;
const match = appCode.match(switchRegex);
if (match) {
  const wrapped = `const renderContent = () => {
    return (
      <React.Suspense fallback={<div className="flex h-[80vh] items-center justify-center text-slate-500 font-bold animate-pulse">Loading ${"${activeTab}"} view...</div>}>
        {(() => {
          switch (activeTab) {${match[1]}}
        })()}
      </React.Suspense>
    );
  };`;
  appCode = appCode.replace(switchRegex, wrapped);
}

fs.writeFileSync('src/App.tsx', appCode);
console.log('App.tsx patched for lazy loading.');
