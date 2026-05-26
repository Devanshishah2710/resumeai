import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { resumeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

const TEMPLATE_COLORS = { modern:'#3B82F6', executive:'#6366F1', creative:'#EC4899', minimal:'#10B981', academic:'#F59E0B', startup:'#8B5CF6' };

function ResumeCard({ resume, onDelete, onDuplicate }) {
  const [h, setH] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const color = TEMPLATE_COLORS[resume.template] || '#3B82F6';

  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setMenuOpen(false);}}
      style={{ borderRadius:16, overflow:'hidden', background:'rgba(255,255,255,0.03)', border:`1px solid ${h?color+'44':'rgba(255,255,255,0.07)'}`, transition:'all .3s ease', transform:h?'translateY(-3px)':'none', boxShadow:h?`0 16px 40px ${color}15`:'none', position:'relative' }}>
      <div style={{ height:120, background:`linear-gradient(135deg,${color}22,${color}11)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ width:80, height:100, borderRadius:6, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', padding:8, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ height:4, borderRadius:2, background:`linear-gradient(90deg,${color},${color}88)` }}/>
          {[60,80,50,70,55].map((w,i)=><div key={i} style={{ height:2, borderRadius:1, background:'rgba(255,255,255,0.1)', width:`${w}%` }}/>)}
        </div>
        <div style={{ position:'absolute', top:10, right:10 }}>
          <button onClick={e=>{e.stopPropagation();setMenuOpen(p=>!p);}} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#94A3B8', cursor:'pointer', padding:'4px 8px', fontSize:16 }}>⋯</button>
          {menuOpen && (
            <div style={{ position:'absolute', right:0, top:36, background:'#1E293B', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, overflow:'hidden', minWidth:140, zIndex:10, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
              {[
                { label:'✏️ Edit', action:()=>navigate(`/builder/${resume._id}`) },
                { label:'📋 Duplicate', action:()=>onDuplicate(resume._id) },
                { label:'🗑️ Delete', action:()=>onDelete(resume._id), danger:true },
              ].map(m=>(
                <button key={m.label} onClick={e=>{e.stopPropagation();m.action();setMenuOpen(false);}} style={{ display:'block', width:'100%', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontSize:13, color:m.danger?'#FB7185':'#94A3B8', fontFamily:'inherit', transition:'background .15s' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='none'}>{m.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding:'14px 16px 16px' }} onClick={()=>navigate(`/builder/${resume._id}`)}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:4, cursor:'pointer' }}>{resume.title}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:'#64748B', textTransform:'capitalize' }}>{resume.template}</span>
          <span style={{ fontSize:11, color:'#34D399', fontWeight:600 }}>{resume.atsScore || 0}% ATS</span>
        </div>
        <div style={{ fontSize:11, color:'#334155', marginTop:6 }}>
          {new Date(resume.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { resetResume } = useResume();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await resumeAPI.list();
      setResumes(data.resumes);
    } catch { toast.error('Failed to load resumes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try { await resumeAPI.delete(id); setResumes(p=>p.filter(r=>r._id!==id)); toast.success('Resume deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await resumeAPI.duplicate(id);
      setResumes(p=>[data.resume,...p]);
      toast.success('Resume duplicated');
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleNew = () => { resetResume(); navigate('/builder'); };

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'100px 24px 60px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, marginBottom:6 }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color:'#64748B', fontSize:15 }}>
              {resumes.length} of {user?.resumeLimit || 3} resumes used
              {user?.plan === 'free' && <span style={{ marginLeft:8, fontSize:12, color:'#F59E0B', background:'rgba(245,158,11,0.1)', padding:'2px 8px', borderRadius:100, border:'1px solid rgba(245,158,11,0.2)' }}>Free Plan</span>}
            </p>
          </div>
          <button className="btn-primary" onClick={handleNew} style={{ fontSize:14 }}>+ New Resume</button>
        </div>

        {/* ATS tip */}
        <div style={{ padding:'16px 20px', borderRadius:12, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', marginBottom:40, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18 }}>💡</span>
          <p style={{ fontSize:14, color:'#94A3B8' }}>Tip: Tailor each resume to the specific job. Use the AI tools in the builder to optimize for ATS scoring.</p>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner"/></div>
        ) : resumes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed rgba(255,255,255,0.1)', borderRadius:20 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:22, marginBottom:8 }}>No resumes yet</h3>
            <p style={{ color:'#64748B', marginBottom:24 }}>Create your first resume and start applying to jobs</p>
            <button className="btn-primary" onClick={handleNew}>Create Your First Resume →</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20 }}>
            {/* New card */}
            <div onClick={handleNew} style={{ borderRadius:16, border:'1px dashed rgba(59,130,246,0.3)', background:'rgba(59,130,246,0.04)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', cursor:'pointer', transition:'all .3s', minHeight:200 }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.08)';e.currentTarget.style.borderColor='rgba(59,130,246,0.5)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(59,130,246,0.04)';e.currentTarget.style.borderColor='rgba(59,130,246,0.3)';}}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:12 }}>+</div>
              <div style={{ fontSize:14, fontWeight:600, color:'#60A5FA' }}>New Resume</div>
            </div>
            {resumes.map(r => <ResumeCard key={r._id} resume={r} onDelete={handleDelete} onDuplicate={handleDuplicate}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
