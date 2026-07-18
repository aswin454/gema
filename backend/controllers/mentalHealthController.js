const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// Community Knowledge Base – real student issues + expert-crafted solutions
// ─────────────────────────────────────────────────────────────────────────────
const communityKB = [
  {
    tags: ['stress', 'exam stress', 'exam anxiety', 'test anxiety', 'worried about exams', 'anxious about my upcoming exams', 'calm myself down right before an exam'],
    issue: "I feel extremely stressed before every exam.",
    solution: `💙 Exam anxiety is incredibly common — you're not weak for feeling this.

**What's helped students just like you:**
1. **Box Breathing** right now: inhale 4s → hold 4s → exhale 4s → hold 4s. Repeat 4 times.
2. **Reframe it:** Say "I am excited" instead of "I am scared." Same adrenaline, different outcome.
3. **Night before:** Stop studying by 9 PM. Sleep beats revision at this point.
4. **Morning of:** Eat something light, arrive 10 minutes early. Rushing spikes cortisol.

You've prepared — trust that preparation. Your brain knows more than it feels like right now. 🌟`
  },
  {
    tags: ['feel sad', 'sad and i don\'t know why', 'feel sad and i don', 'sad without reason', 'sadness for no reason'],
    issue: "I feel sad and I don't know why.",
    solution: `💙 That's one of the most disorienting feelings — sadness without a clear cause.

You don't need a "good enough reason" to feel this way. The feeling is real regardless.

**What might be happening:**
- Low-grade burnout can feel like unexplained sadness
- Disrupted sleep or poor nutrition deeply affects mood
- Sometimes sadness is your nervous system asking for rest

**What to try today:**
1. Go outside for 15 minutes — sunlight genuinely shifts mood chemistry
2. Write down 3 things that happened today, even tiny ones
3. Call or text someone — connection is medicine

If this has lasted more than 2 weeks, please speak to the college counsellor. You deserve support. 🌱`
  },
  {
    tags: ['lost interest', 'lost interest in things i used to love', 'no interest', 'things i loved', 'don\'t enjoy anymore'],
    issue: "I've lost interest in things I used to love.",
    solution: `💙 Losing interest in things you once loved is one of the most telling signs your mind needs care.

This is called **anhedonia** — and it's very common among students under sustained pressure.

**What helps:**
1. **Don't force enjoyment** — pressure makes it worse. Just do the activity without expecting to feel good.
2. **Start tiny:** 10 minutes of the hobby, not an hour. Momentum builds from small actions.
3. **Remove the audience:** Do it for yourself, not to perform it for others.
4. **Rest first:** Sometimes interest doesn't return until the tank is refilled.

If this has been ongoing for more than a month, talking to a counsellor is a really wise step. You're not broken — you're depleted. 💛`
  },
  {
    tags: ['nothing feels meaningful', 'nothing meaningful', 'no meaning', 'meaningless', 'no point in anything', 'what is the point'],
    issue: "Nothing feels meaningful anymore.",
    solution: `💙 When meaning disappears, everything feels like you're moving through fog. That's an exhausting place to be.

**This feeling often comes from:**
- Being disconnected from your own values (not others' expectations)
- Chronic exhaustion depleting the brain's reward system
- Isolation — meaning is partly built through connection

**What has helped others:**
1. **Do one small act of service** — helping someone else briefly restores meaning faster than anything
2. **Write down your original reasons** for being at college — not your parents' reasons, yours
3. **Talk to someone** — meaning is often found in the conversation, not before it
4. **Limit news and social media** — they actively erode the sense that life matters

You are more than this moment. Please reach out to a counsellor if this persists. 🌿`
  },
  {
    tags: ['dragging myself', 'dragging through', 'going through the motions', 'just existing', 'surviving not living'],
    issue: "I feel like I'm dragging myself through each day.",
    solution: `💙 Just getting through the day when everything feels heavy takes real strength.

The fact that you're still showing up — even on empty — matters.

**What to do when you're running on fumes:**
1. **Reduce, don't quit:** Lower your standards temporarily. Done poorly is better than not done.
2. **Identify one small thing to look forward to** each morning — coffee, a song, a show. Tiny anchors matter.
3. **Tell someone how you actually feel** — not "I'm fine" but the real version.
4. **See your doctor or counsellor** — persistent low energy can sometimes have a physical cause too.

You don't have to feel this way forever. This is a season, not a life sentence. 💪`
  },
  {
    tags: ['heart races', 'heart racing', 'can\'t calm down', 'my heart races', 'racing heart', 'overthink', 'overthinking', 'can\'t stop overthinking'],
    issue: "My heart races and I can't calm down.",
    solution: `💙 When your body is in alarm mode, it feels impossible to think clearly. Let's change that right now.

**Do this immediately — the physiological sigh:**
Inhale deeply through your nose → take a second quick inhale to fully fill lungs → slow exhale through mouth for 8 seconds. Do it 3 times.

**For overthinking loops:**
1. Set a "worry window" — 15 minutes at 5 PM to worry. Outside that window, postpone the thought.
2. Write the thought down — externalising it removes its power.
3. Ask: "Is this a fact or a fear?" Most anxious thoughts are fears dressed as facts.

**For the long term:** Reducing caffeine, building consistent sleep, and regular exercise all significantly reduce baseline anxiety. 🌿`
  },
  {
    tags: ['panic attack', 'had a panic attack', 'panic attack recently', 'panic attacks'],
    issue: "I had a panic attack recently.",
    solution: `💙 First — you survived it. Panic attacks are terrifying but they are never dangerous.

**What actually happens:** Your brain's alarm system misfired. It cannot hurt you, even when it feels like it will.

**During a panic attack — the 5-4-3-2-1 method:**
- 5 things you can SEE
- 4 things you can TOUCH (feel the texture)
- 3 things you can HEAR
- 2 things you can SMELL
- 1 thing you can TASTE

This activates your prefrontal cortex and overrides the panic signal.

**Going forward:**
- Avoid caffeine (it dramatically worsens panic)
- One CBT session with a counsellor can reduce panic by 60%
- Avoiding situations because of panic makes it stronger — gradual re-exposure helps

You're not "going crazy." Your nervous system learned a bad habit. It can unlearn it. 💛`
  },
  {
    tags: ['feel numb', 'numb but not sad', 'emotionally numb', 'numb and empty', 'feel nothing'],
    issue: "I feel numb but not exactly sad.",
    solution: `💙 Emotional numbness is your mind's way of protecting you from feeling too much at once.

It's not emptiness — it's a defence. And it often means something underneath needs attention.

**What numbness often signals:**
- Prolonged stress without recovery
- Suppressed emotions building up
- Dissociation from a difficult period

**What helps break through gently:**
1. **Physical sensation:** Cold water on your face, a warm shower, barefoot on grass — your body can bypass the mental block
2. **Music:** A song that used to move you, played without distraction
3. **Journaling:** Write "I feel nothing because..." and keep going. Often something surfaces.
4. **Gentle movement:** A 20-minute walk, not for fitness — for feeling.

Please don't sit with this alone for too long. A counsellor can help you understand what's underneath. 🌱`
  },
  {
    tags: ['not enjoying things', 'don\'t enjoy things', 'not enjoying', 'things i used to enjoy', 'lost my hobbies'],
    issue: "I'm not enjoying things like I used to.",
    solution: `💙 When joy goes quiet, it's unsettling. But it's more common than you think — especially in demanding academic environments.

**The honest truth:** Joy doesn't disappear — it gets buried under stress, sleep deprivation, and constant pressure.

**How to find it again:**
1. **Do the thing anyway** — even for 10 minutes. Waiting to feel like it means waiting forever.
2. **Reduce obligations by 10%** — less burden = more space for joy
3. **Spend time with someone who makes you laugh** — shared joy is easier to access than solo joy
4. **Ask yourself:** When did I last feel genuinely light? What was different then?

This feeling passes when you give yourself permission to rest AND play. 💛`
  },
  {
    tags: ['overwhelmed but managing', 'bit overwhelmed', 'managing but stressed', 'keeping up but barely'],
    issue: "I'm a bit overwhelmed but managing.",
    solution: `💙 "Managing" is real — and so is the effort it takes.

The fact that you're checking in even while you're holding things together says a lot about your self-awareness.

**To turn "managing" into "thriving":**
1. **Write down everything in your head** — a brain dump. Then sort by: urgent, important, can wait.
2. **Build in one recovery hour per day** — not productive, just yours.
3. **Say no to one thing this week** — one boundary creates breathing room.
4. **Tell someone you trust** "I'm doing okay but I'm a lot" — being witnessed helps.

You don't have to wait until you're not coping to ask for support. Coming here now is exactly right. 🌿`
  },
  {
    tags: ['maintain positive mindset', 'stay positive during exams', 'keep positive', 'maintain good mental health', 'mentally strong', 'stay mentally strong'],
    issue: "How do I maintain a positive mindset during stressful periods?",
    solution: `🌟 The fact that you're thinking about this *before* you need it is genuinely one of the most powerful things you can do.

**Mindset maintenance during exam season:**
1. **Daily anchors:** One consistent activity that signals "I am okay" — a walk, a morning song, journaling.
2. **Limit catastrophising:** When a negative thought comes, ask "What's the most *likely* outcome?" not the worst.
3. **Celebrate micro-wins:** Finished one chapter? That counts. Your brain responds to acknowledgment.
4. **Talk to yourself like you'd talk to a friend** — you wouldn't tell a friend they're failing. Don't tell yourself that.
5. **Stay connected** — even one genuine conversation per day protects mental health significantly.

You're building resilience in real-time. That's impressive. 💪`
  },
  {
    tags: ['daily wellness routine', 'wellness routine', 'mental health habits', 'healthy habits for students', 'good habits'],
    issue: "I want to build a daily wellness routine.",
    solution: `🌿 Building a wellness routine is one of the highest-ROI things you can do as a student.

**A simple sustainable framework:**

🌅 **Morning (10 min):**
- Don't check your phone for the first 10 minutes
- Drink water before caffeine
- Write one intention for the day

🎯 **During the day:**
- 25-min focus blocks with 5-min breaks (Pomodoro)
- Step outside at least once
- Eat at least two proper meals

🌙 **Evening (15 min):**
- Write 3 things that happened (good or neutral)
- No screens 30 min before sleep
- Sleep and wake at consistent times

**Key rule:** Start with just ONE of these. Trying everything at once leads to quitting everything. 💛`
  },
  {
    tags: ['help a friend', 'friend struggling', 'friend who seems depressed', 'friend seems sad', 'support a friend'],
    issue: "How do I help a friend who seems to be struggling?",
    solution: `💙 The fact that you're asking this means you're already being a good friend.

**What actually helps:**
1. **Ask directly but gently:** "Hey, you seem a bit off lately. Are you okay? I actually want to know."
2. **Listen without fixing:** Resist the urge to immediately offer solutions. Just say "That sounds really hard."
3. **Stay consistent:** Check in again in 2–3 days. One conversation isn't enough.
4. **Don't keep it secret if they're unsafe:** If your friend mentions self-harm, tell a trusted adult or counsellor. This is care, not betrayal.
5. **Take care of yourself too:** Supporting someone in pain is emotionally heavy. You matter too.

You can't pour from an empty cup — be there for them AND yourself. 🌱`
  },
  {
    tags: ['loneliness', 'lonely', 'no friends', 'isolated', 'feel alone', 'socially awkward'],
    issue: "I feel completely alone. I don't know how to make friends.",
    solution: `💙 Loneliness in college is far more common than people let on — social media hides it.

**What has genuinely worked for students:**
1. **Join one thing and stay** — not to make friends immediately, but to build repeated contact. Friends come from repetition.
2. **Be the one who texts first** — most people are waiting for someone else to reach out.
3. **Study in common spaces** — proximity builds connection more than any social skill.
4. **Give it 6 weeks** — research shows loneliness peaks at 3 weeks and drops significantly by 7.

You're not unlikable. You're in an unfamiliar environment. Those are very different things. 🌟`
  },
  {
    tags: ['burnout', 'exhausted', 'no energy', 'burned out', 'drained', 'cant do anything'],
    issue: "I'm completely burned out.",
    solution: `💙 Burnout isn't weakness — it's what happens when you give too much for too long without recovery.

**Immediate steps:**
1. **Acknowledge it without guilt.** This is a physiological state, not a personal failure.
2. **Real rest for 48 hours** — not "lazy" rest, but genuine recovery: sleep, food, things that feel good.
3. **Return with micro-goals:** Just 2 tasks per day. Momentum rebuilds from tiny wins.
4. **Remove one commitment** — burnout comes from over-commitment. Something needs to go.

*Recovery timeline: Most students feel meaningfully better within 5–7 days of genuine rest.* 🌿`
  },
  {
    tags: ['depression', 'hopeless', 'empty', 'no point', 'depressed', 'unmotivated for everything'],
    issue: "I feel empty and hopeless.",
    solution: `💙 What you're describing matters — and you were right to say it out loud.

**What has helped students in this place:**
1. **Tell one person today** — a friend, family member, or counsellor. Isolation amplifies it.
2. **One tiny action:** A walk, a meal, a shower. Emotion follows action, not the other way around.
3. **Basic structure:** Same wake time, two meals, once outside. Structure is scaffolding for mood.
4. **See a professional** — college counsellors are free and confidential.

⚠️ *If you're having thoughts of harming yourself: iCall: 9152987821 | Vandrevala: 1860-2662-345 (24/7)*

You don't have to feel this way forever. Please reach out to someone today. 💙`
  },
  {
    tags: ['sleep', 'insomnia', 'can\'t sleep', 'awake at night', 'sleep problems'],
    issue: "I can't sleep.",
    solution: `💙 Sleep problems are the most common mental health complaint among students — and they're very fixable.

**Start here:**
1. **Fix your wake time first** (not bedtime). Same time every day, including weekends. Your body clock resets around wake time.
2. **No screens 45 minutes before bed** — blue light cuts melatonin by 50%.
3. **Bed = sleep only** — no studying, eating, or scrolling in bed.
4. **If awake after 20 minutes, get up** — lying awake trains your brain that bed = alertness.
5. **No caffeine after 2 PM.**

*Most students see improvement within 1 week of consistent sleep hygiene.* 🌙`
  },
  {
    tags: ['homesick', 'miss home', 'miss family', 'missing parents', 'miss my hometown'],
    issue: "I feel homesick.",
    solution: `💙 Missing home isn't weakness — it's love. And that's a beautiful thing to carry.

**What has helped hostel students:**
1. **Schedule two calls home per week** at fixed times. Predictability makes the gap feel smaller.
2. **Create one comfort ritual:** A familiar snack, a specific song, your own bedding.
3. **Give yourself 6 weeks** — homesickness reliably peaks at 3 weeks and reduces significantly by week 7.
4. **Build one new anchor here** — a person, a place, a routine that belongs to this chapter.

You're allowed to miss home AND build a life here. They're not in conflict. 🏡`
  },
  {
    tags: ['relationship', 'breakup', 'heartbreak', 'boyfriend', 'girlfriend', 'ex'],
    issue: "I'm going through heartbreak.",
    solution: `💙 Heartbreak is one of the most physically painful emotional experiences — your brain processes it similarly to physical pain.

**Recovery steps:**
1. **Let yourself feel it** — 2 days of genuine grief before trying to "be okay."
2. **No contact for at least 3 weeks** — continued contact refreshes the wound.
3. **Fill the empty hours intentionally** — new activity, not Netflix bingeing.
4. **Write down 5 things that define you** outside of this relationship.

*"I thought I'd never feel normal again. By month 2 I genuinely was okay." — Student testimonial*

Healing isn't linear, but it is real. 💛`
  },
  {
    tags: ['pressure', 'parent pressure', 'family pressure', 'expectations', 'disappointing parents'],
    issue: "My parents have extremely high expectations.",
    solution: `💙 Carrying other people's dreams on top of your own is an enormous weight.

**What has helped students:**
1. **Separate their expectations from your identity** — their fears don't define your worth.
2. **One honest conversation:** "When I feel I must rank first, I feel paralysed, not motivated."
3. **Define success on your own terms** — write it down. Return to it when pressure hits.
4. **Perform for yourself** — paradoxically, detachment from parental outcome often improves performance.

You are not responsible for managing their emotions. You are responsible for your own life. 🌿`
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Fast-path local matcher — checks exact phrase first, then tag scoring
// ─────────────────────────────────────────────────────────────────────────────
const findLocalSolution = (prompt) => {
  const lower = prompt.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of communityKB) {
    // Prioritise exact phrase tag matches (score them higher)
    let score = 0;
    for (const tag of entry.tags) {
      if (lower.includes(tag)) {
        // Longer tag = more specific match = higher score
        score += tag.length > 10 ? 3 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};


// ─────────────────────────────────────────────────────────────────────────────
// Ollama mental health query — 3-tier speed pipeline
// Tier 1: Instant local KB match (0ms)
// Tier 2: Ollama for unknown/complex messages (with 25s timeout)
// Tier 3: Warm fallback if Ollama times out
// ─────────────────────────────────────────────────────────────────────────────
const queryMentalHealth = async (prompt, history = []) => {
  // ── TIER 1: Instant local answer ─────────────────────────────────────────
  const local = findLocalSolution(prompt);
  if (local) {
    // Return immediately — no network call, no latency
    return local.solution;
  }

  // ── TIER 2: Ollama for unrecognised/complex messages ─────────────────────
  const model = process.env.GEMMA_MODEL || 'gemma4:e2b';
  const url = `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`;

  const systemPrompt = `You are Serenity, a compassionate mental health support assistant for university students.
Be warm, brief, and practical. Use emojis sparingly. Max 150 words.
When self-harm is mentioned, always give iCall: 9152987821.
Use short bullet points. No long paragraphs.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: prompt }
  ];

  try {
    const response = await axios.post(url, {
      model,
      messages,
      stream: false,
      options: { temperature: 0.65, num_predict: 200 }
    }, { timeout: 25000 });

    return response.data?.message?.content || TIER3_FALLBACK;
  } catch {
    // ── TIER 3: Warm offline fallback ────────────────────────────────────────
    return TIER3_FALLBACK;
  }
};

const TIER3_FALLBACK = `💙 I'm here for you. While I'm having a small connection issue, here's what you can do right now:

- **Take 5 slow breaths** — in through your nose, out through your mouth.
- **Write down one sentence** about how you feel. Just one.
- **Reach out to someone** you trust today.

If you're in crisis: **iCall: 9152987821** (Mon–Sat, 8 AM–10 PM)

Please describe what you're going through and I'll do my best to support you. 🌿`;




// ─────────────────────────────────────────────────────────────────────────────
// Related follow-up questions for each topic
// ─────────────────────────────────────────────────────────────────────────────
const getFollowUpOptions = (prompt) => {
  const lower = prompt.toLowerCase();

  const topicMap = [
    {
      keywords: ['stress', 'exam', 'anxiety', 'test', 'nervous', 'anxious about'],
      options: [
        'How do I calm myself down right before an exam?',
        'What is the best study schedule to reduce stress?',
        'Are there breathing exercises that actually work?',
        'How do I stop comparing myself to others?',
        'What should I eat before an exam for better focus?',
        'How do I deal with a mind blank during the test?'
      ]
    },
    {
      keywords: ['lonely', 'alone', 'isolated', 'no friends', 'friend'],
      options: [
        'How do I start a conversation with someone new?',
        'What clubs should I join to meet people?',
        'How long does it take to feel settled in a new college?',
        'Is it normal to feel lonely in college?',
        'How do I make friends as an introvert?',
        'What do I do when everyone around me seems to have a group already?'
      ]
    },
    {
      keywords: ['burnout', 'tired', 'exhausted', 'no energy', 'overwhelmed', 'drained'],
      options: [
        'How do I recover from burnout fast?',
        'How do I know if I am burned out or just lazy?',
        'What are the signs I need to take a mental health day?',
        'How do I set boundaries on my workload?',
        'Is it okay to take a break from studying entirely?',
        'How do I explain burnout to my parents?'
      ]
    },
    {
      keywords: ['panic', 'heart racing', 'breathe', 'attack', 'racing heart'],
      options: [
        'What should I do during a panic attack?',
        'How do I prevent panic attacks from coming back?',
        'Should I tell my professor about my anxiety?',
        'What is CBT and does it help?',
        'Are panic attacks dangerous?',
        'How do I explain panic attacks to someone who has never had one?'
      ]
    },
    {
      keywords: ['sad', 'depressed', 'hopeless', 'empty', 'unmotivated', 'no point', 'meaningless'],
      options: [
        'How do I find motivation when I feel hopeless?',
        'When should I see a professional for my sadness?',
        'How can I help a friend who seems depressed?',
        'What is the difference between sadness and depression?',
        'How do I get out of bed when I have no energy?',
        'Is it normal to feel nothing for weeks?'
      ]
    },
    {
      keywords: ['sleep', 'insomnia', 'awake', 'rest', 'can\'t sleep'],
      options: [
        'What is the best routine to fix my sleep?',
        'Can stress cause insomnia?',
        'How many hours of sleep do I really need?',
        'What foods or habits make sleep worse?',
        'Should I nap during the day if I slept badly?',
        'Why do I feel tired even after sleeping 8 hours?'
      ]
    },
    {
      keywords: ['home', 'miss home', 'miss family', 'miss my', 'homesick'],
      options: [
        'How long does homesickness usually last?',
        'How can I feel closer to home while in hostel?',
        'Is it okay to go home every weekend?',
        'How do I build a new support system here?',
        'Why does homesickness feel physical?',
        'How do I stop crying about missing home?'
      ]
    },
    {
      keywords: ['relationship', 'breakup', 'heartbreak', 'boyfriend', 'girlfriend', 'ex', 'love'],
      options: [
        'How long does heartbreak take to heal?',
        'Should I stay friends with my ex?',
        'How do I stop thinking about them?',
        'How do I focus on studies after a breakup?',
        'Why do I keep checking their social media?',
        'Is it normal to feel relief and sadness at the same time after a breakup?'
      ]
    },
    {
      keywords: ['pressure', 'expectations', 'disappoint', 'family pressure', 'parent pressure'],
      options: [
        'How do I talk to my parents about their expectations?',
        'How do I stop feeling guilty for not performing perfectly?',
        'What if I genuinely don\'t want the career my parents want?',
        'How do I set healthy boundaries with family?',
        'Is it selfish to live for myself and not my parents\' dreams?',
        'What do I do when I feel like I\'m a disappointment?'
      ]
    }
  ];

  for (const topic of topicMap) {
    if (topic.keywords.some(k => lower.includes(k))) {
      // Return the full pool — frontend handles the 3-visible + shuffle
      return topic.options;
    }
  }

  // Default general pool
  return [
    'I feel stressed about my exams.',
    'I\'ve been feeling very lonely at college.',
    'I\'m completely burned out and can\'t study.',
    'I had a panic attack and I don\'t know what to do.',
    'Nothing feels meaningful anymore.',
    'My heart races and I can\'t calm down.'
  ];
};


// ─────────────────────────────────────────────────────────────────────────────
// Express Route Handlers
// ─────────────────────────────────────────────────────────────────────────────

// In-memory session store (no DB needed for private mental health chats)
const sessions = {};

const sendMentalHealthMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id.toString();

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  try {
    if (!sessions[userId]) sessions[userId] = [];
    const history = sessions[userId];

    const responseText = await queryMentalHealth(message, history);
    const followUpOptions = getFollowUpOptions(message);

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: responseText, options: followUpOptions });

    // Keep session to last 20 messages
    if (history.length > 20) history.splice(0, history.length - 20);

    res.json({
      response: responseText,
      options: followUpOptions,
      history: history.map((m, i) => ({ ...m, _id: `mh_${userId}_${i}` }))
    });
  } catch (error) {
    console.error('Mental Health Chat Error:', error.message);
    res.status(500).json({ message: 'Failed to process your message.' });
  }
};

const getMentalHealthHistory = async (req, res) => {
  const userId = req.user._id.toString();
  const history = sessions[userId] || [];
  res.json(history.map((m, i) => ({ ...m, _id: `mh_${userId}_${i}` })));
};

const clearMentalHealthHistory = async (req, res) => {
  const userId = req.user._id.toString();
  sessions[userId] = [];
  res.json({ message: 'Session cleared.' });
};

module.exports = { sendMentalHealthMessage, getMentalHealthHistory, clearMentalHealthHistory };
