import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const TEMPLATES = [
  { id:'modern', name:'Modern Pro', color:'#3B82F6', color2:'#8B5CF6' },
  { id:'exec', name:'Executive', color:'#6366F1', color2:'#EC4899' },
  { id:'creative', name:'Creative', color:'#EC4899', color2:'#8B5CF6' },
  { id:'minimal', name:'Minimal', color:'#10B981', color2:'#06B6D4' },
];
const STATS = [
  { value:'2.4M+', label:'Resumes Created', icon:'📄' },
  { value:'94%', label:'Interview Rate', icon:'🎯' },
  { value:'180+', label:'Countries', icon:'🌍' },
  { value:'4.9★', label:'User Rating', icon:'⭐' },
];
const FEATURES = [
  { icon:'🤖', title:'AI-Powered Writing', desc:'Claude AI crafts compelling summaries and bullet points tailored to your target role.', color:'#8B5CF6' },
  { icon:'📊', title:'ATS Optimizer', desc:'Real-time scoring ensures your resume passes automated screening at top companies.', color:'#3B82F6' },
  { icon:'🎨', title:'6 Pro Templates', desc:'Recruiter-approved designs for every industry and career level.', color:'#06B6D4' },
  { icon:'⚡', title:'One-Click PDF', desc:'Download a pixel-perfect PDF ready to submit anywhere, instantly.', color:'#10B981' },
  { icon:'🔄', title:'Version Control', desc:'Save multiple versions and tailor each one to different job applications.', color:'#F59E0B' },
  { icon:'📱', title:'Mobile Friendly', desc:'Build and edit your resume from any device, anywhere, anytime.', color:'#F43F5E' },
];

function FloatingCard({ t, delay }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.05)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{
      width:160, height:210, borderRadius:16, padding:14, cursor:'pointer',
      background:`linear-gradient(135deg,${t.color}22,${t.color2}33)`,
      border:`1px solid ${t.color}44`,
      boxShadow:`0 20px 60px ${t.color}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
      animation:`cardTilt ${5+delay}s ease-in-out ${delay}s infinite`,
      transition:'transform .15s ease', transformStyle:'preserve-3d',
      display:'flex', flexDirection:'column', gap:7,
    }}>
      <div style={{ height:7, borderRadius:4, background:`linear-gradient(90deg,${t.color},${t.color2})`, opacity:.9 }}/>
      <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.15)', width:'55%' }}/>
      <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.08)', width:'75%' }}/>
      {[70,85,55,70,60].map((w,i)=><div key={i} style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', width:`${w}%` }}/>)}
      <div style={{ marginTop:'auto' }}>
        <div style={{ fontSize:8, color:t.color, fontWeight:700, marginBottom:4 }}>{t.name.toUpperCase()}</div>
        <div style={{ display:'flex', gap:4 }}>
          {[t.color,t.color2,'rgba(255,255,255,0.3)'].map((c,i)=><div key={i} style={{ width:7,height:7,borderRadius:'50%',background:c,opacity:.8 }}/>)}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ f, delay }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
      padding:24, borderRadius:16,
      background: h ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
      border: h ? `1px solid ${f.color}44` : '1px solid rgba(255,255,255,0.06)',
      transition:'all 0.3s ease', transform: h ? 'translateY(-4px)' : 'none',
      boxShadow: h ? `0 12px 40px ${f.color}15` : 'none',
      animation:`fadeUp .6s ease ${delay}s both`,
    }}>
      <div style={{ width:44, height:44, borderRadius:12, marginBottom:16, background:`${f.color}18`, border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'transform 0.3s ease', transform: h ? 'scale(1.1) rotate(-5deg)' : '' }}>{f.icon}</div>
      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.title}</h3>
      <p style={{ fontSize:14, color:'#64748B', lineHeight:1.6 }}>{f.desc}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ minHeight:'100vh', overflowX:'hidden' }}>
      <Navbar />
      {/* Hero */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'100px 24px 60px', position:'relative' }} className="grid-bg">
        <div className="orb" style={{ top:'10%', left:'8%', width:600, height:600, background:'rgba(59,130,246,0.12)' }}/>
        <div className="orb" style={{ top:'55%', right:'5%', width:500, height:500, background:'rgba(139,92,246,0.1)' }}/>
        <div className="orb" style={{ top:'30%', left:'50%', width:400, height:400, background:'rgba(6,182,212,0.07)' }}/>

        <div style={{ textAlign:'center', maxWidth:800, position:'relative', zIndex:1, animation:'fadeUp .8s ease both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, marginBottom:32, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', fontSize:12, color:'#60A5FA', fontWeight:600 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#34D399', display:'inline-block' }} className="animate-pulse"/>
            AI-Powered Resume Builder — Free to Start
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(38px,6vw,72px)', lineHeight:1.05, letterSpacing:'-2px', marginBottom:24 }}>
            <span className="shimmer-text">Build Resumes That</span><br/>
            <span className="gradient-text">Get You Hired</span>
          </h1>
          <p style={{ fontSize:18, color:'#64748B', lineHeight:1.7, marginBottom:40, maxWidth:540, margin:'0 auto 40px' }}>
            Create ATS-optimized resumes in minutes with Claude AI. 6 professional templates, live preview, one-click PDF export.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/auth?mode=register" style={{ textDecoration:'none' }}>
              <button className="btn-primary" style={{ fontSize:15, padding:'14px 32px' }}>Start Building Free →</button>
            </Link>
            <Link to="/templates" style={{ textDecoration:'none' }}>
              <button className="btn-secondary" style={{ fontSize:15, padding:'14px 32px' }}>View Templates</button>
            </Link>
          </div>
        </div>

        <div style={{ display:'flex', gap:20, marginTop:72, position:'relative', zIndex:1, flexWrap:'wrap', justifyContent:'center', animation:'fadeUp .8s ease .3s both' }}>
          {TEMPLATES.map((t,i) => <FloatingCard key={t.id} t={t} delay={i*.9}/>)}
        </div>

        <div style={{ display:'flex', marginTop:72, position:'relative', zIndex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden', flexWrap:'wrap', animation:'fadeUp .8s ease .5s both' }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ padding:'20px 36px', textAlign:'center', borderRight: i<STATS.length-1?'1px solid rgba(255,255,255,0.07)':'none' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:36, marginBottom:12 }}>
              Everything to <span className="gradient-text">land the job</span>
            </h2>
            <p style={{ color:'#64748B', fontSize:16 }}>Professional tools that give you an unfair advantage</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
            {FEATURES.map((f,i) => <FeatureCard key={i} f={f} delay={i*.08}/>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto', padding:48, borderRadius:24, background:'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))', border:'1px solid rgba(59,130,246,0.2)' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:32, marginBottom:16 }}>Ready to get hired?</h2>
          <p style={{ color:'#64748B', marginBottom:32, fontSize:16 }}>Join 2.4M+ professionals who've built their dream resume.</p>
          <Link to="/auth?mode=register" style={{ textDecoration:'none' }}>
            <button className="btn-primary" style={{ fontSize:15, padding:'14px 36px' }}>Create Your Resume Free →</button>
          </Link>
        </div>
      </section>

      <footer style={{ padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14 }}>R</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#64748B' }}>ResumeAI</span>
        </div>
        <p style={{ fontSize:13, color:'#334155' }}>© 2026 ResumeAI · React + Node.js + MongoDB</p>
        <div style={{ display:'flex', gap:20 }}>{['Privacy','Terms','Contact'].map(l=><span key={l} style={{ fontSize:13, color:'#475569', cursor:'pointer' }}>{l}</span>)}</div>
      </footer>
    </div>
  );
}
