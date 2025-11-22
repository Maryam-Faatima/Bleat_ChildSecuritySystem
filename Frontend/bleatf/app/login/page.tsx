"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/lib/api';
import AuthenticationManager from '@/app/lib/AuthenticationManager';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call backend API to authenticate
      const response = await ApiService.login(name, password);
      if (response.success) {
        // Determine role from backend: ADMIN / PARENT / CHILD
        const backendRole = (response.role || 'PARENT').toUpperCase();
        const role = backendRole === 'ADMIN' ? 'admin' : backendRole === 'CHILD' ? 'child' : 'parent';
        // Set authenticated user in AuthenticationManager
        AuthenticationManager.setLoggedInUser({
          userId: response.userId,
          role: role as any,
          email: name,
          parentId: backendRole === 'CHILD' ? (response as any).parentId : undefined,
        });
        // Route based on role. Child should go to its own dashboard.
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'child') {
          router.push('/child/dashboard');
        } else {
          router.push('/parent/dashboard');
        }
      } else {
        setError(response.message || 'Invalid name or password');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              <label className="form-label small">Full Name</label>
              <input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            Use the name and password you signed up with.
          </p>
        </div>
      </div>
    </div>
  );
}
