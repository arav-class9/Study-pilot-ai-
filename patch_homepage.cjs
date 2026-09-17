const fs = require('fs');
const code = `
import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Play, 
  Brain, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Star,
  FileText,
  Target,
  PenTool,
  Lightbulb,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import robotImage from '../assets/images/cute_robot_reading_1789570270647.jpg';

export const HomePage: React.FC = () => {
  const { setActiveTab } = useApp();
  const { user } = useAuth();
  
  // Calculate dynamic progress based on user's mastery score
  const progressPercentage = user?.masteryScore || 65;

  const featureHighlights = [
    { icon: Brain, title: 'AI Powered', desc: 'Personalized learning\\nfor every student', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: BookOpen, title: 'NCERT Integrated', desc: 'All NCERT books &\\nchapters', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: ClipboardList, title: 'Smart Quizzes', desc: 'Test your knowledge\\n& track progress', color: 'text-orange-500', bg: 'bg-orange-100' },
    { icon: BarChart3, title: 'Track Progress', desc: 'See your growth\\nwith detailed reports', color: 'text-blue-500', bg: 'bg-blue-100' },
    { icon: Star, title: '24/7 Support', desc: 'Help whenever\\nyou need it', color: 'text-indigo-600', bg: 'bg-indigo-100' }
  ];

  const exploreFeatures = [
    { 
      id: 'ncert', 
      title: 'NCERT Books', 
      desc: 'Read, study and get summaries from all NCERT books.', 
      icon: BookOpen,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    { 
      id: 'practice', 
      title: 'Create Quiz', 
      desc: 'Generate quizzes from any chapter or topic.', 
      icon: ClipboardList,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    { 
      id: 'tutor', 
      title: 'AI Doubt Solver', 
      desc: 'Ask anything, get instant explanations.', 
      icon: Sparkles,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    { 
      id: 'plan', 
      title: 'Study Planner', 
      desc: 'Plan your study and stay on track.', 
      icon: Lightbulb,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100'
    },
    { 
      id: 'notes', 
      title: 'Notes & Summary', 
      desc: 'Get crisp notes and key points.', 
      icon: FileText,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-100'
    },
    { 
      id: 'practice', 
      title: 'Practice Tests', 
      desc: 'Improve with chapter-wise and full-length tests.', 
      icon: Target,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-3xl overflow-hidden mt-2 sm:mt-6">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-16 relative z-10">
          
          {/* Hero Left Content */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Your AI Study Companion</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Learn Smarter <br />
              with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Study Pilot AI</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg font-medium">
              Get personalized study plans, instant doubt solutions, AI-powered quizzes and more — all in one place.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => setActiveTab('tutor')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              
              <button className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-8 py-3.5 rounded-full flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                </div>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          {/* Hero Right Content - Illustration */}
          <div className="relative h-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            {/* Decorative Floating text */}
            <div className="absolute top-4 left-4 lg:-left-12 rotate-[-12deg] z-20">
              <p className="font-extrabold text-blue-700 text-lg sm:text-2xl leading-tight font-serif italic opacity-90">
                Better<br/>Learning<br/>Brighter<br/>Future
              </p>
            </div>

            {/* Checklist Floating Card */}
            <div className="absolute -right-2 sm:right-4 top-1/4 bg-white/90 backdrop-blur shadow-xl border border-slate-100 rounded-2xl p-4 z-20 hidden sm:block">
              <ul className="space-y-3">
                {['Study', 'Practice', 'Improve', 'Succeed'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Main Illustration */}
            <div className="relative w-full max-w-[500px] aspect-square rounded-full flex items-center justify-center z-10 p-4">
              <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-3xl mix-blend-multiply" />
              <img 
                src={robotImage} 
                alt="AI Robot studying" 
                className="w-full h-full object-contain drop-shadow-2xl z-10 scale-[1.1] sm:scale-100 origin-bottom"
                style={{ 
                  WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 100%)',
                  maskImage: 'radial-gradient(circle, black 65%, transparent 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Strip */}
      <section className="py-2 border-b border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featureHighlights.map((feature, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
              <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 \${feature.bg} \${feature.color}\`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{feature.title}</h4>
                <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid: Explore Features + Keep Going Card */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12 pt-6">
        
        {/* Left Column: Explore Features */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore Our Features</h2>
              <p className="text-sm text-slate-500 mt-1">Everything you need to ace your exams, in one place.</p>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group cursor-pointer transition-colors">
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {exploreFeatures.map((feat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(feat.id)}
                className="bg-white border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 rounded-3xl p-6 flex items-start gap-5 text-left group transition-all cursor-pointer"
              >
                <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 \${feat.iconBg} \${feat.iconColor}\`}>
                  <feat.icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed pr-6">{feat.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Keep Going Progress Card */}
        <div className="xl:col-span-1 pt-2 sm:pt-0">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden h-full min-h-[400px] flex flex-col">
            
            {/* Background Decorative Mountain Graphic (Simulated via CSS gradients) */}
            <div className="absolute bottom-0 left-0 right-0 h-48 opacity-40 pointer-events-none">
               <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-200/50 to-transparent" />
               <svg className="absolute bottom-0 w-full h-32 text-blue-200" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="currentColor" fillOpacity="0.5" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               </svg>
               <svg className="absolute bottom-0 w-full h-48 text-blue-100" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="currentColor" fillOpacity="0.8" d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,202.7C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
               </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 fill-amber-500" />
                </div>
                <h3 className="text-xl font-extrabold text-blue-700">Keep Going!</h3>
              </div>
              
              <p className="text-slate-700 font-medium text-lg leading-snug mb-8">
                Small steps every day<br/>lead to big results.
              </p>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white/50 shadow-sm mb-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 text-sm">Your Learning Progress</span>
                  <span className="font-bold text-slate-900 text-sm">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: \`\${progressPercentage}%\` }}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200/50 text-slate-600">
                <p className="font-serif italic text-lg leading-relaxed text-slate-700">
                  "The expert in anything was once a beginner."
                </p>
                <p className="text-sm font-bold mt-2 text-slate-500">— Helen Hayes</p>
              </div>
            </div>
            
          </div>
        </div>

      </section>

    </div>
  );
};
`;

fs.writeFileSync('src/pages/HomePage.tsx', code, 'utf8');
