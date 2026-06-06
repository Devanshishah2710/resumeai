import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';

const CATEGORIES = [
  { id:'all', label:'All Fields', icon:'🌐' },
  { id:'technology', label:'Technology', icon:'💻' },
  { id:'business', label:'Business', icon:'📊' },
  { id:'finance', label:'Finance', icon:'💰' },
  { id:'education', label:'Education', icon:'🎓' },
  { id:'freshers', label:'Freshers', icon:'🌱' },
];

const LEVEL_COLORS = {
  fresher:'#10B981', junior:'#3B82F6', mid:'#8B5CF6',
  senior:'#F59E0B', lead:'#F43F5E'
};

export default function SamplesPage() {
  const [samples, setSamples] = useState([]);
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_API_URL || 'https://resumeai-b3p4.onrender.com/api';

  useEffect(() => {
    const url = filter === 'all' ? `${API}/samples` : `${API}/samples?category=${filter}`;
    fetch(url).then(r => r.json()).then(d => setSamples(d.samples || [])).finally(() => setLoading(false));
  }, [filter]);

  const handleDownload = (s) => {
    window.open(`${API}/samples/${s.filename}`, '_blank');
  };

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'100px 24px 60px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:38, marginBottom:12 }}>
            Resume <span className="gradient-text">Sample Library</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:16 }}>
            25 professionally crafted resumes across 5 fields — free to preview and use as inspiration
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:44, flexWrap:'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              padding:'9px 22px', borderRadius:100, border:'none', cursor:'pointer',
              fontFamily:'inherit', fontSize:13, fontWeight:600,
              background: filter===c.id ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'rgba(255,255,255,0.05)',
              color: filter===c.id ? '#fff' : '#64748B',
              border: filter===c.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition:'all .2s',
            }}>{c.icon} {c.label}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner"/></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {samples.map(s => (
              <div key={s.id} style={{
                borderRadius:16, overflow:'hidden',
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                transition:'all .3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=`${LEVEL_COLORS[s.level]}55`; e.currentTarget.style.boxShadow=`0 12px 40px ${LEVEL_COLORS[s.level]}15`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow=''; }}>

                {/* PDF preview thumbnail */}
                <div style={{ height:180, background:`linear-gradient(135deg,${LEVEL_COLORS[s.level]}22,${LEVEL_COLORS[s.level]}11)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <div style={{ width:110, height:150, background:'white', borderRadius:6, boxShadow:'0 8px 24px rgba(0,0,0,0.4)', padding:10, display:'flex', flexDirection:'column', gap:5 }}>
                    <div style={{ height:5, borderRadius:3, background:LEVEL_COLORS[s.level] }}/>
                    <div style={{ height:3, borderRadius:2, background:'#e2e8f0', width:'60%' }}/>
                    <div style={{ height:2, borderRadius:1, background:'#f1f5f9', width:'80%' }}/>
                    <div style={{ height:1, background:'#e2e8f0', margin:'3px 0' }}/>
                    {[70,85,60,75,55,80].map((w,i) => <div key={i} style={{ height:2, borderRadius:1, background:'#f1f5f9', width:`${w}%` }}/>)}
                    <div style={{ marginTop:4, height:2, borderRadius:1, background:LEVEL_COLORS[s.level], width:'40%', opacity:.6 }}/>
                  </div>
                  <div style={{ position:'absolute', top:10, right:10, padding:'3px 8px', borderRadius:100, fontSize:10, fontWeight:700, background:`${LEVEL_COLORS[s.level]}25`, color:LEVEL_COLORS[s.level], border:`1px solid ${LEVEL_COLORS[s.level]}44`, textTransform:'capitalize' }}>{s.level}</div>
                </div>

                <div style={{ padding:'14px 16px 18px' }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{s.name}</div>
                  <div style={{ fontSize:12, color:'#64748B', marginBottom:10 }}>{s.title}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ fontSize:11, color:'#34D399', fontWeight:600 }}>ATS {s.ats}%</span>
                    <span style={{ fontSize:11, color:'#475569', textTransform:'capitalize' }}>#{s.category}</span>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => setPreview(s)} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                      👁 Preview
                    </button>
                    <button onClick={() => handleDownload(s)} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background:`linear-gradient(135deg,${LEVEL_COLORS[s.level]},${LEVEL_COLORS[s.level]}bb)`, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                      ⬇ Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:860, height:'88vh', background:'#1E293B', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{preview.name}</div>
                <div style={{ fontSize:12, color:'#64748B' }}>{preview.title}</div>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <button onClick={() => handleDownload(preview)} className="btn-primary" style={{ padding:'8px 18px', fontSize:13 }}>⬇ Download PDF</button>
                <button onClick={() => setPreview(null)} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>✕</button>
              </div>
            </div>
            <iframe
              src={`${API}/samples/${preview.filename}`}
              style={{ flex:1, border:'none', background:'white' }}
              title={preview.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}