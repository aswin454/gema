import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare,
  Bookmark,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_SUGGESTED_PROMPTS = [
  "My attendance is low. What should I do?",
  "Generate a study plan for this semester.",
  "When are the End-Semester exams scheduled?",
  "How do I file a complaint regarding hostel maintenance?",
  "How do I apply for scholarships?",
  "What are the central library timings?",
  "Who is visiting the campus for recruitment?",
  "When is the deadline for fee payments?",
  "What is the hostel mess menu?",
  "How do I improve my resume match score?",
  "Can I schedule a mock interview?",
  "What is the passing criteria for exams?",
  "Can I submit a medical certificate for attendance?",
  "How do I track my active complaint?"
];

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Suggested Prompts State
  const [initialPrompts, setInitialPrompts] = useState([]);

  // Voice Input (Speech-to-Text) States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Voice Output (Text-to-Speech) States
  const [speakingId, setSpeakingId] = useState(null);
  const synthRef = useRef(window.speechSynthesis);

  const chatEndRef = useRef(null);
  const containerRef = useRef(null);
  const [visibleOptions, setVisibleOptions] = useState({});

  useEffect(() => {
    // Shuffle and pick 3 initial prompts for the compact card
    const shuffled = [...ALL_SUGGESTED_PROMPTS].sort(() => 0.5 - Math.random());
    setInitialPrompts(shuffled.slice(0, 3));
  }, []);

  const handleRefreshInitialPrompts = () => {
    const shuffled = [...ALL_SUGGESTED_PROMPTS].sort(() => 0.5 - Math.random());
    setInitialPrompts(shuffled.slice(0, 3));
  };

  // Scroll to bottom when messages or open state updates
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Select 3 random options on new messages
  useEffect(() => {
    const newVisible = { ...visibleOptions };
    let changed = false;
    messages.forEach((msg, idx) => {
      const msgId = msg._id || idx.toString();
      if (msg.options && msg.options.length > 0 && !newVisible[msgId]) {
        const shuffled = [...msg.options].sort(() => 0.5 - Math.random());
        newVisible[msgId] = shuffled.slice(0, 3);
        changed = true;
      }
    });
    if (changed) {
      setVisibleOptions(newVisible);
    }
  }, [messages]);

  const handleRefreshOptions = (msgId, fullOptions) => {
    const shuffled = [...fullOptions].sort(() => 0.5 - Math.random());
    setVisibleOptions(prev => ({
      ...prev,
      [msgId]: shuffled.slice(0, 3)
    }));
  };

  // Load chat history and speech recognition
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await chatAPI.getHistory();
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to load chat logs:', err.message);
      }
    };

    fetchHistory();

    // Initialize Web Speech API Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + ' ' : '') + transcript);
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Handle closing when clicking outside the chat window (but not on toggle button)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target) && !e.target.closest('.chat-toggle-btn')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim()) return;

    setInputValue('');
    setLoading(true);

    const userMsg = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await chatAPI.sendMessage(prompt);
      setMessages(response.data.history);
    } catch (err) {
      console.error('AI transaction error:', err.message);
      const errorMsg = { 
        role: 'assistant', 
        content: '### Connection Error\n\nI was unable to establish a link with Glena model instance. Please ensure Ollama is running or consult local database records.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (text, id) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_-]/g, ''));
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      synthRef.current.speak(utterance);
    }
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleClearChat = async () => {
    try {
      await chatAPI.clearHistory();
      setMessages([]);
      setVisibleOptions({});
    } catch (err) {
      console.error('Failed to clear chat:', err.message);
    }
  };

  return (
    <>
      {/* Floating Pill Button - Styled exactly matching user screenshot */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="chat-toggle-btn fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-950/90 border border-indigo-500/40 hover:border-indigo-400 text-sm font-semibold text-zinc-100 shadow-[0_0_18px_rgba(99,102,241,0.25)] hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all select-none backdrop-blur-md"
      >
        <MessageSquare size={17} className="text-indigo-400" />
        <span>Glena AI Assistant</span>
      </motion.button>

      {/* Floating Chat Overlay Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[540px] max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden select-none"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/80 via-indigo-950/20 to-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-[10px] shadow-glow">
                  AI
                </div>
                <span className="font-semibold text-sm text-zinc-200 tracking-wide">Glena AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-1 hover:bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-rose-400 transition-all"
                    title="Clear Chat"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-5">
                  <div className="inline-flex h-11 w-11 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary items-center justify-center font-bold text-white shadow-glow">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">How can I assist you today?</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Ask about attendance targets, study guides, exam timetables, or grievance lodging.
                    </p>
                  </div>

                  {/* Suggestion prompt buttons */}
                  <div className="space-y-2 pt-2">
                    {initialPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-accent-primary/30 text-[11px] text-zinc-300 font-semibold transition-all text-left flex items-start gap-2.5"
                      >
                        <Bookmark size={12} className="text-accent-primary mt-0.5 flex-shrink-0" />
                        <span className="leading-snug">{prompt}</span>
                      </button>
                    ))}
                    <div className="flex justify-center pt-1.5">
                      <button
                        onClick={handleRefreshInitialPrompts}
                        className="px-3 py-1.5 bg-indigo-950/35 hover:bg-indigo-950/55 border border-indigo-500/25 hover:border-indigo-500/45 text-indigo-300 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      >
                        <span>🔄 Show other questions</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const msgId = msg._id || index.toString();
                  return (
                    <div 
                      key={msgId} 
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-[10px] shadow-glow flex-shrink-0 mt-0.5">
                          AI
                        </div>
                      )}
                      
                      <div className="max-w-[80%]">
                        <div 
                          className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                            isUser 
                              ? 'bg-accent-primary text-white font-medium rounded-tr-none shadow-sm' 
                              : 'bg-zinc-900/60 border border-zinc-800/80 rounded-tl-none text-zinc-200'
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-sans">
                            {msg.content}
                          </div>
                        </div>

                        {/* Clickable suggestion options */}
                        {!isUser && msg.options && msg.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-0.5">Select a question to ask:</div>
                            <div className="flex flex-col gap-1">
                              {visibleOptions[msgId]?.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSendMessage(opt)}
                                  className="text-left text-[10px] bg-zinc-950/60 hover:bg-indigo-950/20 border border-zinc-850 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-350 px-2.5 py-1.5 rounded-lg transition-all duration-150"
                                >
                                  {opt}
                                </button>
                              ))}
                              {msg.options.length > 3 && (
                                <button
                                  onClick={() => handleRefreshOptions(msgId, msg.options)}
                                  className="text-left text-[10px] bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1"
                                >
                                  <span>🔄 Show other questions</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!isUser && (
                          <div className="flex items-center gap-2.5 mt-1 px-1 text-zinc-500">
                            <button 
                              onClick={() => handleCopyText(msg.content, msgId)}
                              className="hover:text-zinc-300 transition-colors"
                              title="Copy"
                            >
                              {copiedId === msgId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                            <button 
                              onClick={() => handleToggleSpeak(msg.content, msgId)}
                              className={`hover:text-zinc-300 transition-colors ${speakingId === msgId ? 'text-accent-primary animate-pulse' : ''}`}
                              title="Read"
                            >
                              {speakingId === msgId ? <VolumeX size={12} /> : <Volume2 size={12} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-[10px] flex-shrink-0 mt-0.5">
                          U
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-[10px] shadow-glow flex-shrink-0 mt-0.5">
                    AI
                  </div>
                  <div className="max-w-[80%]">
                    <div className="rounded-xl px-4 py-3 bg-zinc-900/60 border border-zinc-800/80 rounded-tl-none">
                      <div className="flex gap-1 items-center justify-center py-0.5">
                        <div className="h-1.5 w-1.5 bg-accent-primary rounded-full typing-dot" />
                        <div className="h-1.5 w-1.5 bg-accent-primary rounded-full typing-dot" />
                        <div className="h-1.5 w-1.5 bg-accent-primary rounded-full typing-dot" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleToggleListening}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-glow animate-pulse' 
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder={isListening ? 'Listening...' : 'Ask Glena...'}
                  disabled={isListening}
                  className="flex-grow py-2 px-3 rounded-xl glass-input text-xs text-zinc-200 focus:outline-none"
                />

                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || loading}
                  className="p-2.5 rounded-xl bg-accent-primary hover:opacity-90 active:scale-95 text-white shadow-glow transition-all disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIChat;
