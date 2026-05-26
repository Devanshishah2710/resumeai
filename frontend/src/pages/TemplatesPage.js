import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { templateAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','Tech','Business','Design','Research'];

function TemplateCard({ t, onSelect }) {
  const ref = useRef(null);
  const [h, setH] = useState(false);
  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; setH(false); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseEnter={()=>setH(true)}
      style={{ borderRadius:20, overflow:'hidden', cursor:'pointer', background:'rgba(255,255,255,0.03)', border:`1px solid ${h?t.color+'66':'rgba(255,255,255,0.07)'}`, transition:'all .3s ease', transform: h?'scale(1.02)':'scale(1)', boxShadow: h?`0 20px 60px ${t.color}22`:'0 4px 20px rgba(0,0,0,0.3)', transformStyle:'preserve-3d', animation:'fadeUp .6s ease both' }}>
      <div style={{ height:200, background:`linear-gradient(135deg,${t.color}22,${t.color2}33)`, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:130, height:170, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', padding:12, display:'flex', flexDirection:'column', gap:6, boxShadow:'0 10px 40px rgba(0,0,0,0.3)', transform: h?'scale(1.05) rotateZ(-1deg)':'scale(1)', transition:'transform .3s ease' }}>
          <div style={{ height:6, borderRadius:3, background:`linear-gradient(90deg,${t.color},${t.color2})` }}/>
          <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.2)', width:'60%' }}/>
          <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.1)', width:'40%' }}/>
          <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'4px 0' }}/>
          {[65,80,55,70,60].map((w,i)=><div key={i} style={{ height:2, borderRadius:1, background:'rgba(255,255,255,0.07)', width:`${w}%` }}/>)}
        </div>
        {t.tag && (
          <div style={{ position:'absolute', top:12, right:12, padding:'3px 10px', borderRadius:100, fontSize:10, fontWeight:700,
            background: t.tag==='Most Popular'?'rgba(59,130,246,0.3)':t.tag==='New'?'rgba(16,185,129,0.3)':'rgba(139,92,246,0.3)',
            color: t.tag==='Most Popular'?'#60A5FA':t.tag==='New'?'#34D399':'#A78BFA',
            border: `1px solid ${t.tag==='Most Popular'?'#3B82F6':t.tag==='New'?'#10B981':'#8B5CF6'}44`,
          }}>{t.tag}</div>
        )}
      </div>
      <div style={{ padding:'16px 20px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>{t.name}</div>
            <div style={{ fontSize:12, color:'#64748B' }}>{t.category}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:12, color:'#34D399', fontWeight:600 }}>{t.atsScore}% ATS</div>
            <div style={{ fontSize:10, color:'#475569' }}>Score</div>
          </div>
        </div>
        <button onClick={()=>onSelect(t)} style={{ width:'100%', padding:10, borderRadius:10, border:'none', cursor:'pointer', background: h?`linear-gradient(135deg,${t.color},${t.color2})`:'rgba(255,255,255,0.06)', color: h?'#fff':'#94A3B8', fontSize:13, fontWeight:600, fontFamily:'inherit', transition:'all .3s ease', boxShadow: h?`0 8px 20px ${t.color}44`:'none' }}>
          {h ? 'Use This Template →' : 'Select Template'}
        </button>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState('All');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    templateAPI.list().then(r => setTemplates(r.data.templates)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = filter==='All' ? templates : templates.filter(t=>t.category===filter||t.category==='All');

  const handleSelect = (t) => {
    if (!isAuthenticated) { toast.error('Sign in to start building'); navigate('/auth'); return; }
    navigate(`/builder?template=${t.id}&color=${encodeURIComponent(t.color)}`);
  };

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ padding:'100px 24px 80px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:100, marginBottom:20, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', fontSize:11, color:'#A78BFA', fontWeight:700, letterSpacing:1 }}>TEMPLATES</div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:40, lineHeight:1.1, marginBottom:14 }}>
            Professional templates for<br/>
            <span className="gradient-text">every career stage</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:16 }}>ATS-optimized. Recruiter-approved. Designer-crafted.</p>
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:48, flexWrap:'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setFilter(c)} style={{ padding:'8px 20px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, background: filter===c?'linear-gradient(135deg,#3B82F6,#8B5CF6)':'rgba(255,255,255,0.04)', color: filter===c?'#fff':'#64748B', border: filter===c?'none':'1px solid rgba(255,255,255,0.08)', transition:'all .2s' }}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner"/></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
            {filtered.map(t => <TemplateCard key={t.id} t={t} onSelect={handleSelect}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
