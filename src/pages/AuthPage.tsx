import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight,
  GraduationCap, Sparkles, CheckCircle2, FileText, ShieldAlert, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
// Import the generated image
import robotImage from '../assets/images/cute_robot_reading_1789570270647.jpg';
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearFailedAttempts,
  formatCooldownTime,
  RateLimitState,
} from '../utils/loginRateLimiter';

export const AuthPage: React.FC = () => {
  const { signInWithGoogle, signInGuest, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState>(() => checkLoginRateLimit('global'));

  // Timer interval to tick down cooldown seconds when locked out
  useEffect(() => {
    const identifier = email.trim() || 'global';
    const status = checkLoginRateLimit(identifier);
    setRateLimit(status);

    if (status.isLockedOut) {
      const timer = setInterval(() => {
        const updated = checkLoginRateLimit(identifier);
        setRateLimit(updated);
        if (!updated.isLockedOut) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [email, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const identifier = email.trim() || 'global';

    // Rate Limit Check prior to execution
    if (isLogin) {
      const currentRateState = checkLoginRateLimit(identifier);
      if (currentRateState.isLockedOut) {
        setRateLimit(currentRateState);
        setError(
          `Too many failed login attempts. Account sign-in is locked. Please wait ${formatCooldownTime(
            currentRateState.cooldownSeconds
          )} before trying again.`
        );
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        clearFailedAttempts(identifier);
        setRateLimit(checkLoginRateLimit(identifier));
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      if (isLogin) {
        const newRateState = recordFailedLoginAttempt(identifier);
        setRateLimit(newRateState);

        if (newRateState.isLockedOut) {
          setError(
            `Account temporarily locked due to 5 consecutive failed login attempts. Please wait ${formatCooldownTime(
              newRateState.cooldownSeconds
            )} before trying again.`
          );
        } else {
          setError(
            `${err.message || 'Authentication failed'}. (${newRateState.remainingAttempts} attempt${
              newRateState.remainingAttempts === 1 ? '' : 's'
            } remaining before 15-min lockout)`
          );
        }
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGuest();
    } catch (err: any) {
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl flex gap-8 z-10 items-center justify-center">
        
        {/* Left Column (Hero) */}
        <div className="hidden lg:flex flex-col flex-1 pl-8 relative h-full max-w-lg">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-4">
            <div className="text-blue-600">
               <GraduationCap className="w-10 h-10" fill="currentColor" strokeWidth={1}/>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              Study Pilot <span className="text-blue-600">AI</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium mb-12 flex items-center gap-2 text-sm">
            Learn Smarter <span className="text-slate-300">•</span> Score Higher <span className="text-slate-300">•</span> Build Your Future
          </p>

          {/* Center Illustration Composition */}
          <div className="relative w-full aspect-square flex items-center justify-center mb-8">
            <img 
              src={robotImage} 
              alt="AI Robot Reading" 
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-blue-900/10"
            />
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex flex-col items-start gap-2 border border-white/40"
            >
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><BookOpen className="w-4 h-4"/></div>
                <span className="font-bold text-slate-700 text-sm">NCERT</span>
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="w-12 h-1.5 bg-blue-100 rounded-full"></div>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full"></div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -top-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/40"
            >
              <div className="flex items-center gap-2 mb-3">
                 <div className="bg-indigo-600 p-1 rounded-md text-white"><span className="text-[10px] font-bold px-1">?</span></div>
                 <span className="font-bold text-slate-700 text-sm">Quiz</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div className="w-12 h-1.5 bg-slate-200 rounded-full"></div></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div className="w-10 h-1.5 bg-slate-200 rounded-full"></div></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div className="w-14 h-1.5 bg-slate-200 rounded-full"></div></div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/3 -right-12 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex flex-col gap-2 border border-white/40"
            >
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white"><FileText className="w-4 h-4"/></div>
                <span className="font-bold text-slate-700 text-sm">Summary</span>
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full"></div>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Feature Pills */}
          <div className="flex flex-wrap gap-3 mt-4">
             {[
               { icon: Sparkles, text: "AI-powered\nlearning", color: "text-purple-600", bg: "bg-purple-100" },
               { icon: BookOpen, text: "NCERT\nbooks", color: "text-blue-600", bg: "bg-blue-100" },
               { icon: CheckCircle2, text: "Quizzes\n& Practice", color: "text-emerald-600", bg: "bg-emerald-100" },
               { icon: FileText, text: "Smart\nSummaries", color: "text-orange-600", bg: "bg-orange-100" }
             ].map((feature, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-[1.25rem] flex items-center gap-3 shadow-sm border border-white/50">
                   <div className={`p-1.5 rounded-full ${feature.bg} ${feature.color}`}>
                     <feature.icon className="w-4 h-4" />
                   </div>
                   <span className="text-[11px] font-bold text-slate-700 whitespace-pre-line leading-tight">{feature.text}</span>
                </div>
             ))}
          </div>

          {/* Hand-drawn arrow & text placeholder */}
          <div className="absolute top-8 right-0 text-slate-500 font-handwriting transform rotate-6 translate-x-1/2 flex flex-col items-center">
            <span className="text-sm font-medium">Your Personal</span>
            <span className="text-sm font-medium">AI Study Companion</span>
            <svg width="40" height="20" viewBox="0 0 40 20" className="mt-1 stroke-slate-400 fill-none opacity-50" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5 Q 20 15 35 5" />
              <path d="M30 2 L 35 5 L 32 10" />
            </svg>
          </div>
        </div>

        {/* Right Column (Auth Card) */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10">
           <div className="w-full max-w-[440px] bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative border border-slate-100">
              
              <div className="mb-8">
                <div className="w-12 h-12 flex items-center justify-center mb-4 relative">
                  <GraduationCap className="w-10 h-10 text-blue-600" fill="currentColor" strokeWidth={1} />
                  <Sparkles className="w-4 h-4 text-amber-400 absolute top-0 -right-2" fill="currentColor" />
                </div>
                {isLogin ? (
                  <>
                    <h2 className="text-[2rem] leading-tight font-bold text-slate-900 mb-2 tracking-tight">
                      Welcome <span className="text-blue-600">back!</span>
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                      Continue your learning journey with<br/>Study Pilot AI
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-[2rem] leading-tight font-bold text-slate-900 mb-2 tracking-tight">
                      Create an <span className="text-blue-600">account</span>
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                      Start your learning journey with<br/>Study Pilot AI
                    </p>
                  </>
                )}
              </div>

              {/* Instant 1-Click Guest Entry Banner */}
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="w-full mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl flex items-center justify-between gap-3 text-left transition-all hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>1-Click Fast Guest Entry</span>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Instant</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">Try all features instantly without registering</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {rateLimit.isLockedOut && isLogin && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-amber-800 text-sm">Sign-In Rate Limit Active</div>
                      <div>Login locked due to 5 consecutive failed attempts.</div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-amber-700 font-black text-xs">
                        <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Try again in {formatCooldownTime(rateLimit.cooldownSeconds)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && !rateLimit.isLockedOut && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {/* Email Field */}
                <div className="relative group">
                  <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-semibold text-slate-500 transition-colors group-focus-within:text-blue-600 z-10">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      disabled={loading || (isLogin && rateLimit.isLockedOut)}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm font-medium bg-transparent disabled:opacity-50"
                      placeholder="student@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <label className="absolute -top-2 left-4 px-1 bg-white text-[11px] font-semibold text-slate-500 transition-colors group-focus-within:text-blue-600 z-10">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      disabled={loading || (isLogin && rateLimit.isLockedOut)}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm font-medium bg-transparent disabled:opacity-50"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isLogin && rateLimit.attemptsCount > 0 && !rateLimit.isLockedOut && (
                  <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 px-1 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {rateLimit.attemptsCount} of 5 login attempts used. Account will lock for 15 mins after 5 failed attempts.
                    </span>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (isLogin && rateLimit.isLockedOut)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? 'Please wait...' : rateLimit.isLockedOut && isLogin ? `Locked (${formatCooldownTime(rateLimit.cooldownSeconds)})` : (isLogin ? 'Sign In' : 'Sign Up')}
                  {!loading && !rateLimit.isLockedOut && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-slate-400 font-medium">or continue with</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-70 active:scale-[0.98]"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-all disabled:opacity-70 active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Explore as Guest Student (No sign up needed)
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center text-sm">
                <span className="text-slate-500 font-medium">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors focus:outline-none ml-1"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
