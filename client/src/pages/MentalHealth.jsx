import React, { useState, useEffect, useRef } from 'react';
import { mentalHealthAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import Particles from '../components/Particles';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Copy, Check,
  Heart, Sparkles, RefreshCcw, Trash2, ShieldCheck, BookOpen
} from 'lucide-react';

// ─── Community Stories shown on the right panel ────────────────────────────
const COMMUNITY_STORIES = [
  {
    emoji: '📚',
    name: 'Priya, CSE Sem 5',
    tag: 'Exam Stress',
    color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    story: '"Box breathing before every exam changed everything for me. From blanking out to confidently writing 3 pages."'
  },
  {
    emoji: '🌙',
    name: 'Arjun, ECE Sem 3',
    tag: 'Sleep Issues',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    story: '"Fixing my wake-up time first (not bedtime) completely reset my sleep within one week."'
  },
  {
    emoji: '🤝',
    name: 'Sneha, MBA Sem 1',
    tag: 'Loneliness',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
    story: '"I was terrified to talk to anyone. Joining the photography club gave me friends I never expected."'
  },
  {
    emoji: '🔥',
    name: 'Rahul, Mech Sem 7',
    tag: 'Burnout',
    color: 'from-orange-500/10 to-amber-500/10 border-orange-500/20',
    story: '"Taking a real 2-day break without guilt was the hardest and best thing I did. I came back 3x more productive."'
  },
  {
    emoji: '💙',
    name: 'Ananya, Civil Sem 4',
    tag: 'Anxiety',
    color: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
    story: '"Serenity helped me understand the 5-4-3-2-1 technique. I used it in class and it actually worked."'
  }
];

const QUICK_STARTERS = [
  "I feel extremely stressed before every exam.",
  "I've been feeling very lonely at college.",
  "I'm completely burned out and can't study.",
  "I had a panic attack and I don't know what to do.",
  "I'm struggling with homesickness.",
  "Family pressure is crushing me."
];

// ─── Per-emoji Serenity greeting + follow-up question bank ─────────────────
const MOOD_CONFIG = {
  '😔': {
    label: 'Low',
    color: 'hover:bg-blue-950/30 hover:border-blue-500/30',
    activeColor: 'bg-blue-950/30 border-blue-500/40',
    greeting: `I can see you're feeling low right now, and I want you to know — that's completely okay. 💙

You didn't have to hold it in. I'm here, and I'm listening.

Can you tell me a little about what's been weighing on you lately? Is it something at college, home, or just a feeling that's hard to explain?`,
    followUps: [
      "I feel sad and I don't know why.",
      "I've lost interest in things I used to love.",
      "Nothing feels meaningful anymore.",
      "I feel like I'm dragging myself through each day."
    ]
  },
  '😟': {
    label: 'Anxious',
    color: 'hover:bg-orange-950/30 hover:border-orange-500/30',
    activeColor: 'bg-orange-950/30 border-orange-500/40',
    greeting: `It sounds like anxiety is making things really tough right now. 🫂

Anxiety can feel overwhelming — heart racing, mind spinning, a sense of dread you can't quite explain. You're not alone in this.

What's been making you feel most anxious lately? Is it exams, social situations, the future, or something else?`,
    followUps: [
      "I'm anxious about my upcoming exams.",
      "My heart races and I can't calm down.",
      "I overthink everything and can't stop.",
      "I had a panic attack recently."
    ]
  },
  '😐': {
    label: 'Okay',
    color: 'hover:bg-yellow-950/30 hover:border-yellow-500/30',
    activeColor: 'bg-yellow-950/30 border-yellow-500/40',
    greeting: `"Just okay" can sometimes be the hardest place to be — not bad enough to ask for help, but not good enough to feel like yourself. 🌤️

I'm glad you're here. Sometimes checking in with yourself is the most important thing you can do.

What's been on your mind lately? Even small things are worth talking about.`,
    followUps: [
      "I feel numb but not exactly sad.",
      "I'm not enjoying things like I used to.",
      "I feel like I'm just going through the motions.",
      "I'm a bit overwhelmed but managing."
    ]
  },
  '🙂': {
    label: 'Good',
    color: 'hover:bg-emerald-950/30 hover:border-emerald-500/30',
    activeColor: 'bg-emerald-950/30 border-emerald-500/40',
    greeting: `That's wonderful to hear — feeling good is something to appreciate and protect! 🌿

I love that you're here even when things are going okay. Checking in during the good times helps build resilience for the harder ones.

Is there anything specific you'd like to talk about — maybe something you want to maintain, improve, or just explore?`,
    followUps: [
      "How do I maintain my positive mindset during exams?",
      "I want to build better habits before things get stressful.",
      "How do I help a friend who seems to be struggling?",
      "What are good mental health practices to adopt daily?"
    ]
  },
  '😊': {
    label: 'Great',
    color: 'hover:bg-pink-950/30 hover:border-pink-500/30',
    activeColor: 'bg-pink-950/30 border-pink-500/40',
    greeting: `You're feeling great — and that energy is contagious! ✨🎉

It's genuinely lovely to hear. I want to help you protect and build on this feeling.

Would you like tips to maintain this positive state, or is there something on your mind you'd like to explore while you're in a good headspace?`,
    followUps: [
      "How do I stay mentally strong during challenging periods?",
      "What habits keep students mentally healthy long-term?",
      "How can I support my friends who are struggling?",
      "I want to build a daily wellness routine."
    ]
  }
};

const MentalHealth = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [visibleOptions, setVisibleOptions] = useState({});
  const [cleared, setCleared] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const chatEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init random options on new messages
  useEffect(() => {
    const newVisible = { ...visibleOptions };
    let changed = false;
    messages.forEach((msg, idx) => {
      const id = msg._id || idx.toString();
      if (msg.options && msg.options.length > 0 && !newVisible[id]) {
        const shuffled = [...msg.options].sort(() => 0.5 - Math.random());
        newVisible[id] = shuffled.slice(0, 3);
        changed = true;
      }
    });
    if (changed) setVisibleOptions(newVisible);
  }, [messages]);

  // Load history
  useEffect(() => {
    mentalHealthAPI.getHistory().then(r => {
      if (r.data && r.data.length > 0) setMessages(r.data);
    }).catch(() => { });

    // Speech Recognition
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.onresult = e => {
        const t = e.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + ' ' : '') + t);
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleSend = async (text) => {
    const prompt = text || inputValue;
    if (!prompt.trim()) return;
    setInputValue('');
    setLoading(true);

    const userMsg = { role: 'user', content: prompt, _id: `u_${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await mentalHealthAPI.sendMessage(prompt);
      setMessages(res.data.history);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I had trouble connecting right now. Please try again in a moment, or call **iCall: 9152987821** if you need immediate support.",
          _id: `err_${Date.now()}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mood emoji clicked: inject instant Serenity greeting + follow-up questions
  const handleMoodSelect = (moodKey) => {
    const config = MOOD_CONFIG[moodKey];
    if (!config) return;
    const id = `mood_greeting_${Date.now()}`;
    const greetingMsg = {
      role: 'assistant',
      content: config.greeting,
      options: config.followUps,
      _id: id
    };
    setMessages(prev => [...prev, greetingMsg]);
    // Immediately show all follow-up options
    setVisibleOptions(prev => ({ ...prev, [id]: config.followUps.slice(0, 3) }));
  };

  const handleClear = async () => {
    await mentalHealthAPI.clearHistory().catch(() => { });
    setMessages([]);
    setVisibleOptions({});
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleSpeak = (text, id) => {
    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/#{1,3}/g, ''));
    utt.onend = () => setSpeakingId(null);
    synthRef.current.speak(utt);
    setSpeakingId(id);
  };

  const handleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const handleRefreshOptions = (id, fullOptions) => {
    const shuffled = [...fullOptions].sort(() => 0.5 - Math.random());
    setVisibleOptions(prev => ({ ...prev, [id]: shuffled.slice(0, 3) }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] overflow-hidden relative">
      
      {/* Background Particles Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
        <Particles
          particleColors={["#ec4899", "#a855f7", "#6366f1"]}
          particleCount={100}
          particleSpread={15}
          speed={0.15}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          particleHoverFactor={0.8}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* ── Main Chat Panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <GlassCard className="p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-glow">
              <Heart size={18} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Serenity
                <span className="text-[10px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Mental Wellness</span>
              </h1>
              <p className="text-xs text-zinc-500">A safe, private space to talk. Powered by Glena AI.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Private & Confidential
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-400 transition-colors text-xs px-3 py-1.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                title="Clear Session"
              >
                {cleared ? <Check size={13} className="text-emerald-400" /> : <Trash2 size={13} />}
                {cleared ? 'Cleared' : 'Clear'}
              </button>
            )}
          </div>
        </GlassCard>

        {/* Messages */}
        <GlassCard className="flex-1 flex flex-col min-h-0 overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Empty State */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-glow">
                  <Heart size={28} className="text-white" fill="white" />
                </div>
                <div className="text-center space-y-1.5">
                  <h2 className="text-xl font-bold text-zinc-100">Hi, I'm Serenity 💙</h2>
                  <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                    I'm here to listen and support you through whatever you're experiencing. Everything you share here is private and confidential.
                  </p>
                </div>
                <div className="w-full max-w-lg">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center mb-3">You might want to start with...</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_STARTERS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="text-left text-xs bg-zinc-900/60 hover:bg-pink-950/20 border border-zinc-800 hover:border-pink-500/30 text-zinc-300 hover:text-pink-300 px-4 py-3 rounded-xl transition-all duration-200 leading-snug"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Feed */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const msgId = msg._id || idx.toString();
              return (
                <div key={msgId} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-250`}>
                  {!isUser && (
                    <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
                      <Heart size={13} className="text-white" fill="white" />
                    </div>
                  )}

                  <div className="max-w-[78%]">
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-sans ${isUser
                        ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white font-medium rounded-tr-none shadow-sm'
                        : 'bg-zinc-900/60 border border-zinc-800/80 rounded-tl-none text-zinc-200'
                      }`}>
                      {msg.content}
                    </div>

                    {/* Follow-up options */}
                    {!isUser && msg.options && msg.options.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Related questions:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {visibleOptions[msgId]?.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleSend(opt)}
                              className="text-left text-[11px] bg-zinc-900/50 hover:bg-pink-950/20 border border-zinc-800 hover:border-pink-500/30 text-pink-400 hover:text-pink-300 px-3 py-1.5 rounded-lg transition-all duration-150"
                            >
                              {opt}
                            </button>
                          ))}
                          <button
                            onClick={() => handleRefreshOptions(msgId, msg.options)}
                            className="text-[11px] bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1"
                            title="Shuffle and see different questions"
                          >
                            🔄 Other questions
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action bar */}
                    {!isUser && (
                      <div className="flex items-center gap-3 mt-1 px-1 text-zinc-600">
                        <button onClick={() => handleCopy(msg.content, msgId)} className="hover:text-zinc-300 transition-colors" title="Copy">
                          {copiedId === msgId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <button onClick={() => handleSpeak(msg.content, msgId)} className={`hover:text-zinc-300 transition-colors ${speakingId === msgId ? 'text-pink-400 animate-pulse' : ''}`} title="Read aloud">
                          {speakingId === msgId ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-[10px] font-bold flex-shrink-0 mt-0.5">
                      ME
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing animation */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
                  <Heart size={13} className="text-white" fill="white" />
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5 items-center py-0.5">
                    <div className="h-2 w-2 bg-pink-500 rounded-full typing-dot" />
                    <div className="h-2 w-2 bg-purple-500 rounded-full typing-dot" />
                    <div className="h-2 w-2 bg-indigo-500 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800/60">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  id="mental-health-input"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind… this is a safe space."
                  rows={2}
                  className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 focus:border-pink-500/40 text-zinc-200 placeholder-zinc-600 rounded-2xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>
              <button
                onClick={handleMic}
                className={`p-3 rounded-xl transition-all border ${isListening ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                title="Voice Input"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || loading}
                id="mental-health-send-btn"
                className="p-3 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-glow"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 text-center mt-2">
              🔒 Private & confidential · Not stored in permanent database · Emergency: iCall <span className="text-pink-400 font-semibold">9152987821</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto relative z-10">

        {/* Crisis Banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-rose-950/40 to-pink-950/20 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={15} className="text-rose-400" />
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Need Immediate Help?</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">If you are in crisis or having thoughts of self-harm, please reach out now:</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-zinc-900/50 rounded-xl px-3 py-2">
              <span className="text-[11px] text-zinc-400">iCall (India)</span>
              <span className="text-[11px] font-bold text-rose-400">9152987821</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/50 rounded-xl px-3 py-2">
              <span className="text-[11px] text-zinc-400">Vandrevala Foundation</span>
              <span className="text-[11px] font-bold text-rose-400">1860-2662-345</span>
            </div>
          </div>
        </div>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Quick Mood Check</span>
          </div>
          <p className="text-[11px] text-zinc-500 mb-3">How are you feeling right now?</p>
          <div className="grid grid-cols-5 gap-1.5">
            {Object.entries(MOOD_CONFIG).map(([emoji, config]) => (
              <button
                key={emoji}
                onClick={() => handleMoodSelect(emoji)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border border-zinc-800 transition-all duration-200 bg-zinc-900/50 ${config.color}`}
                title={config.label}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-[9px] text-zinc-500">{config.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Community Stories */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-indigo-400" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Community Stories</span>
          </div>
          <div className="space-y-2.5">
            {COMMUNITY_STORIES.map((s, i) => (
              <div key={i} className={`rounded-xl p-3 bg-gradient-to-br ${s.color} border`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{s.emoji}</span>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-300">{s.name}</div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{s.tag}</div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">{s.story}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tips Footer */}
        <GlassCard className="p-4">
          <p className="text-[10px] text-zinc-500 leading-relaxed text-center">
            💡 <strong className="text-zinc-400">Daily Tip:</strong> Spending 5 minutes journaling your thoughts each morning reduces anxiety by up to 28% according to research.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default MentalHealth;
