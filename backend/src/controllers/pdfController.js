const Resume = require('../models/Resume');
const { AppError } = require('../middleware/errorHandler');

const generatePDF = async (req, res, next) => {
  let browser = null;
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id, isDeleted: false });
    if (!resume) throw new AppError('Resume not found.', 404);

    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    await page.setContent(buildHTML(resume), { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top:'15mm', right:'12mm', bottom:'15mm', left:'12mm' } });

    await Resume.findByIdAndUpdate(resume._id, { $inc: { downloadCount: 1 }, lastDownloaded: new Date() });
    const filename = `${resume.personal?.name || 'resume'}-${resume.template}.pdf`.replace(/\s+/g,'-').toLowerCase();
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"`, 'Content-Length': pdfBuffer.length });
    res.end(pdfBuffer);
  } catch (err) { next(err); } finally { if (browser) await browser.close(); }
};

const buildHTML = (resume) => {
  const p = resume.personal || {};
  const color = resume.templateColor || '#3B82F6';
  const allSkills = [...(resume.skills?.technical||[]), ...(resume.skills?.soft||[]), ...(resume.skills?.tools||[])];

  const expHTML = (resume.experience||[]).map(e => `<div class="item">
    <div class="row"><div><div class="bold">${e.role||''}</div><div class="sub">${e.company||''}${e.location?` · ${e.location}`:''}</div></div>
    <div class="date">${e.startDate||''} – ${e.current?'Present':(e.endDate||'')}</div></div>
    ${e.description?`<p class="desc">${e.description}</p>`:''}
    ${e.bullets?.length?`<ul>${e.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`:''}
  </div>`).join('');

  const eduHTML = (resume.education||[]).map(e => `<div class="item">
    <div class="row"><div><div class="bold">${e.degree||''}${e.field?` in ${e.field}`:''}</div><div class="sub">${e.institution||''}</div></div>
    <div class="date">${e.startYear||''} – ${e.endYear||''}</div></div>
    ${e.gpa?`<p class="desc">GPA: ${e.gpa}</p>`:''}
  </div>`).join('');

  const projHTML = (resume.projects||[]).map(e => `<div class="item">
    <div class="row"><div class="bold">${e.name||''}</div>${e.url?`<a class="date" href="${e.url}">${e.url}</a>`:''}</div>
    ${e.description?`<p class="desc">${e.description}</p>`:''}
    ${e.technologies?.length?`<div class="tags">${e.technologies.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
  </div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;color:#1E293B;line-height:1.5}
.header{border-left:4px solid ${color};padding-left:16px;margin-bottom:20px}
h1{font-size:22pt;font-weight:700;color:#0F172A;margin-bottom:2px}
.htitle{font-size:11pt;color:${color};font-weight:600;margin-bottom:6px}
.contacts{display:flex;gap:16px;flex-wrap:wrap;font-size:9pt;color:#64748B}
.section{margin-bottom:16px}
.slabel{font-size:8pt;font-weight:700;color:${color};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid ${color}33}
.summary{font-size:10pt;color:#475569;line-height:1.6}
.item{margin-bottom:10px}
.row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px}
.bold{font-size:10.5pt;font-weight:700;color:#0F172A}
.sub{font-size:9.5pt;color:#64748B}
.date{font-size:9pt;color:#94A3B8;white-space:nowrap}
.desc{font-size:9.5pt;color:#475569;margin-top:3px;line-height:1.5}
ul{margin-top:3px;padding-left:16px}li{font-size:9.5pt;color:#475569;margin-bottom:2px}
.tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.tag{font-size:8.5pt;padding:2px 7px;border-radius:3px;background:${color}18;color:${color};border:1px solid ${color}30}
</style></head><body>
<div class="header">
  <h1>${p.name||'Your Name'}</h1>
  ${p.title?`<div class="htitle">${p.title}</div>`:''}
  <div class="contacts">
    ${[p.email,p.phone,p.location,p.linkedin,p.website].filter(Boolean).map(v=>`<span>${v}</span>`).join('')}
  </div>
</div>
${p.summary?`<div class="section"><div class="slabel">Summary</div><p class="summary">${p.summary}</p></div>`:''}
${expHTML?`<div class="section"><div class="slabel">Experience</div>${expHTML}</div>`:''}
${eduHTML?`<div class="section"><div class="slabel">Education</div>${eduHTML}</div>`:''}
${allSkills.length?`<div class="section"><div class="slabel">Skills</div><div class="tags">${allSkills.map(s=>`<span class="tag">${s}</span>`).join('')}</div></div>`:''}
${projHTML?`<div class="section"><div class="slabel">Projects</div>${projHTML}</div>`:''}
</body></html>`;
};

module.exports = { generatePDF };
