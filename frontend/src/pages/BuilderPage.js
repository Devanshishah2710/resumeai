import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { resumeAPI, aiAPI, pdfAPI } from '../utils/api';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

const TABS = [
  { id:'personal', label:'Personal', icon:'👤' },
  { id:'experience', label:'Experience', icon:'💼' },
  { id:'skills', label:'Skills', icon:'⚡' },
  { id:'education', label:'Education', icon:'🎓' },
  { id:'projects', label:'Projects', icon:'🚀' },
];

const TEMPLATES = [
  { id:'modern', name:'Modern Pro', color:'#3B82F6', color2:'#8B5CF6' },
  { id:'executive', name:'Executive', color:'#6366F1', color2:'#EC4899' },
  { id:'creative', name:'Creative Flow', color:'#EC4899', color2:'#8B5CF6' },
  { id:'minimal', name:'Minimal Clean', color:'#10B981', color2:'#06B6D4' },
  { id:'academic', name:'Academic', color:'#F59E0B', color2:'#EF4444' },
  { id:'startup', name:'Startup Hustle', color:'#6366F1', color2:'#EC4899' },
];

function InputField({ label, value, onChange, type='text', placeholder='', multiline=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label className="label">{label}</label>}
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} className="input-field" style={{ resize:'vertical' }}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input-field"/>
      }
    </div>
  );
}

function LivePreview({ resume }) {
  const p = resume.personal || {};
  const color = resume.templateColor || '#3B82F6';
  const allSkills = [...(resume.skills?.technical||[]),...(resume.skills?.soft||[]),...(resume.skills?.tools||[])];

  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'28px', color:'#1E293B', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:10, lineHeight:1.5, boxShadow:'0 10px 40px rgba(0,0,0,0.5)', minHeight:500 }}>
      {/* Header */}
      <div style={{ borderLeft:`4px solid ${color}`, paddingLeft:14, marginBottom:18 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#0F172A', fontFamily:'Syne,sans-serif', letterSpacing:'-0.5px', marginBottom:2 }}>{p.name||'Your Name'}</div>
        {p.title && <div style={{ fontSize:11, color:color, fontWeight:600, marginBottom:5 }}>{p.title}</div>}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:9, color:'#64748B' }}>
          {[p.email,p.phone,p.location,p.linkedin].filter(Boolean).map((v,i)=><span key={i}>{v}</span>)}
        </div>
      </div>

      {p.summary && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, fontWeight:700, color:color, letterSpacing:1.5, marginBottom:5, borderBottom:`1px solid ${color}33`, paddingBottom:3 }}>SUMMARY</div>
          <p style={{ fontSize:9.5, color:'#475569', lineHeight:1.6 }}>{p.summary}</p>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, fontWeight:700, color:color, letterSpacing:1.5, marginBottom:8, borderBottom:`1px solid ${color}33`, paddingBottom:3 }}>EXPERIENCE</div>
          {resume.experience.map((e,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#0F172A' }}>{e.role}</div>
                  <div style={{ fontSize:9, color:'#64748B' }}>{e.company}{e.location?` · ${e.location}`:''}</div>
                </div>
                <div style={{ fontSize:9, color:'#94A3B8', whiteSpace:'nowrap' }}>{e.startDate} – {e.current?'Present':e.endDate}</div>
              </div>
              {e.description && <p style={{ fontSize:9, color:'#475569', marginTop:3, lineHeight:1.5 }}>{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {allSkills.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, fontWeight:700, color:color, letterSpacing:1.5, marginBottom:7, borderBottom:`1px solid ${color}33`, paddingBottom:3 }}>SKILLS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {allSkills.map((s,i) => <span key={i} style={{ padding:'2px 7px', borderRadius:3, fontSize:8.5, fontWeight:500, background:`${color}15`, color:color, border:`1px solid ${color}25` }}>{s}</span>)}
          </div>
        </div>
      )}

      {resume.education?.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:8, fontWeight:700, color:color, letterSpacing:1.5, marginBottom:7, borderBottom:`1px solid ${color}33`, paddingBottom:3 }}>EDUCATION</div>
          {resume.education.map((e,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'#0F172A' }}>{e.degree}{e.field?` in ${e.field}`:''}</div>
                <div style={{ fontSize:9, color:'#64748B' }}>{e.institution}</div>
              </div>
              <div style={{ fontSize:9, color:'#94A3B8' }}>{e.startYear} – {e.endYear}</div>
            </div>
          ))}
        </div>
      )}

      {resume.projects?.length > 0 && (
        <div>
          <div style={{ fontSize:8, fontWeight:700, color:color, letterSpacing:1.5, marginBottom:7, borderBottom:`1px solid ${color}33`, paddingBottom:3 }}>PROJECTS</div>
          {resume.projects.map((e,i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#0F172A', marginBottom:2 }}>{e.name}</div>
              {e.description && <p style={{ fontSize:9, color:'#475569', lineHeight:1.5 }}>{e.description}</p>}
              {e.technologies?.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:3 }}>{e.technologies.map((t,j)=><span key={j} style={{ padding:'1px 5px', borderRadius:2, fontSize:8, background:`${color}15`, color:color }}>{t}</span>)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  const { resumeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resume, activeResumeId, isDirty, isSaving, setIsSaving, setIsDirty,
    updatePersonal, updateResume, loadResume, resetResume,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    addSkill, removeSkill,
    addProject, updateProject, removeProject,
  } = useResume();

  const [tab, setTab] = useState('personal');
  const [aiLoading, setAiLoading] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [skillCat, setSkillCat] = useState('technical');
  const [atsJobDesc, setAtsJobDesc] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [showAts, setShowAts] = useState(false);
  const saveTimer = useRef(null);

  // Load existing resume or init template
  useEffect(() => {
    if (resumeId) {
      resumeAPI.get(resumeId).then(r => loadResume(r.data.resume)).catch(() => { toast.error('Resume not found'); navigate('/dashboard'); });
    } else {
      const tmpl = searchParams.get('template') || 'modern';
      const color = searchParams.get('color') || '#3B82F6';
      const t = TEMPLATES.find(t=>t.id===tmpl) || TEMPLATES[0];
      resetResume();
      updateResume({ template: t.id, templateColor: color, title: 'My Resume' });
    }
  }, [resumeId]);

  // Autosave on change
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => handleSave(true), 3000);
    return () => clearTimeout(saveTimer.current);
  }, [resume, isDirty]);

  const handleSave = async (auto = false) => {
    setIsSaving(true);
    try {
      if (activeResumeId) {
        await resumeAPI.update(activeResumeId, resume);
      } else {
        const { data } = await resumeAPI.create(resume);
        loadResume(data.resume);
        navigate(`/builder/${data.resume._id}`, { replace: true });
      }
      setIsDirty(false);
      if (!auto) toast.success('Resume saved ✓');
    } catch (err) {
      if (!auto) toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!activeResumeId) { toast.error('Save resume first'); return; }
    try {
      const { data } = await pdfAPI.generate(activeResumeId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a'); a.href=url; a.download=`${resume.personal?.name||'resume'}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  const handleAISummary = async () => {
    setAiLoading(p=>({...p,summary:true}));
    try {
      const { data } = await aiAPI.generateSummary({ name:resume.personal?.name, title:resume.personal?.title, experience:resume.experience, skills:[...(resume.skills?.technical||[]),...(resume.skills?.soft||[])], targetRole:resume.targetRole });
      updatePersonal('summary', data.summary);
      toast.success('AI summary generated!');
    } catch { toast.error('AI generation failed'); }
    finally { setAiLoading(p=>({...p,summary:false})); }
  };

  const handleAISkills = async () => {
    setAiLoading(p=>({...p,skills:true}));
    try {
      const existing = [...(resume.skills?.technical||[]),...(resume.skills?.soft||[])];
      const { data } = await aiAPI.suggestSkills({ title:resume.personal?.title, existingSkills:existing });
      data.skills.forEach(s => addSkill('technical', s));
      toast.success(`Added ${data.skills.length} AI-suggested skills!`);
    } catch { toast.error('AI skills failed'); }
    finally { setAiLoading(p=>({...p,skills:false})); }
  };

  const handleAtsCheck = async () => {
    if (!atsJobDesc.trim()) { toast.error('Paste a job description first'); return; }
    setAiLoading(p=>({...p,ats:true}));
    try {
      const { data } = await aiAPI.atsCheck({ resume, jobDescription:atsJobDesc });
      setAtsResult(data.analysis);
      toast.success('ATS analysis complete!');
    } catch { toast.error('ATS check failed'); }
    finally { setAiLoading(p=>({...p,ats:false})); }
  };

  const currentTemplate = TEMPLATES.find(t=>t.id===resume.template) || TEMPLATES[0];

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:1300, margin:'0 auto', padding:'80px 16px 40px' }}>
        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <input value={resume.title} onChange={e=>updateResume({title:e.target.value})} style={{ background:'transparent', border:'none', outline:'none', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:22, color:'#F1F5F9', width:'auto', minWidth:100 }}/>
            <div style={{ fontSize:13, color:'#64748B', marginTop:2 }}>
              {isSaving ? <span style={{ color:'#60A5FA' }}>⟳ Saving...</span> : isDirty ? <span style={{ color:'#F59E0B' }}>● Unsaved</span> : <span style={{ color:'#34D399' }}>✓ Saved</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            {/* Template switcher */}
            <select value={resume.template} onChange={e=>{const t=TEMPLATES.find(x=>x.id===e.target.value)||TEMPLATES[0];updateResume({template:t.id,templateColor:t.color});}} style={{ padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', fontSize:13, fontFamily:'inherit', cursor:'pointer' }}>
              {TEMPLATES.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={()=>handleSave(false)} disabled={isSaving} className="btn-secondary" style={{ padding:'9px 20px', fontSize:13 }}>
              {isSaving ? '⟳ Saving...' : '💾 Save'}
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding:'9px 20px', fontSize:13 }}>⬇ PDF</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* LEFT: Editor */}
          <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:20, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', overflowX:'auto' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:'13px 6px', border:'none', cursor:'pointer', background: tab===t.id?'rgba(59,130,246,0.1)':'transparent', color: tab===t.id?'#60A5FA':'#64748B', fontSize:12, fontWeight:600, fontFamily:'inherit', borderBottom: tab===t.id?'2px solid #3B82F6':'2px solid transparent', transition:'all .2s', whiteSpace:'nowrap', minWidth:80 }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding:24, overflowY:'auto', maxHeight:'72vh' }}>
              {/* PERSONAL */}
              {tab === 'personal' && (
                <div>
                  {/* AI Summary */}
                  <div style={{ padding:16, borderRadius:12, background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#A78BFA', marginBottom:10 }}>✨ AI Summary Generator</div>
                    <button onClick={handleAISummary} disabled={aiLoading.summary} className="btn-primary" style={{ background:'linear-gradient(135deg,#8B5CF6,#6366F1)', padding:'8px 16px', fontSize:12, boxShadow:'none' }}>
                      {aiLoading.summary ? '◌ Generating...' : '✨ Generate with AI'}
                    </button>
                  </div>

                  <InputField label="Full Name" value={resume.personal?.name||''} onChange={v=>updatePersonal('name',v)} placeholder="Alex Johnson"/>
                  <InputField label="Professional Title" value={resume.personal?.title||''} onChange={v=>updatePersonal('title',v)} placeholder="Senior Product Manager"/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <InputField label="Email" value={resume.personal?.email||''} onChange={v=>updatePersonal('email',v)} type="email" placeholder="alex@email.com"/>
                    <InputField label="Phone" value={resume.personal?.phone||''} onChange={v=>updatePersonal('phone',v)} placeholder="+1 555 000 1234"/>
                  </div>
                  <InputField label="Location" value={resume.personal?.location||''} onChange={v=>updatePersonal('location',v)} placeholder="San Francisco, CA"/>
                  <InputField label="LinkedIn" value={resume.personal?.linkedin||''} onChange={v=>updatePersonal('linkedin',v)} placeholder="linkedin.com/in/username"/>
                  <InputField label="GitHub" value={resume.personal?.github||''} onChange={v=>updatePersonal('github',v)} placeholder="github.com/username"/>
                  <InputField label="Website" value={resume.personal?.website||''} onChange={v=>updatePersonal('website',v)} placeholder="yourwebsite.com"/>
                  <InputField label="Target Role" value={resume.targetRole||''} onChange={v=>updateResume({targetRole:v})} placeholder="Used for AI optimization"/>
                  <InputField label="Professional Summary" value={resume.personal?.summary||''} onChange={v=>updatePersonal('summary',v)} multiline placeholder="Your 2-3 sentence professional summary..."/>

                  {/* ATS Check */}
                  <div style={{ marginTop:20, padding:16, borderRadius:12, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#60A5FA' }}>📊 ATS Score Checker</div>
                      <button onClick={()=>setShowAts(p=>!p)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:12 }}>{showAts?'▲ Hide':'▼ Show'}</button>
                    </div>
                    {showAts && (
                      <div>
                        <textarea value={atsJobDesc} onChange={e=>setAtsJobDesc(e.target.value)} placeholder="Paste the job description here..." rows={4} className="input-field" style={{ resize:'vertical', marginBottom:10 }}/>
                        <button onClick={handleAtsCheck} disabled={aiLoading.ats} className="btn-primary" style={{ fontSize:12, padding:'8px 16px', marginBottom:atsResult?12:0 }}>
                          {aiLoading.ats ? '◌ Analyzing...' : '🔍 Analyze'}
                        </button>
                        {atsResult && (
                          <div style={{ marginTop:12 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                              <div style={{ fontSize:24, fontWeight:800, color: atsResult.score>=80?'#34D399':atsResult.score>=60?'#F59E0B':'#FB7185' }}>{atsResult.score}%</div>
                              <div style={{ fontSize:13, color:'#94A3B8' }}>ATS Match Score</div>
                            </div>
                            {atsResult.missingKeywords?.length > 0 && (
                              <div style={{ marginBottom:8 }}>
                                <div style={{ fontSize:11, color:'#FB7185', fontWeight:600, marginBottom:4 }}>Missing keywords:</div>
                                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                                  {atsResult.missingKeywords.slice(0,6).map((k,i)=><span key={i} style={{ padding:'2px 8px', borderRadius:100, fontSize:11, background:'rgba(244,63,94,0.1)', color:'#FB7185', border:'1px solid rgba(244,63,94,0.2)' }}>{k}</span>)}
                                </div>
                              </div>
                            )}
                            {atsResult.suggestions?.length > 0 && (
                              <div>
                                <div style={{ fontSize:11, color:'#34D399', fontWeight:600, marginBottom:4 }}>Suggestions:</div>
                                {atsResult.suggestions.map((s,i)=><p key={i} style={{ fontSize:11, color:'#64748B', marginBottom:3 }}>• {s}</p>)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {tab === 'experience' && (
                <div>
                  {resume.experience?.map((exp,i) => (
                    <div key={i} style={{ padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                        <div style={{ fontSize:12, color:'#3B82F6', fontWeight:600 }}>Position {i+1}</div>
                        <button onClick={()=>removeExperience(i)} style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.2)', color:'#FB7185', borderRadius:6, padding:'3px 10px', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>Remove</button>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <InputField label="Company" value={exp.company||''} onChange={v=>updateExperience(i,{company:v})}/>
                        <InputField label="Role / Title" value={exp.role||''} onChange={v=>updateExperience(i,{role:v})}/>
                        <InputField label="Start Date" value={exp.startDate||''} onChange={v=>updateExperience(i,{startDate:v})} placeholder="Jan 2022"/>
                        <InputField label="End Date" value={exp.endDate||''} onChange={v=>updateExperience(i,{endDate:v})} placeholder="Present"/>
                      </div>
                      <InputField label="Location" value={exp.location||''} onChange={v=>updateExperience(i,{location:v})} placeholder="San Francisco, CA"/>
                      <InputField label="Description" value={exp.description||''} onChange={v=>updateExperience(i,{description:v})} multiline placeholder="Describe your responsibilities and achievements..."/>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <input type="checkbox" checked={exp.current||false} onChange={e=>updateExperience(i,{current:e.target.checked})} style={{ cursor:'pointer' }}/>
                        <label style={{ fontSize:13, color:'#64748B', cursor:'pointer' }}>Currently working here</label>
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience} className="btn-secondary" style={{ width:'100%', justifyContent:'center', borderStyle:'dashed', fontSize:13 }}>+ Add Experience</button>
                </div>
              )}

              {/* SKILLS */}
              {tab === 'skills' && (
                <div>
                  <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                    {['technical','soft','tools','languages'].map(c=>(
                      <button key={c} onClick={()=>setSkillCat(c)} style={{ padding:'6px 14px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600, background: skillCat===c?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.05)', color: skillCat===c?'#60A5FA':'#64748B', textTransform:'capitalize' }}>{c}</button>
                    ))}
                  </div>

                  {/* AI suggest */}
                  <button onClick={handleAISkills} disabled={aiLoading.skills} style={{ marginBottom:16, padding:'8px 16px', borderRadius:8, border:'1px solid rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.08)', color:'#A78BFA', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit' }}>
                    {aiLoading.skills ? '◌ Generating...' : '✨ AI Suggest Skills'}
                  </button>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                    {(resume.skills?.[skillCat]||[]).map((s,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:100, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#60A5FA', fontSize:13 }}>
                        {s}
                        <button onClick={()=>removeSkill(skillCat,i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:14, lineHeight:1, padding:0 }}>×</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', gap:8 }}>
                    <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&skillInput.trim()){addSkill(skillCat,skillInput.trim());setSkillInput('');e.preventDefault();}}} placeholder={`Add ${skillCat} skill...`} className="input-field" style={{ flex:1 }}/>
                    <button onClick={()=>{if(skillInput.trim()){addSkill(skillCat,skillInput.trim());setSkillInput('');}}} className="btn-secondary" style={{ padding:'10px 16px' }}>+</button>
                  </div>
                  <p style={{ fontSize:12, color:'#475569', marginTop:6 }}>Press Enter to add</p>
                </div>
              )}

              {/* EDUCATION */}
              {tab === 'education' && (
                <div>
                  {resume.education?.map((edu,i) => (
                    <div key={i} style={{ padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                        <div style={{ fontSize:12, color:'#10B981', fontWeight:600 }}>Education {i+1}</div>
                        <button onClick={()=>removeEducation(i)} className="btn-danger" style={{ padding:'3px 10px', fontSize:12 }}>Remove</button>
                      </div>
                      <InputField label="Institution" value={edu.institution||''} onChange={v=>updateEducation(i,{institution:v})} placeholder="MIT"/>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <InputField label="Degree" value={edu.degree||''} onChange={v=>updateEducation(i,{degree:v})} placeholder="B.S. Computer Science"/>
                        <InputField label="Field of Study" value={edu.field||''} onChange={v=>updateEducation(i,{field:v})} placeholder="Computer Science"/>
                        <InputField label="Start Year" value={edu.startYear||''} onChange={v=>updateEducation(i,{startYear:v})} placeholder="2017"/>
                        <InputField label="End Year" value={edu.endYear||''} onChange={v=>updateEducation(i,{endYear:v})} placeholder="2021"/>
                      </div>
                      <InputField label="GPA (optional)" value={edu.gpa||''} onChange={v=>updateEducation(i,{gpa:v})} placeholder="3.8 / 4.0"/>
                    </div>
                  ))}
                  <button onClick={addEducation} className="btn-secondary" style={{ width:'100%', justifyContent:'center', borderStyle:'dashed', fontSize:13 }}>+ Add Education</button>
                </div>
              )}

              {/* PROJECTS */}
              {tab === 'projects' && (
                <div>
                  {resume.projects?.map((proj,i) => (
                    <div key={i} style={{ padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                        <div style={{ fontSize:12, color:'#8B5CF6', fontWeight:600 }}>Project {i+1}</div>
                        <button onClick={()=>removeProject(i)} className="btn-danger" style={{ padding:'3px 10px', fontSize:12 }}>Remove</button>
                      </div>
                      <InputField label="Project Name" value={proj.name||''} onChange={v=>updateProject(i,{name:v})} placeholder="My Awesome App"/>
                      <InputField label="Description" value={proj.description||''} onChange={v=>updateProject(i,{description:v})} multiline placeholder="What did you build? What problem did it solve?"/>
                      <InputField label="Live URL" value={proj.url||''} onChange={v=>updateProject(i,{url:v})} placeholder="https://myapp.com"/>
                      <InputField label="GitHub URL" value={proj.github||''} onChange={v=>updateProject(i,{github:v})} placeholder="https://github.com/..."/>
                      <div>
                        <label className="label">Technologies (comma-separated)</label>
                        <input value={(proj.technologies||[]).join(', ')} onChange={e=>updateProject(i,{technologies:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})} className="input-field" placeholder="React, Node.js, MongoDB"/>
                      </div>
                    </div>
                  ))}
                  <button onClick={addProject} className="btn-secondary" style={{ width:'100%', justifyContent:'center', borderStyle:'dashed', fontSize:13 }}>+ Add Project</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:20, border:`1px solid ${currentTemplate.color}33`, overflow:'hidden', boxShadow:`0 0 40px ${currentTemplate.color}0a` }}>
            <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ display:'flex', gap:6 }}>{['#FF5F57','#FFBD2E','#28CA41'].map(c=><div key={c} style={{ width:10,height:10,borderRadius:'50%',background:c }}/>)}</div>
                <span style={{ fontSize:12, color:'#475569' }}>Live Preview — {currentTemplate.name}</span>
              </div>
              <div style={{ fontSize:11, color:'#334155', background:'rgba(52,211,153,0.1)', padding:'3px 10px', borderRadius:100, border:'1px solid rgba(52,211,153,0.2)', color:'#34D399', fontWeight:600 }}>
                ATS: {resume.atsScore || '—'}%
              </div>
            </div>
            <div style={{ padding:20, overflowY:'auto', maxHeight:'72vh' }}>
              <LivePreview resume={resume}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
