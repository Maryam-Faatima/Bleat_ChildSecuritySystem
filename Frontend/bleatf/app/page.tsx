'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api';
import { useAuth } from './context/auth-context';
import Link from 'next/link';
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await ApiService.login(email, password);
      
      if (result.success) {
        // Store user data
        login(result.userId, result.userRole);
        
        // Redirect based on role
        if (result.userRole === 'PARENT') {
          router.push('/parent/dashboard');
        } else if (result.userRole === 'CHILD') {
          router.push('/child/dashboard');
        } else if (result.userRole === 'ADMIN') {
          router.push('/admin/dashboard');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>🔒 Bleat</h1>
        <p className={styles.subtitle}>Child Security System</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles.signupLink}>
          Don't have an account?{' '}
          <Link href="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
