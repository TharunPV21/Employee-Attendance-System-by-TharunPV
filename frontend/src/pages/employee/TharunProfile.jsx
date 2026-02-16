import { useSelector } from 'react-redux';

export default function TharunProfile() {
  const user = useSelector((s) => s.tharunAuth.user);
  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Profile</h1>
      <div className="tharun-card" style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Name</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Email</p>
          <p style={{ fontSize: '1.1rem' }}>{user.email}</p>
        </div>
        {user.employeeId && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Employee ID</p>
            <p style={{ fontSize: '1.1rem', fontFamily: 'var(--tharun-mono)' }}>{user.employeeId}</p>
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Role</p>
          <p style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>{user.role}</p>
        </div>
        {user.department && (
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Department</p>
            <p style={{ fontSize: '1.1rem' }}>{user.department}</p>
          </div>
        )}
      </div>
    </div>
  );
}
