const axios = require('axios');

// Campus Knowledge Base for Mock Fallback Responses
const campusKnowledge = {
  fees: "Academic fees can be paid online via the Student Portal under the 'Finance' tab. The deadline for Semester registration and fee payment is July 31, 2026. For installment options, contact the Accounts Office or raise a complaint under the 'Finance' category in your dashboard.",
  exams: "The End-Semester examinations are scheduled to commence on November 15, 2026. Timetables will be published on the portal 3 weeks prior. Make sure you maintain a minimum of 75% attendance to obtain your admit card.",
  attendance: "Attendance is updated daily by subject faculty. You can view your attendance breakdown under the Attendance tab. If your attendance falls below 75%, you will receive an automatic alert. Use the Attendance Predictor on your dashboard to calculate the minimum classes required to recover your percentage.",
  scholarships: "CampusOne offers merit-based, need-based, and sports scholarships. Applications for the annual 'Glena Scholarship Program' are open until August 15, 2026. Students require a minimum CGPA of 8.5 to apply. Contact the Dean of Student Welfare for registration details.",
  hostel: "Hostel rooms are allotted based on academic merits. If you need repairs (plumbing, electrical), please raise a complaint under the 'Hostel' category on this portal, and the warden will dispatch a technician. Hostel mess menu updates are posted under Announcements.",
  library: "The central library is open 24/7 during examinations, and 8:00 AM - 10:00 PM on regular days. You can borrow up to 5 books for a period of 14 days using your student ID card.",
  complaints: "You can file a formal grievance under the 'Complaints' tab. Complaints are tracked in real-time. Statuses include: 'Pending' (filed), 'In Progress' (assigned to a department/official), and 'Resolved' (action taken). You can upload photos as proof when lodging a complaint.",
  placements: "The Placement Portal tracks active placement drives. You can upload your resume, which will be analyzed by CampusOne AI to give you scores and resume recommendations. We also offer AI-generated mock interview questions tailored for specific corporate roles."
};

/**
 * Intelligent Mock Response Generator based on user prompt keywords
 */
const generateMockResponse = (userPrompt, studentContext) => {
  const promptLower = userPrompt.toLowerCase();
  
  // Custom greetings
  if (promptLower.match(/\b(hi|hello|hey|greetings)\b/)) {
    return `Hello ${studentContext?.name || 'there'}! I am Glena, your virtual university assistant. How can I help you today with your attendance, courses, hostel, placements, or filing complaints?`;
  }
  
  // Attendance question
  if (promptLower.includes('attendance') || promptLower.includes('missed class') || promptLower.includes('low attendance')) {
    const currentAttendance = studentContext?.attendancePercentage ?? 72;
    let advice = "";
    if (currentAttendance < 75) {
      advice = `Your attendance is currently **${currentAttendance}%**, which is below the mandatory 75% threshold. I recommend using the **Attendance Calculator** on your dashboard to see how many consecutive classes you need to attend to cross 75%. Would you like me to draft an email request to your faculty for attendance review?`;
    } else {
      advice = `Your current attendance is at a healthy **${currentAttendance}%**. Keep it up to avoid academic warnings!`;
    }
    return `### Attendance Status Alert\n\n${advice}\n\n*Note: If you missed classes due to medical reasons, please submit a medical certificate to the Academic Office and log a complaint under 'Academics' for verification.*`;
  }

  // Study plan / Schedule questions
  if (promptLower.includes('study plan') || promptLower.includes('study schedule') || promptLower.includes('study plan')) {
    return `### AI-Generated Study Plan (Next 7 Days)
Based on your courses, here is a custom study plan:

*   **Days 1-2 (Mathematics & Logic):** Focus on Calculus problem sets. Dedicate 2 hours in the evening.
*   **Days 3-4 (Web Architecture):** Review REST APIs and complete your pending assignment.
*   **Days 5-6 (Database Systems):** Practice SQL joins and normalization exercises.
*   **Day 7 (Revision & Quiz):** Review the study materials and attempt mock questions.

*Tip: Spend 45 minutes on highly complex topics and take a 5-minute break (Pomodoro Technique).*`;
  }

  // Scholarship question
  if (promptLower.includes('scholarship')) {
    return `### Scholarships & Financial Aid\n\n${campusKnowledge.scholarships}`;
  }

  // Fees question
  if (promptLower.includes('fee') || promptLower.includes('payment') || promptLower.includes('finance')) {
    return `### Fee Payment Details\n\n${campusKnowledge.fees}`;
  }

  // Exams question
  if (promptLower.includes('exam') || promptLower.includes('timetable') || promptLower.includes('test')) {
    return `### Examination Info\n\n${campusKnowledge.exams}`;
  }

  // Hostel question
  if (promptLower.includes('hostel') || promptLower.includes('room') || promptLower.includes('mess')) {
    return `### Hostel Services\n\n${campusKnowledge.hostel}`;
  }

  // Library question
  if (promptLower.includes('library') || promptLower.includes('book')) {
    return `### Library Policy\n\n${campusKnowledge.library}`;
  }

  // Placement question
  if (promptLower.includes('placement') || promptLower.includes('resume') || promptLower.includes('job') || promptLower.includes('career')) {
    return `### Placements & Career Cell\n\n${campusKnowledge.placements}`;
  }

  // Complaints / Grievances question
  if (promptLower.includes('complaint') || promptLower.includes('grievance') || promptLower.includes('track')) {
    return `### Grievance & Complaint Tracking\n\n${campusKnowledge.complaints}`;
  }

  // Default response
  return `### CampusOne Glena AI Assistant
I understand you are asking about: "${userPrompt}". 

CampusOne Glena links all university services:
1. **Academics**: Course syllabus, assignments, schedules, and personalized study plans.
2. **Attendance**: Automated alerts and target recovery calculations.
3. **Complaints**: Raising issues (hostel maintenance, academics, Wi-Fi) with real-time department updates.
4. **Placements**: Resume scoring and simulated interview question generation.

Please ask specific questions like:
* "What is my attendance status?"
* "When are the End-Semester exams?"
* "How do I apply for scholarships?"
* "Generate a study plan for this semester."`;
};

/**
 * Instant local query responder for high-speed demo and pre-set questions
 */
const getInstantResponse = (prompt, studentContext) => {
  const promptLower = prompt.toLowerCase().trim();
  
  // Greetings
  if (promptLower.match(/\b(hi|hello|hey|greetings|welcome|hai)\b/)) {
    return `Hello ${studentContext?.name || 'there'}! I am Glena, your virtual university assistant. How can I help you today with your attendance, courses, hostel, placements, or filing complaints?`;
  }
  
  // Specific Sub-Matches first to handle related questions precisely
  
  // 1. Attendance sub-matches
  if (promptLower.includes('calculate target recovery') || promptLower.includes('recovery classes')) {
    return `### Attendance Recovery Calculator Guide
To calculate target recovery classes:
1. Go to your **Student Dashboard**.
2. Locate the **Attendance Indicator** card.
3. Use the interactive **Attendance Predictor** calculator.
4. Input your target percentage (e.g. 75% or 80%) to see the exact number of consecutive classes you must attend to recover your percentage.`;
  }
  if (promptLower.includes('medical certificate') || promptLower.includes('medical leave')) {
    return `### Submitting Medical Certificates
If you missed classes due to medical reasons:
1. Log a formal ticket under the **Complaints** page on your dashboard.
2. Select the **Academics** category.
3. Write a brief description of your medical leave duration.
4. Upload your scanned medical certificate as a JPG/PNG attachment.
5. The Academic Office will review and update your attendance status.`;
  }
  if (promptLower.includes('attendance correction') || promptLower.includes('corrections')) {
    return `### Attendance Correction Procedure
If you noticed an incorrect attendance entry:
1. Contact the respective **Course Faculty** directly.
2. Corrections must be submitted within **3 working days** of the marked date.
3. Once approved, the faculty will update your status directly in the system.`;
  }
  if (promptLower.includes('penalty for low attendance') || promptLower.includes('attendance penalty')) {
    return `### Penalty for Low Attendance
If your attendance in a course drops below **75%** without a verified medical or official academic waiver:
1. You will be debarred from appearing in the End-Semester Examination for that course.
2. The course status will be recorded as a Fail ('F' grade) due to shortage of attendance.`;
  }
  if (promptLower.includes('internal attendance') || promptLower.includes('attendance marks')) {
    return `### Internal Assessment Attendance Marks
Attendance carries a weightage of **5 marks** in your internal assessments:
*   **95% and above:** 5 marks
*   **90% - 94%:** 4 marks
*   **85% - 89%:** 3 marks
*   **80% - 84%:** 2 marks
*   **75% - 79%:** 1 mark`;
  }

  // 2. Study plan sub-matches
  if (promptLower.includes('preparation tips') || promptLower.includes('prep tips')) {
    return `### Exam Preparation Tips
Here are some tips to prepare for your assessments:
1. **Analyze Assigned Tips:** Read the AI Study Tips generated for your active assignments.
2. **Focus Areas:** Dedicate 45 minutes daily to subjects where your current scores are lower.
3. **Mock Papers:** Practice with previous years' question sets available at the Central Library desk.
4. **Breaks:** Use the Pomodoro Technique (25 minutes study, 5 minutes break).`;
  }
  if (promptLower.includes('reference materials') || promptLower.includes('study references')) {
    return `### Course Reference Materials
To access study reference materials:
1. Go to the respective **Course Detail** page on your portal.
2. Check the **Resources** section for lecture slides and reading guides.
3. Use the central library search portal (OPAC) to borrow textbooks.`;
  }
  if (promptLower.includes('peer study') || promptLower.includes('study groups')) {
    return `### Peer Study Groups
To join student study circles:
1. CampusOne coordinates peer tutoring sessions every **Tuesday and Thursday** at the Student Union Hall (5:00 PM - 6:30 PM).
2. Contact your Class Representative to sign up as a tutor or tutee.`;
  }
  if (promptLower.includes('write a daily schedule') || promptLower.includes('daily schedule')) {
    return `### Recommended Daily Study Schedule
Optimize your daily routine with this structured schedule:
*   **08:30 AM - 12:30 PM:** Core Lectures and active class participation.
*   **02:00 PM - 05:00 PM:** Lab practicals, assignment work, and coding practice.
*   **06:00 PM - 08:00 PM:** Revision of concepts covered during the day.
*   **08:00 PM onwards:** Leisure, project building, and minimum 7-8 hours of sleep.`;
  }
  if (promptLower.includes('recommended study tools') || promptLower.includes('study tools')) {
    return `### Essential Study Tools for Students
Vastly improve your academic workflow using these tools:
1. **Notion:** For keeping neat class notes and assignment tracking.
2. **Anki:** Spaced repetition flashcards for learning definitions and syntax.
3. **Forest / Pomodoro:** Keeping distraction-free intervals (25 mins focus, 5 mins break).`;
  }

  // 3. Exam sub-matches
  if (promptLower.includes('passing criteria')) {
    return `### Academic Passing Criteria
To pass a subject at CampusOne:
1. You must score at least **40%** in the End-Semester Examination.
2. You must achieve a combined score of **50%** (Internal Assessments + End-Semester Exam) to secure a passing grade.`;
  }
  if (promptLower.includes('admit card')) {
    return `### Exam Admit Card Downloads
Important information regarding admit cards:
1. Admit cards are released online **7 days before** the commencement of exams.
2. **Eligibility Criteria:** You must maintain a minimum of **75% attendance** in each course and clear all pending library/finance dues to download it.`;
  }
  if (promptLower.includes('re-evaluation') || promptLower.includes('re-eval')) {
    return `### Answer Script Re-evaluation
If you wish to apply for exam re-evaluation:
1. Applications are accepted online within **15 days** of result declaration.
2. Navigate to the **Finance** page to pay the re-evaluation fee of **₹500 per subject**.
3. Submit the formal request form through the Registrar office desk.`;
  }
  if (promptLower.includes('miss') && promptLower.includes('exam')) {
    return `### Missing an End-Semester Examination
If you miss a scheduled end-semester exam due to emergency:
1. You must submit a formal application along with authenticated medical certificates to the Registrar Office within **48 hours**.
2. If approved, you will be permitted to sit for the Make-up examination. Unapproved absences result in a zero grade ('Ab').`;
  }
  if (promptLower.includes('supplementary exam') || promptLower.includes('supplementary')) {
    return `### Supplementary Examinations
*   Supplementary exams are conducted once a year during the summer semester (June/July).
*   Eligible students with active backlog courses can register via the portal and pay the backlog exam fee of ₹1,000 per paper.`;
  }

  // 4. Hostel sub-matches
  if (promptLower.includes('mess menu') || promptLower.includes('hostel mess')) {
    return `### Hostel Mess Schedule
*   **Breakfast (7:30 AM - 9:00 AM):** Dosa, Idli, Poha, Tea & Coffee.
*   **Lunch (12:30 PM - 2:00 PM):** Roti, Rice, Dal, Mixed Veg, Curd.
*   **Evening Snacks (5:00 PM - 6:00 PM):** Samosa/Pakoda, Hot Tea.
*   **Dinner (7:30 PM - 9:00 PM):** Roti, Curry, Rice, Dessert (Sunday special dinner).`;
  }
  if (promptLower.includes('maintenance request') || promptLower.includes('lodge a maintenance') || promptLower.includes('hostel maintenance') || (promptLower.includes('complaint') && promptLower.includes('hostel') && promptLower.includes('maintenance'))) {
    return `### Lodging Hostel Maintenance Requests
For plumbing, electrical, or structural repairs in your hostel room:
1. Open the **Lodge Grievance** / **Complaints** section in your dashboard.
2. Click **Raise a Complaint**.
3. Set the Category to **Hostel** and write your room details (e.g. Room B-302) and problem description.
4. Upload any supporting photos if necessary.
5. The maintenance team will address your request within 24 hours.`;
  }
  if (promptLower.includes('in-out timings') || promptLower.includes('curfew')) {
    return `### Hostel Entry & Curfew Rules
All hostel students must adhere to the curfew:
1. The hostel gates close at **10:00 PM** daily.
2. Late entry permission must be logged online through the portal before 6:00 PM with Warden approval.`;
  }
  if (promptLower.includes('change my hostel room') || promptLower.includes('room change')) {
    return `### Hostel Room Change Request
Room change requests are only accepted during the first 2 weeks of the academic semester. Apply in writing to the Chief Warden with mutual consent from both room occupants.`;
  }
  if (promptLower.includes('hostel guest') || promptLower.includes('guest policies')) {
    return `### Hostel Guest Policy
Day guests are allowed in the common room between 9:00 AM and 6:00 PM. Overnight stay for parents requires warden permission and is charged at ₹300/day at the guest house.`;
  }

  // 5. Scholarship sub-matches
  if (promptLower.includes('how do i apply for scholarship') || promptLower.includes('how do i apply for scholarships') || promptLower.includes('apply for scholarships')) {
    return `### How to Apply for Scholarships
To apply for campus scholarships:
1. **Check Eligibility:** Merit scholarships require a minimum CGPA of **8.5**. Need-based scholarships require a CGPA of **7.0** and family income < ₹3 Lakhs/annum.
2. **Compile Documents:** Prepare your previous semester grade card, family income certificate, student ID card, and bank passbook details.
3. **Register Online:** Applications open online on the Student Portal from August 1 to August 15, 2026.
4. **Submit Application:** Fill out the scholarship form under the Welfare tab, upload the files, and click submit.`;
  }
  if (promptLower.includes('minimum cgpa') || promptLower.includes('cgpa for scholarship')) {
    return `### Scholarship CGPA Eligibility
*   **Merit Scholarships:** Minimum Cumulative Grade Point Average (CGPA) of **8.5** is required.
*   **Need-based Financial Aid:** Minimum CGPA of **7.0** along with verified family income certificate (< ₹3 Lakhs per annum).`;
  }
  if (promptLower.includes('documents') && promptLower.includes('scholarship')) {
    return `### Required Scholarship Documents
Please compile the following documents for your application:
1. Scanned copies of previous semester grade cards.
2. Verified Family Income Certificate issued by local authorities.
3. Student ID card and Aadhaar card copies.
4. Copy of bank passbook (for direct credit).`;
  }
  if (promptLower.includes('scholarship results') || promptLower.includes('results date')) {
    return `### Scholarship Results & Disbursement
*   The final list of selected scholarship awardees is published on the portal on **September 15, 2026**.
*   Approved scholarship funds are disbursed directly to your registered bank account within 30 working days.`;
  }
  if (promptLower.includes('sports scholarships') || promptLower.includes('sports scholarship')) {
    return `### Sports Scholarships
Students who have represented the university at State or National levels are eligible for 50% to 100% tuition fee waivers. Submit your certificates to the physical director.`;
  }
  if (promptLower.includes('scholarship amount disbursed') || promptLower.includes('disbursed')) {
    return `### Scholarship Funds Disbursement
Once approved, the scholarship amount is adjusted directly against your next semester's tuition fees. Cash refunds are only issued for final-year students.`;
  }

  // 6. Placement sub-matches
  if (promptLower.includes('resume match score') || promptLower.includes('improve my resume')) {
    return `### Improving Your AI Resume Score
To improve your placement resume match score:
1. Navigate to the **Placements** page.
2. Upload your PDF resume to see your score analysis.
3. Implement recommendations: include project metrics (e.g., "improved speed by 15%"), correct formatting gaps, and add missing course keywords.`;
  }
  if (promptLower.includes('mock interview')) {
    return `### Glena Mock Interview Simulator
To schedule a mock interview:
1. Go to the **Placements** page.
2. Under "AI Prep", click **Start Mock Interview**.
3. Choose your target domain (Software Engineering, Analyst, etc.).
4. Glena will output behavioral and technical interview questions for you to practice.`;
  }
  if (promptLower.includes('companies visiting') || promptLower.includes('recruiters') || promptLower.includes('visiting the campus') || promptLower.includes('visiting campus') || promptLower.includes('visiting for recruitment')) {
    return `### Active Recruiters & Visiting Companies
*   Major campus recruitment drives from TCS, Infosys, Wipro, and Cognizant are scheduled to visit during August 2026.
*   Keep your CGPA, resume, and profile details complete to receive invites.`;
  }
  if (promptLower.includes('average package') || promptLower.includes('package for cse')) {
    return `### Average CSE Placement Package
The average placement package for the Computer Science branch is **₹6.5 LPA**, with the highest package reaching **₹24 LPA** in the previous recruitment season.`;
  }
  if (promptLower.includes('off-campus') || promptLower.includes('referrals')) {
    return `### Off-Campus Drives & Referrals
The Placement Cell regularly posts off-campus job opportunities on the announcements board and facilitates alumnus referrals for graduates.`;
  }

  // 7. Complaint sub-matches
  if (promptLower.includes('track my active complaint') || promptLower.includes('track my complaint')) {
    return `### Tracking Active Complaints
To view the status of your complaints:
1. Go to the **Complaints** section in your dashboard.
2. You can view all logged complaints along with status tags:
   *   **Pending:** Complaint registered.
   *   **In Progress:** Assigned to departmental team.
   *   **Resolved:** Action taken and closed.`;
  }
  if (promptLower.includes('resolution time') || promptLower.includes('how long')) {
    return `### Grievance Resolution Timelines
*   **Hostel & Facility Maintenance:** Addressed within 24 hours.
*   **Academic & Fee Discrepancies:** Resolved in 3 to 5 working days after verification.`;
  }
  if (promptLower.includes('upload photos')) {
    return `### Attaching Photos to Complaints
*   Yes, you can upload up to 2 PNG/JPG images (maximum file size 5MB each) when raising a new complaint (e.g., photos of damage, invoice receipts).`;
  }
  if (promptLower.includes('chief student grievance officer') || promptLower.includes('grievance officer')) {
    return `### Chief Student Grievance Officer
The grievance board is headed by **Dr. R. K. Prasad (Dean of Student Affairs)**. You can email dean.sa@campusone.ai for unresolved escalations.`;
  }
  if (promptLower.includes('reopen a closed complaint') || promptLower.includes('reopen')) {
    return `### Reopening Closed Complaints
If a complaint was resolved unsatisfactorily, you can click the 'Reopen' button on that specific ticket within 48 hours of resolution to escalate it.`;
  }

  // General Matches (Fallbacks if no specific sub-match is caught)
  
  // Attendance general
  if (promptLower.includes('attendance') || promptLower.includes('missed class') || promptLower.includes('low attendance') || promptLower.includes('class recovery') || promptLower.includes('target met')) {
    const currentAttendance = studentContext?.attendancePercentage ?? 74;
    let advice = "";
    if (currentAttendance < 75) {
      advice = `Your attendance is currently **${currentAttendance}%**, which is below the mandatory 75% threshold. I recommend using the **Attendance Calculator** on your dashboard to see how many consecutive classes you need to attend to cross 75%. Would you like me to draft an email request to your faculty for attendance review?`;
    } else {
      advice = `Your current attendance is at a healthy **${currentAttendance}%**. Keep it up to avoid academic warnings!`;
    }
    return `### Attendance Status Alert\n\n${advice}\n\n*Note: If you missed classes due to medical reasons, please submit a medical certificate to the Academic Office and log a complaint under 'Academics' for verification.*`;
  }

  // Study plan general
  if (promptLower.includes('study plan') || promptLower.includes('study schedule') || promptLower.includes('study roadmap') || promptLower.includes('academic calendar')) {
    return `### AI-Generated Study Plan (Next 7 Days)
Based on your courses, here is a custom study plan:

*   **Days 1-2 (Mathematics & Logic):** Focus on Calculus problem sets. Dedicate 2 hours in the evening.
*   **Days 3-4 (Web Architecture):** Review REST APIs and complete your pending assignment.
*   **Days 5-6 (Database Systems):** Practice SQL joins and normalization exercises.
*   **Day 7 (Revision & Quiz):** Review the study materials and attempt mock questions.

*Tip: Spend 45 minutes on highly complex topics and take a 5-minute break (Pomodoro Technique).*`;
  }

  // Scholarship general
  if (promptLower.includes('scholarship') || promptLower.includes('scholarships') || promptLower.includes('financial aid')) {
    return `### Scholarships & Financial Aid\n\n${campusKnowledge.scholarships}`;
  }

  // Fees general
  if (promptLower.includes('fee') || promptLower.includes('fees') || promptLower.includes('payment') || promptLower.includes('finance')) {
    return `### Fee Payment Details\n\n${campusKnowledge.fees}`;
  }

  // Exams general
  if (promptLower.includes('exam') || promptLower.includes('exams') || promptLower.includes('timetable') || promptLower.includes('test') || promptLower.includes('tests')) {
    return `### Examination Info\n\n${campusKnowledge.exams}`;
  }

  // Hostel general
  if (promptLower.includes('hostel') || promptLower.includes('room') || promptLower.includes('mess') || promptLower.includes('block')) {
    return `### Hostel Services\n\n${campusKnowledge.hostel}`;
  }

  // Library general
  if (promptLower.includes('library') || promptLower.includes('book') || promptLower.includes('books') || promptLower.includes('borrow')) {
    return `### Library Policy\n\n${campusKnowledge.library}`;
  }

  // Placement general
  if (promptLower.includes('placement') || promptLower.includes('placements') || promptLower.includes('resume') || promptLower.includes('job') || promptLower.includes('career')) {
    return `### Placements & Career Cell\n\n${campusKnowledge.placements}`;
  }

  // Complaints general
  if (promptLower.includes('complaint') || promptLower.includes('grievance') || promptLower.includes('track') || promptLower.includes('ticket')) {
    return `### Grievance & Complaint Tracking\n\n${campusKnowledge.complaints}`;
  }

  return null;
};

/**
 * Main AI Query Handler using Ollama gemma4:e2b
 */
const queryGlena = async (prompt, history = [], studentContext = null) => {
  // Fast Path: Check for pre-set matching queries to reply instantly
  const instantMatch = getInstantResponse(prompt, studentContext);
  if (instantMatch) {
    console.log(`[Instant Response] Local match found for query: "${prompt}"`);
    return instantMatch;
  }

  const model = process.env.GEMMA_MODEL || 'gemma4:e2b';
  const url = `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`;

  const systemMessage = {
    role: 'system',
    content: `You are Glena, the elite full-stack university assistant.
You possess complete knowledge of the campus directories, hostel guidelines, academic regulations, library timings, fee schedules, and placement notifications.
Your role is to assist students, faculty, and administrators with clear, structured markdown responses.

Current Student Profile Details:
- Name: ${studentContext?.name || 'Guest Student'}
- Roll No: ${studentContext?.rollNo || 'N/A'}
- Department: ${studentContext?.department || 'N/A'}
- Semester: ${studentContext?.semester || 'N/A'}
- Attendance: ${studentContext?.attendancePercentage || 'N/A'}%
- Hostel: Block ${studentContext?.hostelBlock || 'N/A'}, Room ${studentContext?.hostelRoom || 'N/A'}

Provide actionable instructions. Highlight critical numbers and deadlines in bold. Use markdown tables, blockquotes, lists, and headings to structure your answers beautifully.`
  };

  // Build message chain
  const messages = [systemMessage];
  
  // Add conversation history
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
  
  messages.push(...formattedHistory);
  messages.push({ role: 'user', content: prompt });

  try {
    console.log(`Sending prompt to Ollama model '${model}'...`);
    const response = await axios.post(url, {
      model,
      messages,
      stream: false
    }, {
      timeout: 60000 // Increased timeout to support model load and VRAM execution on RTX 3050
    });

    if (response.data && response.data.message) {
      return response.data.message.content;
    }
    
    throw new Error('Invalid response structure from Ollama');
  } catch (error) {
    console.warn(`Ollama Glena API error: ${error.message}. Returning intelligent mock fallback response.`);
    return generateMockResponse(prompt, studentContext);
  }
};

/**
 * Resume Analysis Service using AI
 */
const analyzeResume = async (resumeText, jobDetails) => {
  const prompt = `Analyze this resume and evaluate it against the job criteria.
Job Role: ${jobDetails.role} at ${jobDetails.company}
Job Requirements: ${jobDetails.requirements}

Resume Content:
${resumeText}

Format the response as:
### Resume Match Analysis
- **Overall Match Score:** [0-100]%
- **Strengths:** [List 3-4 key matching skills]
- **Gaps & Improvement Areas:** [List missing skills/requirements]
- **AI Recommendation:** [Actionable steps to improve application]`;

  try {
    return await queryGlena(prompt, [], null);
  } catch (error) {
    // Return mock analysis
    const score = Math.floor(Math.random() * 30) + 65; // 65 - 95
    return `### Resume Match Analysis (Fallback Mode)
- **Overall Match Score:** ${score}%
- **Strengths:**
  * Solid core project experiences matching the tech stack.
  * Strong programming foundations.
  * Clear and structured presentation of achievements.
- **Gaps & Improvement Areas:**
  * Needs more quantifiable achievements (e.g., "improved performance by 20%").
  * Add specific certifications related to ${jobDetails.requirements.split(',')[0] || 'the role'}.
- **AI Recommendation:**
  * Tailor the resume description using keywords directly from the job requirement: "${jobDetails.requirements}".
  * Add a projects section demonstrating experience building scalable web solutions.`;
  }
};

/**
 * Mock Interview Questions Generator
 */
const generateMockQuestions = async (jobDetails) => {
  const prompt = `Generate 5 technical and behavioral interview questions for a candidate applying for the following role:
Company: ${jobDetails.company}
Role: ${jobDetails.role}
Requirements: ${jobDetails.requirements}

Format as a simple JSON array of strings:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

  try {
    const rawResponse = await queryGlena(prompt, [], null);
    // Parse JSON
    try {
      const match = rawResponse.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI interview questions JSON.');
    }
  } catch (err) {
    console.warn('Mock Interview generator failed.');
  }

  // Fallbacks
  return [
    `Can you describe a challenging coding project you built using technologies similar to the requirements for ${jobDetails.company}?`,
    `Explain the difference between SQL and NoSQL databases, and when you would choose one over the other.`,
    `How do you handle asynchronous operations in Node.js, and what are the benefits of async/await?`,
    `Describe a situation where you had a conflict with a team member during a university group project. How did you resolve it?`,
    `What strategies do you use to optimize the performance and responsiveness of a web application?`
  ];
};

module.exports = {
  queryGlena,
  analyzeResume,
  generateMockQuestions
};
