import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Nav links — Templates covers both design templates AND samples (no separate link)
const PUBLIC_NAV  = [{ to: '/templates', label: 'Templates' }];
const PRIVATE_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/templates', label: 'Templates' },
  { to: '/builder',   label: 'Builder'   },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const isActive = (to) => location.pathname === to;
  const navLinks = isAuthenticated ? PRIVATE_NAV : PUBLIC_NAV;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64, padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(8,12,20,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff',
        }}>R</div>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18,
          background: 'linear-gradient(90deg,#F1F5F9,#94A3B8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>ResumeAI</span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
          background: 'rgba(59,130,246,0.15)', color: '#60A5FA',
          border: '1px solid rgba(59,130,246,0.3)',
        }}>BETA</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              textDecoration: 'none',
              padding: '7px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              background: isActive(link.to) ? 'rgba(59,130,246,0.15)' : 'transparent',
              color:      isActive(link.to) ? '#60A5FA'               : '#94A3B8',
              transition: 'all 0.2s',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated ? (
          <>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            <button className="btn-ghost" onClick={handleLogout} style={{ fontSize: 13 }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ fontSize: 13 }}>Sign In</button>
            </Link>
            <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
                Get Started →
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
