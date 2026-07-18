import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
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
  Trash2
} from 'lucide-react';

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

const AIChat = () => {
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
  const [visibleOptions, setVisibleOptions] = useState({});

  useEffect(() => {
    // Shuffle and pick 4 initial prompts
    const shuffled = [...ALL_SUGGESTED_PROMPTS].sort(() => 0.5 - Math.random());
    setInitialPrompts(shuffled.slice(0, 4));
  }, []);

  const handleRefreshInitialPrompts = () => {
    const shuffled = [...ALL_SUGGESTED_PROMPTS].sort(() => 0.5 - Math.random());
    setInitialPrompts(shuffled.slice(0, 4));
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Load chat history on mount
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

  // Handle message sending
  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim()) return;

    setInputValue('');
    setLoading(true);

    // Append user message immediately
    const userMsg = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await chatAPI.sendMessage(prompt);
      // Backend returns the full history, or the response content
      setMessages(response.data.history);
    } catch (err) {
      console.error('AI transaction error:', err.message);
      // Fallback message
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

  // Copy response content helper
  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle voice speaking (Text-to-Speech)
  const handleToggleSpeak = (text, id) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
    } else {
      synthRef.current.cancel(); // cancel current speech
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_-]/g, ''));
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      synthRef.current.speak(utterance);
    }
  };

  // Toggle mic recording (Speech-to-Text)
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

  // Handle clearing chat history
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
    <div className="h-[calc(100vh-5rem)] flex flex-col justify-between select-none animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/40 bg-zinc-950/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white shadow-glow">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-md font-bold text-zinc-100">Glena AI Assistant</h2>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Model: Gemma 4
              </p>
            </div>
          </div>
          
          {/* Header Actions (Clear Chat / Refresh) */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/60 hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all active:scale-95"
              title="Clear all messages and reset conversation"
            >
              <Trash2 size={14} />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary items-center justify-center font-bold text-white shadow-glow animate-bounce">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-200">Chat with CampusOne Glena</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                I can help you review your academic attendance warnings, design customized study planners, analyze hostels mess and rules, and track grievances.
              </p>
            </div>

            {/* Prompt Shortcuts */}
            <div className="space-y-4 max-w-2xl mx-auto pt-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {initialPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-accent-primary/40 text-xs text-zinc-300 font-semibold transition-all text-left flex items-start gap-3 hover:translate-y-[-1px]"
                  >
                    <Bookmark size={14} className="text-accent-primary mt-0.5 flex-shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleRefreshInitialPrompts}
                  className="px-4 py-2 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  title="Shuffle and view other suggestions"
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
                className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-250`}
              >
                {!isUser && (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-sm shadow-glow flex-shrink-0">
                    AI
                  </div>
                )}
                
                <div className="max-w-[85%] md:max-w-[70%]">
                  <div 
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-accent-primary text-white font-medium rounded-tr-none' 
                        : 'bg-zinc-900/60 border border-zinc-850 glass-card rounded-tl-none text-zinc-200'
                    }`}
                  >
                    {/* Render simple markdown structures */}
                    <div className="space-y-2 whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>
                  </div>

                  {/* Clickable suggestion options */}
                  {!isUser && msg.options && msg.options.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">Select a question to ask:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleOptions[msgId]?.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleSendMessage(opt)}
                            className="text-left text-xs bg-zinc-900/60 hover:bg-indigo-950/20 border border-zinc-800 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-350 px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm"
                          >
                            {opt}
                          </button>
                        ))}
                        {msg.options.length > 3 && (
                          <button
                            onClick={() => handleRefreshOptions(msgId, msg.options)}
                            className="text-left text-xs bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1"
                            title="Shuffle and view other suggestions"
                          >
                            <span>🔄 Show other questions</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Bar (Copy, TTS) */}
                  {!isUser && (
                    <div className="flex items-center gap-3 mt-1.5 px-1.5 text-zinc-500">
                      <button 
                        onClick={() => handleCopyText(msg.content, msgId)}
                        className="hover:text-zinc-300 transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === msgId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button 
                        onClick={() => handleToggleSpeak(msg.content, msgId)}
                        className={`hover:text-zinc-300 transition-colors ${speakingId === msgId ? 'text-accent-primary animate-pulse' : ''}`}
                        title="Read Aloud"
                      >
                        {speakingId === msgId ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-9 w-9 rounded-full bg-zinc-850 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-sm flex-shrink-0">
                    U
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loader/Typing Animation */}
        {loading && (
          <div className="flex gap-4 justify-start">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-sm shadow-glow flex-shrink-0">
              AI
            </div>
            <div className="max-w-[70%]">
              <div className="rounded-2xl px-5 py-4 bg-zinc-900/60 border border-zinc-800 glass-card rounded-tl-none">
                <div className="flex gap-1.5 items-center justify-center py-1 px-2">
                  <div className="h-2 w-2 bg-accent-primary rounded-full typing-dot" />
                  <div className="h-2 w-2 bg-accent-primary rounded-full typing-dot" />
                  <div className="h-2 w-2 bg-accent-primary rounded-full typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-950/40">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Micro Recording Button */}
          <button 
            type="button"
            onClick={handleToggleListening}
            className={`p-3.5 rounded-xl border transition-all hover:scale-105 ${
              isListening 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-glow animate-pulse' 
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Voice Input (Speech-to-Text)"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            placeholder={isListening ? 'Listening...' : 'Message Glena AI Assistant...'}
            disabled={isListening}
            className="flex-grow py-3 px-4 rounded-xl glass-input text-sm text-zinc-200 focus:outline-none focus:ring-0 disabled:opacity-50"
          />

          {/* Send Button */}
          <button 
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || loading}
            className="p-3.5 rounded-xl bg-accent-primary hover:opacity-90 active:scale-95 text-white shadow-glow font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
