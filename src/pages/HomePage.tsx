
import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { translateUI, SupportedLanguage } from '../services/i18n';
import { 
  Sparkles, Rocket, 
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
  ArrowRight,
  Users,
  Layers,
  Share2,
  Search,
  Cpu
} from 'lucide-react';
import robotImage from '../assets/images/cute_robot_reading_1789570270647.jpg';

import { SM2SpacedRepetitionModal } from '../components/repetition/SM2SpacedRepetitionModal';
import { InteractiveDiagramExplainerModal } from '../components/ai/InteractiveDiagramExplainerModal';
import { PeerStudyRoomModal } from '../components/workspace/PeerStudyRoomModal';
import { ClassroomLMSExportModal } from '../components/teacher/ClassroomLMSExportModal';
import { DeepResearchModal } from '../components/search/DeepResearchModal';

export const HomePage: React.FC = () => {
  const { setActiveTab, learningProfile, language } = useApp();
  const { user } = useAuth();

  const currentLang = (language as SupportedLanguage) || 'en';

  const [isSM2Open, setIsSM2Open] = React.useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = React.useState(false);
  const [isPeerRoomOpen, setIsPeerRoomOpen] = React.useState(false);
  const [isLMSExportOpen, setIsLMSExportOpen] = React.useState(false);
  const [isDeepResearchOpen, setIsDeepResearchOpen] = React.useState(false);
  
  // Calculate dynamic progress based on user's mastery score
  const progressPercentage = typeof learningProfile?.masteryScore === "number" ? learningProfile.masteryScore : 65;

  const featureHighlights = [
    { icon: Brain, title: 'AI Powered', desc: 'Personalized learning\nfor every student', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: BookOpen, title: 'NCERT Integrated', desc: 'All NCERT books &\nchapters', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: ClipboardList, title: 'Smart Quizzes', desc: 'Test your knowledge\n& track progress', color: 'text-orange-500', bg: 'bg-orange-100' },
    { icon: BarChart3, title: 'Track Progress', desc: 'See your growth\nwith detailed reports', color: 'text-blue-500', bg: 'bg-blue-100' },
    { icon: Sparkles, title: 'Revision Sheets', desc: 'Instant key formulas\n& quick revision', color: 'text-indigo-600', bg: 'bg-indigo-100' }
  ];

  const exploreFeatures = [
    { 
      id: 'workspace', 
      title: 'Topic Workspace', 
      desc: 'All-in-one notebook with AI notes, easy explanations & practice questions.', 
      icon: BookOpen,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100'
    },
    { 
      id: 'coach', 
      title: 'Study Coach & Timer', 
      desc: 'Focus timer, study tips, active recall & step-by-step guidance.', 
      icon: Sparkles,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    { 
      id: 'ncert', 
      title: 'NCERT Books', 
      desc: 'Read, study and search all NCERT textbooks easily.', 
      icon: BookOpen,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    { 
      id: 'practice', 
      title: 'Practice & Quizzes', 
      desc: 'Generate custom quizzes & test your chapter understanding.', 
      icon: ClipboardList,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    { 
      id: 'tutor', 
      title: 'AI Doubt Solver', 
      desc: 'Ask any question or upload a picture for instant step-by-step help.', 
      icon: Sparkles,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    { 
      id: 'plan', 
      title: 'Study Planner', 
      desc: 'Create daily study schedules and stay on track.', 
      icon: Lightbulb,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100'
    },
    { 
      id: 'notes', 
      title: 'AI Study Notes', 
      desc: 'Get quick revision sheets, key formulas and definitions.', 
      icon: FileText,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-100'
    },
    { 
      id: 'radar', 
      title: 'Weakness Radar', 
      desc: 'Analyze weak concepts and get personalized revision drills.', 
      icon: Target,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden mt-2 sm:mt-6 shadow-sm">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 dark:from-indigo-900/20 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-16 relative z-10">
          
          {/* Hero Left Content */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-indigo-950/80 border border-blue-100 dark:border-indigo-800/60 text-blue-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Your AI Study Companion</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Learn Smarter <br />
              with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">Study Pilot AI</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Get personalized study plans, instant doubt solutions, AI-powered quizzes and more — all in one place.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => setActiveTab('workspace')}
                className="bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>{translateUI('Topic Workspace', currentLang)}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button 
                onClick={() => setActiveTab('tutor')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <Rocket className="w-4 h-4" />
                <span>{translateUI('Ask AI Tutor', currentLang)}</span>
              </button>

              <button 
                onClick={() => setActiveTab('coach')}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-full flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Focus Timer</span>
              </button>
            </div>

            {/* Quick Ask AI Tutor Input Box */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget.elements.namedItem('quickDoubt') as HTMLInputElement;
                  if (target && target.value.trim()) {
                    const query = target.value.trim();
                    // Navigate to AI Tutor with query
                    setActiveTab('tutor');
                    setTimeout(() => {
                      const input = document.getElementById('doubt-question-input') as HTMLTextAreaElement;
                      if (input) {
                        input.value = query;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        const solveBtn = document.getElementById('solve-doubt-btn') as HTMLButtonElement;
                        if (solveBtn) solveBtn.click();
                      }
                    }, 100);
                  }
                }}
                className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
              >
                <Search className="w-5 h-5 text-indigo-500 ml-3 mr-2 shrink-0" />
                <input
                  name="quickDoubt"
                  type="text"
                  placeholder="Ask AI Tutor anything (e.g. What is Photosynthesis? Solve x² - 5x + 6 = 0)..."
                  className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Solve</span>
                </button>
              </form>
            </div>
          </div>

          {/* Hero Right Content - Illustration */}
          <div className="relative h-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            {/* Decorative Floating text */}
            <div className="absolute top-4 left-4 lg:-left-12 rotate-[-12deg] z-20">
              <p className="font-extrabold text-blue-700 dark:text-indigo-400 text-lg sm:text-2xl leading-tight font-serif italic opacity-90">
                Better<br/>Learning<br/>Brighter<br/>Future
              </p>
            </div>

            {/* Checklist Floating Card */}
            <div className="absolute -right-2 sm:right-4 top-1/4 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-xl border border-slate-100 dark:border-slate-800 rounded-2xl p-4 z-20 hidden sm:block">
              <ul className="space-y-3">
                {['Study', 'Practice', 'Improve', 'Succeed'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-indigo-900/50 text-blue-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Main Illustration */}
            <div className="relative w-full max-w-[500px] aspect-square rounded-full flex items-center justify-center z-10 p-4">
              <div className="absolute inset-0 bg-blue-200/50 dark:bg-indigo-600/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
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
      <section className="py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featureHighlights.map((feature, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${feature.bg} dark:bg-slate-800/80 ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{translateUI(feature.title, currentLang)}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Search Assistant Banner */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-xs font-black text-indigo-200">
              <Cpu className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Smart AI Search & Research</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Web Search & Study Assistant
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium">
              Search any textbook topic or exam question. Get clear, verified notes from trusted NCERT and educational sources with zero confusion.
            </p>
          </div>

          <button
            id="homepage-open-deep-research-btn"
            onClick={() => setIsDeepResearchOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-500 hover:from-amber-400 hover:to-indigo-400 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>Search & Research Topic</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Interactive Study Tools Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Study Boosters</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Interactive Learning Tools
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setIsSM2Open(true)}
            className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 shadow-sm hover:shadow-md transition text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Flashcards & Memory Cards
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Review important points right at the best time so you remember longer.
            </p>
          </button>

          <button
            onClick={() => setIsDiagramOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-purple-950/50 border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Diagram & Picture Helper
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Select or upload textbook diagrams and math problems to get labeled breakdowns.
            </p>
          </button>

          <button
            onClick={() => setIsPeerRoomOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 shadow-sm hover:shadow-md transition text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Study Room & Friend Quiz
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Join a study room with room code, chat with classmates, and challenge friends.
            </p>
          </button>

          <button
            onClick={() => setIsLMSExportOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-amber-950/50 border border-amber-100 dark:border-amber-900/60 shadow-sm hover:shadow-md transition text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Share Progress & Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Easily download or share study notes and assignment scores with your teacher.
            </p>
          </button>
        </div>
      </section>

      {/* Main Grid: Explore Features + Keep Going Card */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12 pt-6">
        
        {/* Left Column: Explore Features */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Explore Our Features</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Everything you need to ace your exams, in one place.</p>
            </div>
            <button 
              onClick={() => setActiveTab('learn')}
              className="text-sm font-bold text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {exploreFeatures.map((feat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(feat.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-indigo-700/60 hover:shadow-lg hover:shadow-blue-900/5 dark:hover:shadow-indigo-950/20 rounded-3xl p-6 flex items-start gap-5 text-left group transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${feat.iconBg} dark:bg-slate-800/80 ${feat.iconColor}`}>
                  <feat.icon className="w-7 h-7" strokeWidth={2} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{translateUI(feat.title, currentLang)}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pr-6">{feat.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Keep Going Progress Card */}
        <div className="xl:col-span-1 pt-2 sm:pt-0">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm relative overflow-hidden h-full min-h-[400px] flex flex-col">
            
            {/* Background Decorative Mountain Graphic */}
            <div className="absolute bottom-0 left-0 right-0 h-48 opacity-40 dark:opacity-20 pointer-events-none">
               <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-200/50 dark:from-indigo-900/30 to-transparent" />
               <svg className="absolute bottom-0 w-full h-32 text-blue-200 dark:text-indigo-900" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="currentColor" fillOpacity="0.5" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 fill-amber-500" />
                </div>
                <h3 className="text-xl font-extrabold text-blue-700 dark:text-indigo-400">Keep Going!</h3>
              </div>
              
              <p className="text-slate-700 dark:text-slate-200 font-medium text-lg leading-snug mb-8">
                Small steps every day<br/>lead to big results.
              </p>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-white/50 dark:border-slate-700/50 shadow-sm mb-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Your Learning Progress</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <p className="font-serif italic text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  "The expert in anything was once a beginner."
                </p>
                <p className="text-sm font-bold mt-2 text-slate-500 dark:text-slate-400">— Helen Hayes</p>
              </div>
            </div>
            
          </div>
        </div>

      </section>

      {/* Modal Instances */}
      <SM2SpacedRepetitionModal isOpen={isSM2Open} onClose={() => setIsSM2Open(false)} />
      <InteractiveDiagramExplainerModal isOpen={isDiagramOpen} onClose={() => setIsDiagramOpen(false)} />
      <PeerStudyRoomModal isOpen={isPeerRoomOpen} onClose={() => setIsPeerRoomOpen(false)} />
      <ClassroomLMSExportModal isOpen={isLMSExportOpen} onClose={() => setIsLMSExportOpen(false)} />
      <DeepResearchModal isOpen={isDeepResearchOpen} onClose={() => setIsDeepResearchOpen(false)} />
    </div>
  );
};
