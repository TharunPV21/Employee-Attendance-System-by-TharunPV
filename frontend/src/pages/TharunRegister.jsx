import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tharunSetCredentials, tharunSetError } from '../store/tharunAuthSlice';
import { tharunAuthApi } from '../services/tharunApi';

export default function TharunRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((s) => s.tharunAuth.error);

  const tharunSubmit = async (e) => {
    e.preventDefault();
    dispatch(tharunSetError(null));
    setLoading(true);
    try {
      const res = await tharunAuthApi.register({
        name,
        email,
        password,
        role: 'employee',
        department: department || undefined,
      });
      dispatch(tharunSetCredentials({ user: res.user, token: res.token }));
      navigate('/');
    } catch (err) {
      dispatch(tharunSetError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div className="tharun-card" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Create account</h1>
        <p style={{ color: 'var(--tharun-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Register as an employee to start marking your attendance.
        </p>
        <form onSubmit={tharunSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>Full name</label>
            <input
              type="text"
              className="tharun-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>Email</label>
            <input
              type="email"
              className="tharun-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>Department (optional)</label>
            <input
              type="text"
              className="tharun-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>Password</label>
            <input
              type="password"
              className="tharun-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          {error && <p style={{ color: 'var(--tharun-danger)', fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" className="tharun-btn tharun-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--tharun-text-muted)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
