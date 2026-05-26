const { AppError } = require('../middleware/errorHandler');

const callClaude = async (prompt, maxTokens = 500) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AppError('AI service not configured.', 503);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!response.ok) { const e = await response.json(); throw new AppError(e.error?.message || 'AI failed', 502); }
  const data = await response.json();
  return data.content?.map(c => c.text || '').join('') || '';
};

const generateSummary = async (req, res, next) => {
  try {
    const { name, title, experience, skills, targetRole } = req.body;
    if (!title) throw new AppError('Title required.', 400);
    const prompt = `Write a compelling 2-3 sentence ATS-optimized professional resume summary for:
Name: ${name || 'Professional'} | Title: ${title} | Target: ${targetRole || title}
Experience: ${experience?.map(e => `${e.role} at ${e.company}`).join(', ') || 'various roles'}
Skills: ${(skills || []).slice(0, 6).join(', ')}
Return ONLY the summary text, no quotes or labels. 50-80 words, third person, no "I".`;
    const summary = await callClaude(prompt, 200);
    res.json({ summary: summary.trim() });
  } catch (err) { next(err); }
};

const generateBullets = async (req, res, next) => {
  try {
    const { role, company, description } = req.body;
    if (!role) throw new AppError('Role required.', 400);
    const prompt = `Generate 4 strong resume bullet points for: ${role} at ${company || 'a company'}.
Context: ${description || 'general responsibilities'}
Rules: Start each with an action verb, include metrics, ATS-friendly, 15-25 words each.
Format: Return exactly 4 lines starting with •. Nothing else.`;
    const result = await callClaude(prompt, 300);
    const bullets = result.split('\n').map(l => l.trim())
      .filter(l => l.startsWith('•') || l.match(/^[-–*]/))
      .map(l => l.replace(/^[•\-–*]\s*/, '').trim()).filter(Boolean).slice(0, 4);
    res.json({ bullets });
  } catch (err) { next(err); }
};

const suggestSkills = async (req, res, next) => {
  try {
    const { title, existingSkills } = req.body;
    if (!title) throw new AppError('Title required.', 400);
    const prompt = `Suggest 10 relevant skills for a ${title}. Existing: ${(existingSkills||[]).join(', ')}.
Return ONLY a JSON array of 10 strings, no duplicates. Example: ["Python","Docker","AWS"]`;
    const result = await callClaude(prompt, 200);
    const skills = JSON.parse(result.replace(/```json|```/g, '').trim());
    res.json({ skills: Array.isArray(skills) ? skills.slice(0, 10) : [] });
  } catch (err) { next(err); }
};

const atsCheck = async (req, res, next) => {
  try {
    const { resume, jobDescription } = req.body;
    if (!jobDescription) throw new AppError('Job description required.', 400);
    const resumeText = [resume?.personal?.summary, resume?.experience?.map(e => `${e.role} ${e.description}`).join(' '), [...(resume?.skills?.technical||[]), ...(resume?.skills?.soft||[])].join(' ')].filter(Boolean).join(' ');
    const prompt = `ATS analysis of resume vs job description.
Resume: ${resumeText.slice(0, 1200)}
Job: ${jobDescription.slice(0, 800)}
Respond ONLY with JSON: {"score":85,"matchedKeywords":["k1","k2"],"missingKeywords":["k3"],"suggestions":["s1","s2","s3"]}`;
    const result = await callClaude(prompt, 500);
    const analysis = JSON.parse(result.replace(/```json|```/g, '').trim());
    res.json({ analysis });
  } catch (err) { next(err); }
};

const generateCoverLetter = async (req, res, next) => {
  try {
    const { resume, jobTitle, company, jobDescription } = req.body;
    if (!jobTitle || !company) throw new AppError('Job title and company required.', 400);
    const prompt = `Write a 3-paragraph professional cover letter (200-250 words) for:
${resume?.personal?.name || 'Applicant'} applying for ${jobTitle} at ${company}.
Their skills: ${[...(resume?.skills?.technical||[]),...(resume?.skills?.soft||[])].slice(0,5).join(', ')}
Job context: ${jobDescription?.slice(0,400)||'great opportunity'}
Return ONLY the 3 paragraphs, no greeting/signature.`;
    const letter = await callClaude(prompt, 600);
    res.json({ coverLetter: letter.trim() });
  } catch (err) { next(err); }
};

module.exports = { generateSummary, generateBullets, suggestSkills, atsCheck, generateCoverLetter };
