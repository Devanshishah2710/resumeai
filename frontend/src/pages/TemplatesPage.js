import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';
import {
  SAMPLES,
  SAMPLE_CATEGORIES,
  CATEGORY_COLORS,
  getPdfUrl,
} from '../utils/sampleData';

// ─── Constants ────────────────────────────────────────────────────────────────
const DESIGN_TEMPLATES = [
  { id: 'modern',    name: 'Modern Pro',     color: '#3B82F6', color2: '#8B5CF6', category: 'Tech',     atsScore: 98, tag: 'Most Popular' },
  { id: 'executive', name: 'Executive',      color: '#1E293B', color2: '#334155', category: 'Business', atsScore: 95, tag: 'Premium'      },
  { id: 'creative',  name: 'Creative Flow',  color: '#EC4899', color2: '#8B5CF6', category: 'Design',   atsScore: 87, tag: 'New'          },
  { id: 'minimal',   name: 'Minimal Clean',  color: '#10B981', color2: '#06B6D4', category: 'All',      atsScore: 96, tag: 'Trending'     },
  { id: 'academic',  name: 'Academic',       color: '#F59E0B', color2: '#EF4444', category: 'Research', atsScore: 94, tag: ''             },
  { id: 'startup',   name: 'Startup Hustle', color: '#6366F1', color2: '#EC4899', category: 'Tech',     atsScore: 91, tag: ''             },
];

const TABS = [
  { id: 'samples',   label: '📄 Resume Samples',   desc: '25 real-world examples — preview & edit' },
  { id: 'templates', label: '🎨 Design Templates',  desc: 'Start from a blank visual layout'        },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────
function FilterPills({ options, active, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
      {options.map(o => {
        const isActive = active === (o.id ?? o);
        return (
          <button
            key={o.id ?? o}
            onClick={() => onSelect(o.id ?? o)}
            style={{
              padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              background: isActive ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'rgba(255,255,255,0.04)',
              color: isActive ? '#fff' : '#64748B',
              border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all .2s',
            }}
          >
            {o.icon ? `${o.icon} ` : ''}{o.label ?? o}
          </button>
        );
      })}
    </div>
  );
}

// ─── Design Template Card ─────────────────────────────────────────────────────
function DesignCard({ t, onSelect }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const onMouseMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = '';
    setHovered(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={() => setHovered(true)}
      style={{
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? t.color + '66' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all .3s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered ? `0 20px 60px ${t.color}22` : '0 4px 20px rgba(0,0,0,0.3)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Preview mockup */}
      <div style={{ height: 200, background: `linear-gradient(135deg,${t.color}22,${t.color2}33)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 130, height: 170, borderRadius: 8,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)', padding: 12,
          display: 'flex', flexDirection: 'column', gap: 6,
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          transform: hovered ? 'scale(1.05) rotateZ(-1deg)' : 'scale(1)',
          transition: 'transform .3s ease',
        }}>
          <div style={{ height: 6, borderRadius: 3, background: `linear-gradient(90deg,${t.color},${t.color2})` }} />
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', width: '60%' }} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '3px 0' }} />
          {[65, 80, 55, 70, 60, 75].map((w, i) => (
            <div key={i} style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.08)', width: `${w}%` }} />
          ))}
        </div>
        {t.tag && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700,
            background: t.tag === 'Most Popular' ? 'rgba(59,130,246,0.3)' : t.tag === 'New' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)',
            color: t.tag === 'Most Popular' ? '#60A5FA' : t.tag === 'New' ? '#34D399' : '#A78BFA',
            border: `1px solid ${t.tag === 'Most Popular' ? '#3B82F6' : t.tag === 'New' ? '#10B981' : '#8B5CF6'}44`,
          }}>{t.tag}</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{t.category}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>{t.atsScore}% ATS</div>
            <div style={{ fontSize: 10, color: '#475569' }}>Score</div>
          </div>
        </div>
        <button
          onClick={() => onSelect(t)}
          style={{
            width: '100%', padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: hovered ? `linear-gradient(135deg,${t.color},${t.color2})` : 'rgba(255,255,255,0.06)',
            color: hovered ? '#fff' : '#94A3B8',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            transition: 'all .3s ease',
            boxShadow: hovered ? `0 8px 20px ${t.color}44` : 'none',
          }}
        >
          {hovered ? 'Start with This Template →' : 'Select Template'}
        </button>
      </div>
    </div>
  );
}

// ─── Sample Card ──────────────────────────────────────────────────────────────
function SampleCard({ sample, onPreview, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const color = CATEGORY_COLORS[sample.category] || '#3B82F6';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '55' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all .3s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 16px 40px ${color}18` : 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 170, background: `linear-gradient(135deg,${color}18,${color}08)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Simulated resume sheet */}
        <div style={{
          width: 108, height: 148, background: '#fff', borderRadius: 6,
          boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.5)` : '0 6px 20px rgba(0,0,0,0.4)',
          padding: '10px 10px 8px',
          display: 'flex', flexDirection: 'column', gap: 4,
          transition: 'box-shadow .3s ease',
        }}>
          <div style={{ height: 5, borderRadius: 3, background: color, marginBottom: 2 }} />
          <div style={{ height: 3, borderRadius: 2, background: '#e2e8f0', width: '70%' }} />
          <div style={{ height: 2, borderRadius: 1, background: '#f1f5f9', width: '50%' }} />
          <div style={{ height: 1, background: '#e2e8f0', margin: '3px 0' }} />
          {[75, 90, 60, 82, 55, 78, 48, 65].map((w, i) => (
            <div key={i} style={{ height: 2, borderRadius: 1, background: i % 4 === 0 ? '#cbd5e1' : '#f1f5f9', width: `${w}%` }} />
          ))}
          <div style={{ height: 1, background: '#e2e8f0', margin: '2px 0' }} />
          <div style={{ height: 2, borderRadius: 1, background: color, width: '45%', opacity: 0.4 }} />
        </div>

        {/* Level badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 700,
          background: `${color}25`, color, border: `1px solid ${color}44`,
        }}>
          {sample.level}
        </div>

        {/* ATS badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 700,
          background: 'rgba(52,211,153,0.15)', color: '#34D399',
          border: '1px solid rgba(52,211,153,0.3)',
        }}>
          ATS {sample.ats}%
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '13px 16px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: '#F1F5F9' }}>{sample.name}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14, lineHeight: 1.4 }}>{sample.title}</div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Preview */}
          <button
            onClick={() => onPreview(sample)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.1)',
              background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              color: '#94A3B8', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
            }}
          >
            👁 Preview
          </button>

          {/* Use & Edit */}
          <button
            onClick={() => onEdit(sample)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
              background: hovered
                ? `linear-gradient(135deg,${color},${color}cc)`
                : `linear-gradient(135deg,${color}bb,${color}88)`,
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
              boxShadow: hovered ? `0 4px 15px ${color}44` : 'none',
            }}
          >
            ✏️ Use & Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────
function PDFModal({ sample, onClose, onEdit }) {
  const color = CATEGORY_COLORS[sample.category] || '#3B82F6';

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 920, height: '90vh',
          background: '#0D1525', borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${color}22`, border: `1px solid ${color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>📄</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#F1F5F9' }}>{sample.name}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {sample.title} ·{' '}
                <span style={{ color, textTransform: 'capitalize' }}>{sample.level}</span>
                {' · '}ATS {sample.ats}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => { onEdit(sample); onClose(); }}
              className="btn-primary"
              style={{ padding: '9px 22px', fontSize: 13 }}
            >
              ✏️ Use & Edit This Resume
            </button>
            <a
              href={getPdfUrl(sample.filename)}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '9px 18px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#94A3B8', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              ⬇ Download
            </a>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#64748B', fontSize: 16, fontFamily: 'inherit',
              }}
            >✕</button>
          </div>
        </div>

        {/* PDF iframe */}
        <iframe
          src={getPdfUrl(sample.filename)}
          style={{ flex: 1, border: 'none', background: '#fff' }}
          title={`${sample.name} Resume Preview`}
        />
      </div>
    </div>
  );
}

// ─── Main TemplatesPage ───────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('samples');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [designFilter, setDesignFilter] = useState('All');
  const [previewSample, setPreviewSample] = useState(null);

  const { isAuthenticated } = useAuth();
  const { loadResume } = useResume();
  const navigate = useNavigate();

  // Filtered data
  const filteredSamples = categoryFilter === 'all'
    ? SAMPLES
    : SAMPLES.filter(s => s.category === categoryFilter);

  const filteredDesigns = designFilter === 'All'
    ? DESIGN_TEMPLATES
    : DESIGN_TEMPLATES.filter(t => t.category === designFilter || t.category === 'All');

  // ── Handlers ────────────────────────────────────────────────────────────────
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return false;
    }
    return true;
  };

  // Load sample data into ResumeContext then open builder
  // Pass { fromSample: true } via location.state so builder knows
  // to use context data instead of resetting or reading URL params
  const handleEditSample = (sample) => {
    if (!requireAuth()) return;
    loadResume({
      ...sample.resumeData,
      // ensure template color from the sample is applied to live preview
      template:      sample.resumeData.template      || 'modern',
      templateColor: sample.resumeData.templateColor || '#3B82F6',
    });
    toast.success(`✏️ "${sample.name}" loaded — start editing!`, { duration: 3000 });
    navigate('/builder', { state: { fromSample: true } });
  };

  // Start blank from design template (unchanged)
  const handleSelectDesign = (template) => {
    if (!requireAuth()) return;
    navigate(`/builder?template=${template.id}&color=${encodeURIComponent(template.color)}`);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.1, marginBottom: 14,
          }}>
            Templates &{' '}
            <span className="gradient-text">Sample Resumes</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
            Browse 25 professionally crafted sample resumes or start from a blank design template — then make it your own.
          </p>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          marginBottom: 48, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
          padding: 6, width: 'fit-content', margin: '0 auto 48px',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '11px 28px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)'
                  : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748B',
                transition: 'all .2s',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(59,130,246,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SAMPLES TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'samples' && (
          <>
            {/* Info banner */}
            <div style={{
              padding: '13px 20px', borderRadius: 12, marginBottom: 36,
              background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                Click <strong style={{ color: '#F1F5F9' }}>👁 Preview</strong> to view the full PDF.
                Click <strong style={{ color: '#F1F5F9' }}>✏️ Use & Edit</strong> to load it into the builder — all fields become editable and the live preview updates instantly.
              </p>
            </div>

            {/* Category filter */}
            <FilterPills
              options={SAMPLE_CATEGORIES}
              active={categoryFilter}
              onSelect={setCategoryFilter}
            />

            {/* Count */}
            <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginBottom: 28 }}>
              {filteredSamples.length} sample{filteredSamples.length !== 1 ? 's' : ''}
              {categoryFilter !== 'all' ? ` in ${SAMPLE_CATEGORIES.find(c => c.id === categoryFilter)?.label}` : ''}
            </p>

            {/* Sample grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 20,
            }}>
              {filteredSamples.map(sample => (
                <SampleCard
                  key={sample.id}
                  sample={sample}
                  onPreview={setPreviewSample}
                  onEdit={handleEditSample}
                />
              ))}
            </div>
          </>
        )}

        {/* ── DESIGN TEMPLATES TAB ────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <>
            <div style={{
              padding: '13px 20px', borderRadius: 12, marginBottom: 36,
              background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 18 }}>🎨</span>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                Choose a visual layout to start from scratch. You can also switch layouts anytime inside the builder.
              </p>
            </div>

            {/* Category filter */}
            <FilterPills
              options={['All', 'Tech', 'Business', 'Design', 'Research']}
              active={designFilter}
              onSelect={setDesignFilter}
            />

            {/* Design template grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {filteredDesigns.map(t => (
                <DesignCard
                  key={t.id}
                  t={t}
                  onSelect={handleSelectDesign}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── PDF Preview Modal ───────────────────────────────────────────────── */}
      {previewSample && (
        <PDFModal
          sample={previewSample}
          onClose={() => setPreviewSample(null)}
          onEdit={handleEditSample}
        />
      )}
    </div>
  );
}
