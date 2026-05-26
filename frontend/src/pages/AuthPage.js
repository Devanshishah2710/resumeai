import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); setLoading(false); return; }
        if (form.password.length < 8) { toast.error('Password must be 8+ characters'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome to ResumeAI 🎉');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inp = { className:'input-field', style:{ marginBottom:0 } };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative' }} className="grid-bg">
      <div className="orb" style={{ top:'20%', left:'15%', width:400, height:400, background:'rgba(59,130,246,0.12)' }}/>
      <div className="orb" style={{ bottom:'20%', right:'15%', width:350, height:350, background:'rgba(139,92,246,0.1)' }}/>

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1, animation:'fadeUp .5s ease both' }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:40 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'#fff' }}>R</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, background:'linear-gradient(90deg,#F1F5F9,#94A3B8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ResumeAI</span>
        </Link>

        <div className="glass" style={{ padding:36, borderRadius:20 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, textAlign:'center', marginBottom:8 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color:'#64748B', textAlign:'center', fontSize:14, marginBottom:32 }}>
            {mode === 'login' ? 'Sign in to your ResumeAI account' : 'Start building your dream resume today'}
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full Name</label>
                <input {...inp} type="text" placeholder="Alex Johnson" value={form.name} onChange={e=>set('name',e.target.value)} required/>
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input {...inp} type="email" placeholder="alex@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required/>
            </div>
            <div>
              <label className="label">Password</label>
              <input {...inp} type="password" placeholder={mode==='register'?'Min. 8 characters':'Your password'} value={form.password} onChange={e=>set('password',e.target.value)} required/>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:8, padding:14, fontSize:15 }}>
              {loading ? <><span className="animate-spin" style={{ display:'inline-block', marginRight:8 }}>◌</span>Please wait...</> : mode==='login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'#64748B' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={()=>setMode(mode==='login'?'register':'login')} style={{ background:'none', border:'none', color:'#60A5FA', cursor:'pointer', fontWeight:600, fontSize:14, fontFamily:'inherit' }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#334155' }}>
          By continuing, you agree to our <span style={{ color:'#60A5FA', cursor:'pointer' }}>Terms</span> and <span style={{ color:'#60A5FA', cursor:'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
