import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tharunLogout } from '../store/tharunAuthSlice';

export default function TharunLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.tharunAuth.user);
  const isManager = user?.role === 'manager';
  const base = isManager ? '/manager' : '/';

  const tharunHandleLogout = () => {
    dispatch(tharunLogout());
    navigate(isManager ? '/login' : '/login');
  };

  const navItems = isManager
    ? [
        { to: base, label: 'Dashboard' },
        { to: base + '/attendance', label: 'All Attendance' },
        { to: base + '/calendar', label: 'Team Calendar' },
        { to: base + '/reports', label: 'Reports' },
      ]
    : [
        { to: base, label: 'Dashboard' },
        { to: base + 'mark-attendance', label: 'Mark Attendance' },
        { to: base + 'history', label: 'My History' },
        { to: base + 'profile', label: 'Profile' },
      ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          borderBottom: '1px solid var(--tharun-border)',
          background: 'var(--tharun-surface)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Attendance</span>
          <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === base}
                style={({ isActive }) => ({
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--tharun-radius-sm)',
                  color: isActive ? 'var(--tharun-accent)' : 'var(--tharun-text-muted)',
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--tharun-text-muted)' }}>
            {user?.name} {user?.employeeId && `(${user.employeeId})`}
          </span>
          <button type="button" className="tharun-btn tharun-btn-ghost" onClick={tharunHandleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
