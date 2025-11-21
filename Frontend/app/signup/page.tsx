"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<'parent' | 'admin'>('parent');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (role === 'parent' && !formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1400);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary)), url(/images/signup-illustration.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="card shadow rounded-4 w-100"
        style={{ maxWidth: 900, borderRadius: 18, padding: '1.5rem', maxHeight: '95vh' }}
      >
        <div className="row g-0">
          <div className="col-12 col-md-6">
            <div
              className="card-body d-flex flex-column justify-content-center align-items-center"
              style={{ minHeight: '100%' }}
            >
              
              {/* Logo Section */}
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '1rem',
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

              {success && (
                <div className="alert alert-success text-center mb-2" role="alert">
                  Account created — redirecting to login...
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
                <div className="mb-2 w-100">
                  <label className="form-label small">Full name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                    //placeholder="John Doe"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-2 w-100">
                  <label className="form-label small">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                   // placeholder="parent@example.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-2 w-100">
                  <label className="form-label small">Phone number</label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.phoneNumber ? 'is-invalid' : ''}`}
                   // placeholder="+1-555-0000"
                  />
                  {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                </div>

                <div className="mb-2 w-100">
                  <label className="form-label small">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                    //placeholder="••••••••"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3 w-100">
                  <label className="form-label small">Confirm password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  //  placeholder="••••••••"
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
<br></br>
                <div className="d-grid gap-2 mb-2 w-100">
                  <button
                    type="submit"
                    className="btn btn-lg"
                    style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8 }}
                  >
                    Create Account
                  </button>
                </div>

                <div className="text-center w-100 mt-1">
                  <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    Have an account? Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
