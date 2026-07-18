import React, { useState } from 'react';
import { chatAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import { 
  HelpCircle, 
  Search, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Home, 
  BookOpen, 
  Award,
  ArrowRight,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Flame,
  CheckCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

const FAQ_KNOWLEDGE_BASE = [
  {
    category: 'fees',
    label: 'Academic Fees',
    icon: DollarSign,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400',
    iconColor: 'text-emerald-400',
    questions: [
      {
        q: 'What is the deadline for Odd Semester tuition fee payments?',
        a: 'Tuition fees for the upcoming semester must be cleared by July 31, 2026. A grace period of 7 days is permitted with a late fee penalty of ₹500, after which registration portals are temporarily locked.',
        queryText: 'Provide detailed timetable, extensions and instructions for paying tuition fee for odd semester 2026.'
      },
      {
        q: 'How can I request an educational fee receipt for tax rebate?',
        a: 'Navigate to the student portal -> Finance -> Receipts, select the academic term, and click "Download PDF Receipt". For custom loan letters, submit a requisition form under the "Grievance / Request Desk" tab.',
        queryText: 'What is the official procedure to procure loan approval letters and receipt duplicates?'
      },
      {
        q: 'Can I pay the academic fees in monthly installments?',
        a: 'Installment schemes are subject to approval by the Finance Dean. Students must submit an official application along with income proofs before July 15, 2026. If approved, payments can be split into three equal installments.',
        queryText: 'What installment options exist for students experiencing financial hardships?'
      }
    ]
  },
  {
    category: 'exams',
    label: 'Exams & Timetables',
    icon: Calendar,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400',
    iconColor: 'text-amber-400',
    questions: [
      {
        q: 'When are the Mid-Term and End-Semester exams scheduled?',
        a: 'Mid-Term examinations begin on September 14, 2026. End-Semester theoretical and laboratory exams are tentatively scheduled from December 2 to December 18, 2026.',
        queryText: 'Show complete academic calendar for mid-semester and end-semester exams 2026.'
      },
      {
        q: 'What is the minimum attendance requirement to write examinations?',
        a: 'Students must maintain a minimum of 85% attendance across all registered courses. Medical waivers are capped at an absolute max of 10% subject to approval by the Dean.',
        queryText: 'Detail examination attendance requirements, condonation policy, and medical certificate rules.'
      },
      {
        q: 'What happens if I miss an end-sem exam due to emergency?',
        a: 'If you miss an exam due to documented medical emergencies, you must submit a medical certificate to the Controller of Exams within 48 hours to register for the Make-up examination slot (usually held in January).',
        queryText: 'Explain make-up exam criteria, fee penalties, and grade calculation policies.'
      }
    ]
  },
  {
    category: 'hostel',
    label: 'Hostel & Mess',
    icon: Home,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-400',
    iconColor: 'text-blue-400',
    questions: [
      {
        q: 'How does hostel room allotment and room change requests work?',
        a: 'Room allotment is conducted annually in June based on GPA ranks. Room swap requests can be logged on the portal during the "Hostel Allotment Window" from July 1 to July 7, subject to vacancy.',
        queryText: 'How can I request room partner swaps or hostel block change?'
      },
      {
        q: 'What is the schedule for hostel mess food timings?',
        a: 'Breakfast: 7:30 AM - 9:00 AM | Lunch: 12:30 PM - 2:00 PM | High Tea: 5:00 PM - 6:00 PM | Dinner: 7:30 PM - 9:00 PM. Mess menu is rotated monthly by the student mess committee.',
        queryText: 'Detail mess timing schedule, guest coupons, and mess menu change policies.'
      },
      {
        q: 'How do I lodge a hostel maintenance repair request?',
        a: 'Go to Lodge Grievance page -> category "Hostel / Infrastructure Maintenance". Average resolution time is 24 hours for electrical/plumbing issues and 48 hours for internet/structural logs.',
        queryText: 'How to register a repair ticket for room fan, light, or wifi issues?'
      }
    ]
  },
  {
    category: 'library',
    label: 'Library Services',
    icon: BookOpen,
    color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-400',
    iconColor: 'text-violet-400',
    questions: [
      {
        q: 'What are the library operational hours and overnight rules?',
        a: 'The central library is open Monday through Saturday from 8:00 AM to 10:00 PM. During final examinations, the reading rooms remain open 24/7 with student ID verification.',
        queryText: 'Show library calendar, overnight study room bookings, and entry rules.'
      },
      {
        q: 'How many books can a student borrow and for how long?',
        a: 'Undergraduate students can borrow up to 4 books for a maximum duration of 14 days. Renewals can be done online once, provided there is no active reserve queue for that title.',
        queryText: 'What are the book lending limits, renewal options, and online reserve instructions?'
      },
      {
        q: 'What is the fine policy for overdue library books?',
        a: 'A fine of ₹10 per day is charged for standard books, and ₹50 per day for reference items. Overdue balances exceeding ₹500 will temporarily restrict further book issuances.',
        queryText: 'Show late fees structures and fine payment portal links for overdue library books.'
      }
    ]
  },
  {
    category: 'scholarships',
    label: 'Scholarships Program',
    icon: Award,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/20 text-pink-400',
    iconColor: 'text-pink-400',
    questions: [
      {
        q: 'What academic merit scholarships are available?',
        a: 'The university awards tuition fee waivers (25% to 100%) to top 5% rank holders in each branch. GPA must be maintained above 9.0 with no standing backlogs.',
        queryText: 'Detail merits scholarships criteria, eligibility, and scholarship renewal rules.'
      },
      {
        q: 'How and when do I submit application for financial aid?',
        a: 'Financial aid (Need-Based Tuition Support) portal opens in August. Students must upload certified family income certificates showing annual income below ₹3.0 LPA.',
        queryText: 'How to apply for financial assistance, required document uploads, and evaluation deadlines.'
      },
      {
        q: 'Are external government scholarships supported?',
        a: 'Yes, the institutional registrar office provides bonafide verification certificates to support NSP, PMS, and state government scholarship schemes.',
        queryText: 'Explain procedure to register NSP and state scholarship verification papers on campus.'
      }
    ]
  }
];

const POPULAR_FAQS = [
  {
    q: 'What is the minimum CGPA requirement for placement registration?',
    a: 'Most tier-1 visiting recruiting companies require a minimum CGPA of 7.0 or above with zero active backlogs. However, core engineering and research companies might set targets starting from 7.5 to 8.0 CGPA.',
    category: 'placements',
    queryText: 'What are placement cell CGPA cut-offs, backlog restrictions, and registration rules?'
  },
  {
    q: 'How do I connect to the high-speed campus WiFi networks?',
    a: 'Connect to "student360_WiFi_5G", redirect to the gateway portal, enter your institutional LDAP credentials (email and password), and download the security certificate.',
    category: 'it-support',
    queryText: 'IT support portal login guidelines and wifi certificate installs instructions.'
  }
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('fees');
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  // Custom AI query states
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuestionSent, setAiQuestionSent] = useState('');

  // Helpful rating state
  const [feedbackGiven, setFeedbackGiven] = useState({}); // { 'cat_index': 'helpful'/'not-helpful' }

  const handleAIQuery = async (queryText) => {
    setAiLoading(true);
    setAiResponse('');
    setAiQuestionSent(queryText);
    
    try {
      const response = await chatAPI.sendMessage(queryText);
      setAiResponse(response.data.response);
      
      // Auto scroll to response
      setTimeout(() => {
        document.getElementById('ai-response-box')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('FAQ transaction failed:', err.message);
      setAiResponse('### Local Knowledge Base Response\n\nUnable to establish stable tunnel to Glena AI. Our records indicate you should log in to your student360 student portal profile, submit a support ticket under the corresponding administrative wing (Finance/Hostel/Library), or consult the Academic Registrar during office hours (10:00 AM - 4:00 PM).');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    handleAIQuery(customQuestion);
    setCustomQuestion('');
  };

  const handleFeedback = (id, type) => {
    if (feedbackGiven[id]) return;
    setFeedbackGiven(prev => ({ ...prev, [id]: type }));
    
    if (type === 'helpful') {
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.85 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
  };

  const currentCategoryData = FAQ_KNOWLEDGE_BASE.find(cat => cat.category === activeCategory);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300 max-w-5xl mx-auto w-full pb-10">
      
      {/* Search & Header */}
      <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <HelpCircle size={18} className="text-accent-primary" />
            Campus Services FAQs
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Get instant verified answers or query student360 Glena AI regarding rules and timetables.</p>
        </div>
        
        {/* Custom query input bar */}
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 flex-1 max-w-md w-full">
          <div className="relative flex-grow">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask anything (e.g. library overnight room booking)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-accent-primary hover:opacity-90 active:scale-95 text-white shadow-glow transition-all"
          >
            <ArrowRight size={14} />
          </button>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Category Picker & Popular questions ─────────────────── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Categories Grid */}
          <GlassCard className="p-4" hoverEffect={false}>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-3">Categories</span>
            <div className="flex flex-col gap-2">
              {FAQ_KNOWLEDGE_BASE.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => {
                      setActiveCategory(cat.category);
                      setExpandedIndex(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected 
                        ? `bg-gradient-to-r ${cat.color} text-zinc-100 shadow-glow font-semibold` 
                        : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-center ${cat.iconColor}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-xs">{cat.label}</span>
                    </div>
                    <ChevronDown size={14} className={`opacity-40 transition-transform ${isSelected ? '-rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Popular / Trending FAQs */}
          <GlassCard className="p-4" hoverEffect={false}>
            <div className="flex items-center gap-1.5 mb-3 border-b border-zinc-850 pb-2">
              <Flame size={14} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">Trending FAQs</span>
            </div>
            
            <div className="space-y-4">
              {POPULAR_FAQS.map((faq, index) => (
                <div key={index} className="space-y-1.5">
                  <h5 className="text-[11px] font-bold text-zinc-200 leading-normal">{faq.q}</h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">{faq.a}</p>
                  <button 
                    onClick={() => handleAIQuery(faq.queryText)}
                    className="text-[9px] text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Sparkles size={9} /> Query Live updates
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Right Content Panel (Accordion & AI box) ────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FAQ Accordion list */}
          {currentCategoryData && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <FileText size={13} className="text-accent-primary" />
                Frequently Asked: {currentCategoryData.label}
              </h3>
              
              {currentCategoryData.questions.map((faq, idx) => {
                const isExpanded = expandedIndex === idx;
                const feedbackKey = `${activeCategory}_${idx}`;
                const userFeedback = feedbackGiven[feedbackKey];
                
                return (
                  <GlassCard 
                    key={idx}
                    hoverEffect={false}
                    className="p-4 transition-all duration-300 overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4"
                    >
                      <h4 className="font-semibold text-zinc-200 text-xs sm:text-sm">{faq.q}</h4>
                      <ChevronDown 
                        size={16} 
                        className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent-primary' : ''}`} 
                      />
                    </button>

                    {/* Accordion Body */}
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4 pt-3 border-t border-zinc-850' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-zinc-300 text-xs leading-relaxed font-sans">{faq.a}</p>
                        
                        {/* Accordion Actions */}
                        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-500">
                          <div className="flex items-center gap-2">
                            <span>Was this helpful?</span>
                            <button
                              onClick={() => handleFeedback(feedbackKey, 'helpful')}
                              disabled={!!userFeedback}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                                userFeedback === 'helpful'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <ThumbsUp size={10} /> Helpful
                            </button>
                            <button
                              onClick={() => handleFeedback(feedbackKey, 'not-helpful')}
                              disabled={!!userFeedback}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                                userFeedback === 'not-helpful'
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <ThumbsDown size={10} /> No
                            </button>
                          </div>

                          <button
                            onClick={() => handleAIQuery(faq.queryText)}
                            className="flex items-center gap-1 text-blue-400 font-semibold hover:text-blue-300"
                          >
                            <Sparkles size={11} className="text-blue-400" />
                            Verify with student360 AI
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* AI Response Panel */}
          {(aiLoading || aiResponse) && (
            <div id="ai-response-box">
              <GlassCard hoverEffect={false} className="relative overflow-hidden border border-blue-500/20 bg-blue-950/5">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="flex space-x-1.5 items-center justify-center">
                      <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">student360 AI is fetching policy details...</span>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-blue-400 animate-pulse" />
                        <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">AI verified guidance</h4>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono italic">Query: "{aiQuestionSent.slice(0, 30)}..."</span>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default FAQ;
