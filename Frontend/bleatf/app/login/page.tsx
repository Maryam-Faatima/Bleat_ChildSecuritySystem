"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticationManager from '@/app/lib/AuthenticationManager';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (AuthenticationManager.authenticate(email, password)) {
        const user = AuthenticationManager.getLoggedInUser();
        if (user?.role === 'parent') router.push('/parent/dashboard');
        else if (user?.role === 'admin') router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password. Try parent@example.com / password');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backgroundImage:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary)), url(/images/login-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="card shadow rounded-4 w-100"
        style={{ maxWidth: 400, borderRadius: 18, padding: '1.5rem', maxHeight: '95vh' }}
      >
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: '100%', gap: '1rem' }}
        >
          {/* Logo */}
          <div
            style={{
              width: '150px',
              height: '150px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src="/logo.jpg"
              alt="logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Title */}
          
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger text-center mb-2" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="w-100 d-flex flex-column align-items-center" style={{ gap: '0.75rem' }}>
            <div className="w-100">
              <label className="form-label small">Email</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`form-control form-control-lg ${error ? 'is-invalid' : ''}`}
                disabled={isLoading}
              />
            </div>

            <div className="w-100">
              <label className="form-label small">Password</label>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-control form-control-lg ${error ? 'is-invalid' : ''}`}
                disabled={isLoading}
              />
            </div>
<br></br>
            <div className="d-grid gap-2 mb-2 w-100">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-lg"
                style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8 }}
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>

            <div className="text-center w-100 mt-1">
              <Link href="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Don't have an account? Sign up
              </Link>
            </div>
          </form>

          <p className="text-center text-muted small mt-2">
            Demo: parent@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
}
