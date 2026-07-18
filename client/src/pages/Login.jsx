import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, BookOpen, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('1');
  const [hostelBlock, setHostelBlock] = useState('Block A');
  const [hostelRoom, setHostelRoom] = useState('101');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCECAnimation, setShowCECAnimation] = useState(false);
  const [loaderText, setLoaderText] = useState("Verifying CEC credentials...");
  const [progressVal, setProgressVal] = useState(0);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const triggerCECAnimation = () => {
    setShowCECAnimation(true);
    
    // requestAnimationFrame counter for 60fps clock ticks
    let startTimestamp = null;
    const duration = 2800; // 2.8s total duration
    const animateCounter = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgressVal(Math.round(progress));
      if (elapsed < duration) {
        requestAnimationFrame(animateCounter);
      }
    };
    requestAnimationFrame(animateCounter);
    
    // Smooth text updates matching the GPU progress animation
    setTimeout(() => {
      setLoaderText("Establishing encrypted connection with CEC LDAP...");
    }, 800);
    
    setTimeout(() => {
      setLoaderText("Syncing attendance ratios & placement portfolio indexes...");
    }, 1600);

    setTimeout(() => {
      setLoaderText("CEC database synced successfully. Welcoming user...");
    }, 2400);

    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const formData = {
          name,
          email,
          password,
          role,
          ...(role === 'student' ? { rollNo, department, semester: Number(semester), hostelBlock, hostelRoom } : {})
        };
        await register(formData);
      } else {
        await login(email, password);
      }
      triggerCECAnimation();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication transaction failed.');
      setLoading(false);
    }
  };

  if (showCECAnimation) {
    return (
      <div className="min-h-screen w-full relative flex flex-col items-center justify-center bg-[#070709] overflow-hidden select-none z-50">
        {/* Soft elegant ambient background light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Subtle particle background drift */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_70%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col items-center space-y-8"
        >
          {/* Logo container with expansion ripple rings and rotating orbits */}
          <div className="relative h-44 w-44 flex items-center justify-center">
            
            {/* Concentric ripple rings radiating from logo core */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-indigo-500/15"
                initial={{ width: 80, height: 80, opacity: 0.35 }}
                animate={{ width: 240, height: 240, opacity: 0 }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: i * 0.9,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Delicate fast rotating outer loader ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-dashed border-indigo-500/30"
            />

            {/* Opposite direction slower loader ring */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-5 rounded-full border border-dotted border-violet-500/25"
            />
            
            {/* Pulsing inner glow circle */}
            <motion.div 
              animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-24 h-24 rounded-full bg-indigo-500/5 filter blur-xl"
            />

            {/* Elegant CEC Text Logo with slide/spring entrance */}
            <div className="z-10 flex items-center justify-center gap-2">
              <motion.span 
                initial={{ x: -25, opacity: 0, filter: "blur(4px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
              >
                C
              </motion.span>
              <motion.span 
                initial={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.45 }}
                className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(139,92,246,0.35)]"
              >
                E
              </motion.span>
              <motion.span 
                initial={{ x: 25, opacity: 0, filter: "blur(4px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.7 }}
                className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-400 via-zinc-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
              >
                C
              </motion.span>
            </div>
          </div>

          {/* Minimalist Underline Loader and Digital Counter */}
          <div className="w-56 space-y-4 flex flex-col items-center">
            {/* Monospace 60fps counter */}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs font-mono font-extrabold text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            >
              {progressVal}%
            </motion.span>

            {/* Glowing progress line */}
            <div className="h-[2px] w-full rounded-full bg-zinc-900 overflow-hidden relative">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              />
            </div>
            
            {/* Status dynamic message */}
            <div className="h-4 flex items-center justify-center">
              <motion.span 
                key={loaderText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-center"
              >
                {loaderText}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-background px-4 py-12 overflow-hidden select-none">
      {/* Decorative Radial Glowing BG */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none glow-bg" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[120px] pointer-events-none glow-bg" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary items-center justify-center font-bold text-white text-lg shadow-glow mb-4">
            360
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-sans">
            Welcome to student360 AI
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            The intelligent unified portal for modern university students & faculty.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="glass-card rounded-3xl p-8 border border-zinc-800/80 shadow-2xl relative">
          <h3 className="text-xl font-semibold text-zinc-100 mb-6">
            {isRegister ? 'Create institutional account' : 'Sign in to your account'}
          </h3>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-6 animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Inputs */}
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
                />
              </div>
            </div>

            {/* Role / Institutional details toggled during registration */}
            {isRegister && (
              <div className="space-y-4 pt-2 border-t border-zinc-800/60 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">User Account Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['student', 'faculty', 'admin'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                          role === r 
                            ? 'bg-accent-primary/10 border-accent-primary/50 text-white shadow-glow'
                            : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Roll Number</label>
                      <input
                        type="text"
                        required
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. CS-2023-042"
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Tech</option>
                        <option value="Electrical Engineering">Electrical Eng</option>
                        <option value="Electronics & Comm">Electronics & Comm</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none"
                      >
                        {[1,2,3,4,5,6,7,8].map((s) => (
                          <option key={s} value={s}>{s}th Sem</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hostel Block</label>
                      <input
                        type="text"
                        value={hostelBlock}
                        onChange={(e) => setHostelBlock(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Room No</label>
                      <input
                        type="text"
                        value={hostelRoom}
                        onChange={(e) => setHostelRoom(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm text-zinc-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90 active:scale-95 font-semibold text-sm text-white shadow-glow flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Complete Signup' : 'Proceed to Dashboard'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Buttons */}
          {!isRegister && (
            <div className="mt-6 pt-4 border-t border-zinc-800/40">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5 text-center">
                Quick Demo Access
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('student@student360.ai');
                    setPassword('password123');
                  }}
                  className="py-1.5 rounded-lg text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-accent-primary transition-all"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('faculty@student360.ai');
                    setPassword('password123');
                  }}
                  className="py-1.5 rounded-lg text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-accent-primary transition-all"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@student360.ai');
                    setPassword('password123');
                  }}
                  className="py-1.5 rounded-lg text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-accent-primary transition-all"
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="text-center mt-4 pt-4 border-t border-zinc-800/40">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {isRegister 
                ? 'Already registered? Sign in instead' 
                : "Don't have an account? Sign up now"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
