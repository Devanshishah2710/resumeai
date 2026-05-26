import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

function Section({ title, desc, children }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:28, marginBottom:20 }}>
      <div style={{ marginBottom:20 }}>
        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:17, marginBottom:4 }}>{title}</h3>
        {desc && <p style={{ fontSize:13, color:'#64748B' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ name });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('Password must be 8+ characters'); return; }
    setPwSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally { setPwSaving(false); }
  };

  const PLAN_COLORS = { free:'#94A3B8', pro:'#3B82F6', enterprise:'#8B5CF6' };
  const planColor = PLAN_COLORS[user?.plan] || '#94A3B8';

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:720, margin:'0 auto', padding:'100px 24px 60px' }}>
        <div style={{ marginBottom:36 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, marginBottom:6 }}>Account Settings</h1>
          <p style={{ color:'#64748B', fontSize:15 }}>Manage your profile, security, and subscription</p>
        </div>

        {/* Plan */}
        <Section title="Subscription Plan" desc="Your current plan and usage">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:`${planColor}22`, border:`1px solid ${planColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {user?.plan === 'free' ? '🌱' : user?.plan === 'pro' ? '⚡' : '🚀'}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:16, textTransform:'capitalize' }}>{user?.plan} Plan</div>
                <div style={{ fontSize:13, color:'#64748B' }}>{user?.resumeCount || 0} / {user?.resumeLimit || 3} resumes used</div>
              </div>
            </div>
            {user?.plan === 'free' && (
              <button className="btn-primary" style={{ padding:'10px 22px', fontSize:13 }}>Upgrade to Pro ⚡</button>
            )}
          </div>
          <div style={{ marginTop:16, background:'rgba(255,255,255,0.03)', borderRadius:10, overflow:'hidden' }}>
            <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
              <div style={{ height:'100%', width:`${Math.min(((user?.resumeCount||0)/(user?.resumeLimit||3))*100,100)}%`, background:`linear-gradient(90deg,${planColor},${planColor}aa)`, borderRadius:3, transition:'width .5s ease' }}/>
            </div>
          </div>
        </Section>

        {/* Profile */}
        <Section title="Profile Information" desc="Update your display name and email">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#fff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:16 }}>{user?.name}</div>
              <div style={{ fontSize:13, color:'#64748B' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className="label">Full Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="input-field" placeholder="Your full name"/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="label">Email Address</label>
            <input value={user?.email || ''} disabled className="input-field" style={{ opacity:.5, cursor:'not-allowed' }}/>
            <p style={{ fontSize:12, color:'#475569', marginTop:4 }}>Email cannot be changed for security reasons</p>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary" style={{ padding:'10px 24px', fontSize:14 }}>
            {saving ? '◌ Saving...' : 'Save Changes'}
          </button>
        </Section>

        {/* Password */}
        <Section title="Change Password" desc="Keep your account secure with a strong password">
          {[
            { label:'Current Password', key:'currentPassword', placeholder:'Your current password' },
            { label:'New Password', key:'newPassword', placeholder:'Min. 8 characters' },
            { label:'Confirm New Password', key:'confirm', placeholder:'Repeat new password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:14 }}>
              <label className="label">{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e=>setPwForm(p=>({...p,[f.key]:e.target.value}))} className="input-field" placeholder={f.placeholder}/>
            </div>
          ))}
          <button onClick={handleChangePassword} disabled={pwSaving} className="btn-primary" style={{ padding:'10px 24px', fontSize:14 }}>
            {pwSaving ? '◌ Updating...' : 'Update Password'}
          </button>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" desc="Irreversible account actions">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14, color:'#FB7185', marginBottom:3 }}>Delete Account</div>
              <div style={{ fontSize:13, color:'#64748B' }}>Permanently delete your account and all resumes</div>
            </div>
            <button className="btn-danger" onClick={()=>{ if(window.confirm('Are you sure? This cannot be undone.')) { toast.error('Contact support to delete your account'); }}}>
              Delete Account
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
