const axios = require('axios');
const { getDBMode } = require('../config/db');

// Action verbs list for rules-based backup/fallback optimization
const ACTION_VERBS = {
  developed: ['engineered', 'architected', 'implemented', 'constructed'],
  helped: ['collaborated with', 'facilitated', 'supported', 'assisted'],
  made: ['formulated', 'crafted', 'designed', 'originated'],
  managed: ['orchestrated', 'spearheaded', 'directed', 'supervised'],
  used: ['leveraged', 'utilized', 'deployed', 'harnessed'],
  created: ['devised', 'pioneered', 'conceived', 'innovated'],
  improved: ['optimized', 'enhanced', 'streamlined', 'amplified'],
  changed: ['refactored', 'revolutionized', 'modified', 'overhauled']
};

// Simple rules-based summary generator in case AI fails
const generateLocalSummary = (name, skills, experiences, targetRole) => {
  const roleStr = targetRole || 'Software Development Engineer';
  const skillsStr = skills && skills.length > 0 ? skills.slice(0, 5).join(', ') : 'full-stack technologies';
  const expStr = experiences && experiences.length > 0 ? `with experience at ${experiences[0].company}` : 'with a strong foundation in academic projects';
  
  return `Highly motivated and detail-oriented ${roleStr} ${expStr}. Proficient in ${skillsStr} with a proven track rate of building scalable applications, optimizing codebase performance, and collaborating in agile environments. Eager to leverage technical expertise to deliver high-impact engineering solutions.`;
};

// Rules-based bullet point optimizer
const optimizeBulletPoints = (text) => {
  if (!text) return '';
  let optimized = text;

  // Replace weak verbs with strong action verbs
  Object.keys(ACTION_VERBS).forEach(weakWord => {
    const regex = new RegExp(`\\b${weakWord}\\b`, 'gi');
    const replacements = ACTION_VERBS[weakWord];
    optimized = optimized.replace(regex, () => {
      const idx = Math.floor(Math.random() * replacements.length);
      return replacements[idx];
    });
  });

  // Inject metrics if none are present
  if (!/\d+%|\d+\s*x|metrics|reduced|increased/i.test(optimized)) {
    const randomMetrics = [
      ', improving application load times by 24%',
      ', reducing redundant API queries by 35%',
      ', resulting in a 15% increase in user engagement',
      ', increasing data processing throughput by 40%',
      ' with 98% test coverage metrics'
    ];
    const metric = randomMetrics[Math.floor(Math.random() * randomMetrics.length)];
    optimized = optimized.trim().replace(/\.?$/, metric + '.');
  }

  return optimized;
};

/**
 * Optimize Resume Details with AI (Ollama Gemma) or fallback
 * Route: POST /api/resume/optimize
 */
const optimizeResume = async (req, res) => {
  const { personalInfo, education, experience, projects, skills, certifications, targetRole } = req.body;

  // Build input text for prompt or fallback
  const skillsArray = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
  const experienceList = Array.isArray(experience) ? experience : [];
  const projectList = Array.isArray(projects) ? projects : [];

  const model = process.env.GEMMA_MODEL || 'gemma4:e2b';
  const url = `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`;

  // System instructions for ATS-friendly formatting
  const prompt = `You are a certified professional resume writer and applicant tracking system (ATS) expert.
Analyze the following student resume details and optimize them for a: "${targetRole || 'Software Development Engineer'}" position.

Resume Info:
- Skills: ${skillsArray.join(', ')}
- Experiences: ${JSON.stringify(experienceList)}
- Projects: ${JSON.stringify(projectList)}

Generate a response strictly formatted as a JSON object with the following structure. Do not output any conversational text or markdown code blocks other than the raw JSON:
{
  "optimizedSummary": "A strong, 3-sentence professional summary starting with active verbs/experience.",
  "optimizedExperience": [
    {
      "company": "Company Name",
      "role": "Role Name",
      "optimizedBullets": [
        "Bullet 1: Rewritten with strong action verbs (spearheaded, engineered, etc.) and quantitative metrics (%, X, etc.)",
        "Bullet 2: Focused on results and business/engineering impact."
      ]
    }
  ],
  "optimizedProjects": [
    {
      "title": "Project Title",
      "optimizedBullets": [
        "Bullet 1: Emphasizing technical stack and performance metrics.",
        "Bullet 2: Detailing problem solved and user/speed improvements."
      ]
    }
  ],
  "suggestedSkills": ["Skill 1", "Skill 2"],
  "atsScore": 85,
  "feedback": [
    "ATS formatting tip 1",
    "ATS content improvement tip 2"
  ]
}`;

  try {
    const response = await axios.post(url, {
      model,
      messages: [
        { role: 'system', content: 'You are an ATS resume writer that returns ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      stream: false,
      options: { temperature: 0.3 }
    }, { timeout: 15000 });

    if (response.data && response.data.message) {
      const content = response.data.message.content.trim();
      // Extract JSON in case LLM wraps it in ```json ... ```
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json(parsed);
      }
    }
    throw new Error('Invalid response structure or parsing issue');
  } catch (error) {
    console.warn('Ollama resume optimization failed or timed out. Running smart rules-based optimizer.');

    // Fallback: Smart local rules-based optimizer
    const optimizedSummary = generateLocalSummary(personalInfo?.name, skillsArray, experienceList, targetRole);
    
    const optimizedExperience = experienceList.map(exp => {
      const bullets = exp.description
        ? exp.description.split('\n').filter(b => b.trim()).map(b => optimizeBulletPoints(b.replace(/^-\s*/, '')))
        : ['Collaborated on software development and optimized code performance.', 'Participated in Scrum sprints and increased test coverage by 25%.'];
      return {
        company: exp.company || 'Tech Company',
        role: exp.role || targetRole || 'Software Intern',
        optimizedBullets: bullets.slice(0, 3)
      };
    });

    const optimizedProjects = projectList.map(proj => {
      const bullets = proj.description
        ? proj.description.split('\n').filter(b => b.trim()).map(b => optimizeBulletPoints(b.replace(/^-\s*/, '')))
        : ['Designed backend architecture using RESTful routing protocols.', 'Integrated database caching increasing throughput by 30%.'];
      return {
        title: proj.title || 'Portfolio Project',
        optimizedBullets: bullets.slice(0, 3)
      };
    });

    // Generate extra recommended skills based on tech stacks
    const suggestedSkillsSet = new Set(['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design', 'Unit Testing (Jest/Mocha)', 'AWS (S3/EC2)']);
    skillsArray.forEach(sk => suggestedSkillsSet.delete(sk));

    // Calculate dynamic simulated ATS score
    let atsScore = 60;
    if (personalInfo?.email && personalInfo?.phone) atsScore += 10;
    if (skillsArray.length > 5) atsScore += 10;
    if (experienceList.length > 0) atsScore += 10;
    if (projectList.length > 0) atsScore += 10;

    res.json({
      optimizedSummary,
      optimizedExperience,
      optimizedProjects,
      suggestedSkills: Array.from(suggestedSkillsSet).slice(0, 4),
      atsScore: Math.min(atsScore, 98),
      feedback: [
        'Use simple single-column formatting. Multi-column resumes often get parsed incorrectly by ATS tools.',
        'Avoid headers, footers, graphics, or tables for key info as they confuse parsers.',
        'Always submit resumes in PDF format unless specified otherwise.',
        'Ensure skills are listed as plain text keywords matching the job description.'
      ]
    });
  }
};

module.exports = {
  optimizeResume
};
