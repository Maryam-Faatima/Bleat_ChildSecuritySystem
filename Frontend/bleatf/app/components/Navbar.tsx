"use client";
import Link from 'next/link';
import AuthenticationManager from '@/app/lib/AuthenticationManager';

export default function Navbar() {
  const linkStyle = { color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' } as const;
  const user = AuthenticationManager.getLoggedInUser();

  return (
    <header className="w-100 bg-white shadow-sm">
      <div style={{ maxWidth: 768, margin: '0 auto', width: '100%', padding: '1.5rem 1rem' }} className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <img src="/logo.svg" alt="bleat logo" width={40} height={40} style={{ borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }} className="text-dark">bleat</div>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Child Security System</small>
          </div>
        </div>
        <nav className="d-flex" style={{ gap: 16, alignItems: 'center' }}>
          <Link href="/login" style={linkStyle}>Login</Link>
          <Link href="/signup" style={linkStyle}>Signup</Link>
          <Link href="/parent/dashboard" style={linkStyle}>Parent</Link>
          <Link href="/parent/reports" style={linkStyle}>Reports</Link>
          <Link href="/admin/dashboard" style={linkStyle}>Admin</Link>
          {user && user.role === 'parent' && (
            <Link href="/parent/children?addChild=true">
              <button className="btn btn-sm btn-primary">+ Add Child</button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
