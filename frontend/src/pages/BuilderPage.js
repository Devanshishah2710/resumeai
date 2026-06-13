import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { resumeAPI, aiAPI, pdfAPI } from '../utils/api';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'personal',    label: 'Personal',    icon: '👤' },
  { id: 'experience',  label: 'Experience',  icon: '💼' },
  { id: 'skills',      label: 'Skills',      icon: '⚡' },
  { id: 'education',   label: 'Education',   icon: '🎓' },
  { id: 'projects',    label: 'Projects',    icon: '🚀' },
];

// ─── Design templates (same list as TemplatesPage) ────────────────────────────
const DESIGN_TEMPLATES = [
  { id: 'modern',    name: 'Modern Pro',     color: '#3B82F6', color2: '#8B5CF6' },
  { id: 'executive', name: 'Executive',      color: '#1E293B', color2: '#334155' },
  { id: 'creative',  name: 'Creative Flow',  color: '#EC4899', color2: '#8B5CF6' },
  { id: 'minimal',   name: 'Minimal Clean',  color: '#10B981', color2: '#06B6D4' },
  { id: 'academic',  name: 'Academic',       color: '#F59E0B', color2: '#EF4444' },
  { id: 'startup',   name: 'Startup Hustle', color: '#6366F1', color2: '#EC4899' },
];

// ─── Reusable input ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder = '', rows }) {
  const base = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
  };
  const onFocus = e => {
    e.target.style.borderColor = 'rgba(59,130,246,0.5)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.1)';
  };
  const onBlur = e => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.boxShadow   = 'none';
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#94A3B8', marginBottom: 6 }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} onFocus={onFocus} onBlur={onBlur} style={{ ...base, resize: 'vertical' }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onFocus={onFocus} onBlur={onBlur} style={base} />
      }
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────
function LivePreview({ resume }) {
  const p     = resume.personal || {};
  const color = resume.templateColor || '#3B82F6';
  const allSkills = [
    ...(resume.skills?.technical || []),
    ...(resume.skills?.soft      || []),
    ...(resume.skills?.tools     || []),
  ];

  const sectionLabel = (text) => (
    <div style={{
      fontSize: 8, fontWeight: 700, color, letterSpacing: 1.5,
      textTransform: 'uppercase', marginBottom: 6,
      borderBottom: `1px solid ${color}33`, paddingBottom: 3,
    }}>{text}</div>
  );

  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '24px 22px',
      color: '#1E293B', fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 10, lineHeight: 1.55,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minHeight: 480,
    }}>
      {/* Header */}
      <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px', marginBottom: 2 }}>
          {p.name || 'Your Name'}
        </div>
        {p.title && (
          <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 8.5, color: '#64748B' }}>
          {[p.email, p.phone, p.location, p.linkedin, p.github]
            .filter(Boolean)
            .map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <div style={{ marginBottom: 13 }}>
          {sectionLabel('Summary')}
          <p style={{ fontSize: 9, color: '#475569', lineHeight: 1.6 }}>{p.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div style={{ marginBottom: 13 }}>
          {sectionLabel('Experience')}
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0F172A' }}>{exp.role}</div>
                  <div style={{ fontSize: 8.5, color: '#64748B' }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 8, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
              {exp.description && (
                <p style={{ fontSize: 8.5, color: '#475569', marginTop: 2, lineHeight: 1.5 }}>{exp.description}</p>
              )}
              {exp.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} style={{ fontSize: 8.5, color: '#475569', marginTop: 2, paddingLeft: 8 }}>• {b}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {allSkills.length > 0 && (
        <div style={{ marginBottom: 13 }}>
          {sectionLabel('Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {allSkills.map((s, i) => (
              <span key={i} style={{
                padding: '2px 7px', borderRadius: 3, fontSize: 8, fontWeight: 500,
                background: `${color}15`, color, border: `1px solid ${color}25`,
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div style={{ marginBottom: 13 }}>
          {sectionLabel('Education')}
          {resume.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: '#0F172A' }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                </div>
                <div style={{ fontSize: 8.5, color: '#64748B' }}>{edu.institution}</div>
                {edu.gpa && <div style={{ fontSize: 8, color: '#94A3B8' }}>GPA: {edu.gpa}</div>}
              </div>
              <div style={{ fontSize: 8, color: '#94A3B8', textAlign: 'right' }}>
                {edu.startYear} – {edu.endYear}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <div>
          {sectionLabel('Projects')}
          {resume.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0F172A' }}>{proj.name}</div>
              {proj.description && (
                <p style={{ fontSize: 8.5, color: '#475569', marginTop: 2, lineHeight: 1.5 }}>{proj.description}</p>
              )}
              {proj.technologies?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
                  {proj.technologies.map((t, j) => (
                    <span key={j} style={{ padding: '1px 5px', borderRadius: 2, fontSize: 7.5, background: `${color}15`, color }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Builder Page ─────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const { resumeId }        = useParams();
  const [searchParams]      = useSearchParams();
  const navigate            = useNavigate();
  const location            = useLocation();         // ← detect fromSample flag

  const {
    resume, activeResumeId, isDirty, isSaving,
    setIsSaving, setIsDirty,
    updatePersonal, updateResume, loadResume, resetResume,
    addExperience, updateExperience, removeExperience,
    addEducation,  updateEducation,  removeEducation,
    addSkill,      removeSkill,
    addProject,    updateProject,    removeProject,
  } = useResume();

  const [tab,         setTab]         = useState('personal');
  const [aiLoading,   setAiLoading]   = useState({});
  const [skillInput,  setSkillInput]  = useState('');
  const [skillCat,    setSkillCat]    = useState('technical');
  const [atsJobDesc,  setAtsJobDesc]  = useState('');
  const [atsResult,   setAtsResult]   = useState(null);
  const [showAts,     setShowAts]     = useState(false);
  const saveTimer = useRef(null);

  const fromSample = location.state?.fromSample === true;

  // ── On mount: decide how to initialise ──────────────────────────────────────
  useEffect(() => {
    if (resumeId) {
      // Editing an existing saved resume
      resumeAPI.get(resumeId)
        .then(r => loadResume(r.data.resume))
        .catch(() => { toast.error('Resume not found'); navigate('/dashboard'); });
      return;
    }

    if (fromSample) {
      // Coming from TemplatesPage with sample data already in ResumeContext
      // → do nothing; context is already populated by handleEditSample
      return;
    }

    // Coming from blank design template selection (URL params)
    const tmplId = searchParams.get('template') || 'modern';
    const color  = searchParams.get('color')    || '#3B82F6';
    const tmpl   = DESIGN_TEMPLATES.find(t => t.id === tmplId) || DESIGN_TEMPLATES[0];

    resetResume();
    updateResume({ template: tmpl.id, templateColor: color, title: 'My Resume' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  // ── Autosave ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => handleSave(true), 3000);
    return () => clearTimeout(saveTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, isDirty]);

  // ── Save ──────────────────────────────────────────────────────────────────────
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

  // ── PDF download ──────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!activeResumeId) { toast.error('Save your resume first'); return; }
    try {
      const { data } = await pdfAPI.generate(activeResumeId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${resume.personal?.name || 'resume'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF generation failed');
    }
  };

  // ── AI helpers ────────────────────────────────────────────────────────────────
  const handleAISummary = async () => {
    setAiLoading(p => ({ ...p, summary: true }));
    try {
      const { data } = await aiAPI.generateSummary({
        name:       resume.personal?.name,
        title:      resume.personal?.title,
        experience: resume.experience,
        skills:     [...(resume.skills?.technical || []), ...(resume.skills?.soft || [])],
        targetRole: resume.targetRole,
      });
      updatePersonal('summary', data.summary);
      toast.success('AI summary generated!');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(p => ({ ...p, summary: false }));
    }
  };

  const handleAISkills = async () => {
    setAiLoading(p => ({ ...p, skills: true }));
    try {
      const existing = [...(resume.skills?.technical || []), ...(resume.skills?.soft || [])];
      const { data } = await aiAPI.suggestSkills({ title: resume.personal?.title, existingSkills: existing });
      data.skills.forEach(s => addSkill('technical', s));
      toast.success(`Added ${data.skills.length} AI-suggested skills!`);
    } catch {
      toast.error('AI skills failed');
    } finally {
      setAiLoading(p => ({ ...p, skills: false }));
    }
  };

  const handleAtsCheck = async () => {
    if (!atsJobDesc.trim()) { toast.error('Paste a job description first'); return; }
    setAiLoading(p => ({ ...p, ats: true }));
    try {
      const { data } = await aiAPI.atsCheck({ resume, jobDescription: atsJobDesc });
      setAtsResult(data.analysis);
      toast.success('ATS analysis complete!');
    } catch {
      toast.error('ATS check failed');
    } finally {
      setAiLoading(p => ({ ...p, ats: false }));
    }
  };

  // ── Current template ──────────────────────────────────────────────────────────
  const currentTemplate = DESIGN_TEMPLATES.find(t => t.id === resume.template) || DESIGN_TEMPLATES[0];
  const accentColor     = resume.templateColor || currentTemplate.color;

  // ── Shared styles ─────────────────────────────────────────────────────────────
  const panelStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '80px 16px 40px' }}>

        {/* ── Toolbar ───────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <input
              value={resume.title || ''}
              onChange={e => updateResume({ title: e.target.value })}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22,
                color: '#F1F5F9', width: 'auto', minWidth: 120,
              }}
            />
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              {isSaving
                ? <span style={{ color: '#60A5FA' }}>⟳ Saving…</span>
                : isDirty
                ? <span style={{ color: '#F59E0B' }}>● Unsaved changes</span>
                : <span style={{ color: '#34D399' }}>✓ Saved</span>
              }
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Template switcher */}
            <select
              value={resume.template || 'modern'}
              onChange={e => {
                const t = DESIGN_TEMPLATES.find(x => x.id === e.target.value) || DESIGN_TEMPLATES[0];
                updateResume({ template: t.id, templateColor: t.color });
              }}
              style={{
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8', fontSize: 13, fontFamily: 'inherit',
              }}
            >
              {DESIGN_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Color picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#64748B' }}>Color</label>
              <input
                type="color"
                value={accentColor}
                onChange={e => updateResume({ templateColor: e.target.value })}
                style={{
                  width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)', background: 'none', padding: 2,
                }}
              />
            </div>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="btn-secondary"
              style={{ padding: '9px 20px', fontSize: 13 }}
            >
              {isSaving ? '⟳ Saving…' : '💾 Save'}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: 13 }}
            >
              ⬇ PDF
            </button>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* LEFT — Editor ─────────────────────────────────────────────────── */}
          <div style={panelStyle}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, padding: '13px 6px', border: 'none', cursor: 'pointer',
                    background:   tab === t.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                    color:        tab === t.id ? '#60A5FA'               : '#64748B',
                    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    borderBottom: tab === t.id ? `2px solid ${accentColor}` : '2px solid transparent',
                    transition: 'all .2s', whiteSpace: 'nowrap', minWidth: 72,
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Form body */}
            <div style={{ padding: 24, overflowY: 'auto', maxHeight: '72vh' }}>

              {/* ── PERSONAL ─────────────────────────────────────────────── */}
              {tab === 'personal' && (
                <div>
                  {/* AI Summary */}
                  <div style={{
                    padding: 16, borderRadius: 12, marginBottom: 20,
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA', marginBottom: 10 }}>
                      ✨ AI Summary Generator
                    </div>
                    <button
                      onClick={handleAISummary}
                      disabled={aiLoading.summary}
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', padding: '8px 16px', fontSize: 12, boxShadow: 'none' }}
                    >
                      {aiLoading.summary ? '◌ Generating…' : '✨ Generate with AI'}
                    </button>
                  </div>

                  <Field label="Full Name"           value={resume.personal?.name     || ''} onChange={v => updatePersonal('name',     v)} placeholder="Alex Johnson" />
                  <Field label="Professional Title"  value={resume.personal?.title    || ''} onChange={v => updatePersonal('title',    v)} placeholder="Senior Product Manager" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Email"  value={resume.personal?.email || ''} onChange={v => updatePersonal('email', v)} type="email" placeholder="alex@email.com" />
                    <Field label="Phone"  value={resume.personal?.phone || ''} onChange={v => updatePersonal('phone', v)} placeholder="+1 555 000 1234" />
                  </div>
                  <Field label="Location"  value={resume.personal?.location || ''} onChange={v => updatePersonal('location', v)} placeholder="San Francisco, CA" />
                  <Field label="LinkedIn"  value={resume.personal?.linkedin || ''} onChange={v => updatePersonal('linkedin', v)} placeholder="linkedin.com/in/username" />
                  <Field label="GitHub"    value={resume.personal?.github   || ''} onChange={v => updatePersonal('github',   v)} placeholder="github.com/username" />
                  <Field label="Website"   value={resume.personal?.website  || ''} onChange={v => updatePersonal('website',  v)} placeholder="yourwebsite.com" />
                  <Field label="Target Role (for AI)" value={resume.targetRole || ''} onChange={v => updateResume({ targetRole: v })} placeholder="Used for AI optimization" />
                  <Field label="Professional Summary" value={resume.personal?.summary || ''} onChange={v => updatePersonal('summary', v)} placeholder="Your 2-3 sentence professional summary…" rows={4} />

                  {/* ATS checker */}
                  <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#60A5FA' }}>📊 ATS Score Checker</div>
                      <button onClick={() => setShowAts(p => !p)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}>
                        {showAts ? '▲ Hide' : '▼ Show'}
                      </button>
                    </div>
                    {showAts && (
                      <>
                        <textarea
                          value={atsJobDesc}
                          onChange={e => setAtsJobDesc(e.target.value)}
                          placeholder="Paste the job description here…"
                          rows={4}
                          className="input-field"
                          style={{ resize: 'vertical', marginBottom: 10 }}
                        />
                        <button onClick={handleAtsCheck} disabled={aiLoading.ats} className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>
                          {aiLoading.ats ? '◌ Analyzing…' : '🔍 Analyze'}
                        </button>
                        {atsResult && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                              <div style={{
                                fontSize: 24, fontWeight: 800,
                                color: atsResult.score >= 80 ? '#34D399' : atsResult.score >= 60 ? '#F59E0B' : '#FB7185',
                              }}>{atsResult.score}%</div>
                              <div style={{ fontSize: 13, color: '#94A3B8' }}>ATS Match Score</div>
                            </div>
                            {atsResult.missingKeywords?.length > 0 && (
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: '#FB7185', fontWeight: 600, marginBottom: 4 }}>Missing keywords:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {atsResult.missingKeywords.slice(0, 6).map((k, i) => (
                                    <span key={i} style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, background: 'rgba(244,63,94,0.1)', color: '#FB7185', border: '1px solid rgba(244,63,94,0.2)' }}>{k}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {atsResult.suggestions?.map((s, i) => (
                              <p key={i} style={{ fontSize: 11, color: '#64748B', marginBottom: 3 }}>• {s}</p>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── EXPERIENCE ───────────────────────────────────────────── */}
              {tab === 'experience' && (
                <div>
                  {(resume.experience || []).map((exp, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>Position {i + 1}</div>
                        <button onClick={() => removeExperience(i)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#FB7185', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Remove</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Company"    value={exp.company   || ''} onChange={v => updateExperience(i, { company:   v })} />
                        <Field label="Role/Title" value={exp.role      || ''} onChange={v => updateExperience(i, { role:      v })} />
                        <Field label="Start Date" value={exp.startDate || ''} onChange={v => updateExperience(i, { startDate: v })} placeholder="Jan 2022" />
                        <Field label="End Date"   value={exp.endDate   || ''} onChange={v => updateExperience(i, { endDate:   v })} placeholder="Present" />
                      </div>
                      <Field label="Location"    value={exp.location    || ''} onChange={v => updateExperience(i, { location:    v })} placeholder="San Francisco, CA" />
                      <Field label="Description" value={exp.description || ''} onChange={v => updateExperience(i, { description: v })} rows={3} placeholder="Key responsibilities and achievements…" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <input type="checkbox" checked={exp.current || false} onChange={e => updateExperience(i, { current: e.target.checked })} style={{ cursor: 'pointer' }} />
                        <label style={{ fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Currently working here</label>
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', fontSize: 13 }}>
                    + Add Experience
                  </button>
                </div>
              )}

              {/* ── SKILLS ───────────────────────────────────────────────── */}
              {tab === 'skills' && (
                <div>
                  {/* Category selector */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {['technical', 'soft', 'tools', 'languages'].map(c => (
                      <button
                        key={c}
                        onClick={() => setSkillCat(c)}
                        style={{
                          padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                          background: skillCat === c ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                          color:      skillCat === c ? '#60A5FA'               : '#64748B',
                        }}
                      >{c}</button>
                    ))}
                  </div>

                  <button
                    onClick={handleAISkills}
                    disabled={aiLoading.skills}
                    style={{
                      marginBottom: 16, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)',
                      color: '#A78BFA', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    }}
                  >
                    {aiLoading.skills ? '◌ Generating…' : '✨ AI Suggest Skills'}
                  </button>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {(resume.skills?.[skillCat] || []).map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 100,
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA', fontSize: 13,
                      }}>
                        {s}
                        <button onClick={() => removeSkill(skillCat, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && skillInput.trim()) {
                          addSkill(skillCat, skillInput.trim());
                          setSkillInput('');
                          e.preventDefault();
                        }
                      }}
                      placeholder={`Add ${skillCat} skill…`}
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => { if (skillInput.trim()) { addSkill(skillCat, skillInput.trim()); setSkillInput(''); } }}
                      className="btn-secondary"
                      style={{ padding: '10px 16px' }}
                    >+</button>
                  </div>
                  <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>Press Enter to add</p>
                </div>
              )}

              {/* ── EDUCATION ────────────────────────────────────────────── */}
              {tab === 'education' && (
                <div>
                  {(resume.education || []).map((edu, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Education {i + 1}</div>
                        <button onClick={() => removeEducation(i)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#FB7185', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Remove</button>
                      </div>
                      <Field label="Institution"   value={edu.institution || ''} onChange={v => updateEducation(i, { institution: v })} placeholder="MIT" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Degree"      value={edu.degree    || ''} onChange={v => updateEducation(i, { degree:    v })} placeholder="B.S." />
                        <Field label="Field"       value={edu.field     || ''} onChange={v => updateEducation(i, { field:     v })} placeholder="Computer Science" />
                        <Field label="Start Year"  value={edu.startYear || ''} onChange={v => updateEducation(i, { startYear: v })} placeholder="2017" />
                        <Field label="End Year"    value={edu.endYear   || ''} onChange={v => updateEducation(i, { endYear:   v })} placeholder="2021" />
                      </div>
                      <Field label="GPA (optional)" value={edu.gpa || ''} onChange={v => updateEducation(i, { gpa: v })} placeholder="3.8 / 4.0" />
                    </div>
                  ))}
                  <button onClick={addEducation} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', fontSize: 13 }}>
                    + Add Education
                  </button>
                </div>
              )}

              {/* ── PROJECTS ─────────────────────────────────────────────── */}
              {tab === 'projects' && (
                <div>
                  {(resume.projects || []).map((proj, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 600 }}>Project {i + 1}</div>
                        <button onClick={() => removeProject(i)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#FB7185', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Remove</button>
                      </div>
                      <Field label="Project Name"  value={proj.name        || ''} onChange={v => updateProject(i, { name:        v })} placeholder="My Awesome App" />
                      <Field label="Description"   value={proj.description || ''} onChange={v => updateProject(i, { description: v })} rows={3} placeholder="What did you build?" />
                      <Field label="Live URL"       value={proj.url         || ''} onChange={v => updateProject(i, { url:         v })} placeholder="https://myapp.com" />
                      <Field label="GitHub URL"     value={proj.github      || ''} onChange={v => updateProject(i, { github:      v })} placeholder="https://github.com/…" />
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#94A3B8', marginBottom: 6 }}>Technologies (comma-separated)</label>
                        <input
                          value={(proj.technologies || []).join(', ')}
                          onChange={e => updateProject(i, { technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                          className="input-field"
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={addProject} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', fontSize: 13 }}>
                    + Add Project
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT — Live Preview ──────────────────────────────────────────── */}
          <div style={{
            ...panelStyle,
            border: `1px solid ${accentColor}33`,
            boxShadow: `0 0 40px ${accentColor}0a`,
          }}>
            {/* Preview chrome bar */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#475569' }}>
                  Live Preview — {DESIGN_TEMPLATES.find(t => t.id === resume.template)?.name || 'Modern Pro'}
                </span>
              </div>
              {/* ATS score badge */}
              <div style={{
                fontSize: 11, fontWeight: 600,
                background: 'rgba(52,211,153,0.1)', color: '#34D399',
                padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(52,211,153,0.2)',
              }}>
                ATS: {resume.atsScore ?? '—'}%
              </div>
            </div>

            {/* Preview content — updates live as user types */}
            <div style={{ padding: 20, overflowY: 'auto', maxHeight: '74vh' }}>
              <LivePreview resume={resume} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
