import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tharunDashboardApi, tharunAttendanceApi } from '../../services/tharunApi';

function tharunFormatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function tharunFormatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TharunEmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const tharunLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tharunDashboardApi.employee();
      setData(res);
    } catch (err) {
      setData(null);
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const tharunCheckIn = async () => {
    setActionLoading(true);
    try {
      await tharunAttendanceApi.checkIn();
      await tharunLoad();
    } finally {
      setActionLoading(false);
    }
  };

  const tharunCheckOut = async () => {
    setActionLoading(true);
    try {
      await tharunAttendanceApi.checkOut();
      await tharunLoad();
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    tharunLoad();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
        <div style={{ color: 'var(--tharun-text-muted)' }}>Loading dashboard…</div>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
        <div className="tharun-card" style={{ color: 'var(--tharun-danger)' }}>
          <p style={{ marginBottom: '0.75rem' }}>{error}</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--tharun-text-muted)', marginBottom: '0.75rem' }}>
            Check that the backend is running and the app is using the correct API URL.
          </p>
          <button type="button" className="tharun-btn tharun-btn-primary" onClick={tharunLoad}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { today, checkedIn, checkedOut, monthStats, recent } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>

      <div className="tharun-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', color: 'var(--tharun-text-muted)', marginBottom: '0.25rem' }}>Today's status</h2>
          <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {checkedIn ? (checkedOut ? 'Checked out' : 'Checked in') : 'Not checked in'}
          </p>
          {today?.checkInTime && (
            <p style={{ fontSize: '0.9rem', color: 'var(--tharun-text-muted)', marginTop: '0.25rem' }}>
              In: {tharunFormatTime(today.checkInTime)}
              {today.checkOutTime && ` · Out: ${tharunFormatTime(today.checkOutTime)}`}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!checkedIn && (
            <button className="tharun-btn tharun-btn-success" onClick={tharunCheckIn} disabled={actionLoading}>
              Check In
            </button>
          )}
          {checkedIn && !checkedOut && (
            <button className="tharun-btn tharun-btn-danger" onClick={tharunCheckOut} disabled={actionLoading}>
              Check Out
            </button>
          )}
          <Link to="/mark-attendance" className="tharun-btn tharun-btn-ghost">
            Mark Attendance
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Present this month</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tharun-success)' }}>{monthStats?.present ?? 0}</p>
        </div>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Absent</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tharun-danger)' }}>{monthStats?.absent ?? 0}</p>
        </div>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Late</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tharun-warning)' }}>{monthStats?.late ?? 0}</p>
        </div>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Total hours (month)</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{monthStats?.totalHours?.toFixed(1) ?? 0}h</p>
        </div>
      </div>

      <div className="tharun-card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent attendance (last 7 days)</h2>
        {recent?.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--tharun-border)' }}>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Check In</th>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Check Out</th>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--tharun-border)' }}>
                  <td style={{ padding: '0.5rem 0' }}>{tharunFormatDate(r.date)}</td>
                  <td style={{ padding: '0.5rem 0' }}>{tharunFormatTime(r.checkInTime)}</td>
                  <td style={{ padding: '0.5rem 0' }}>{tharunFormatTime(r.checkOutTime)}</td>
                  <td style={{ padding: '0.5rem 0' }}>
                    <span className={`tharun-badge tharun-badge-${r.status}`}>{r.status}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0' }}>{r.totalHours ?? 0}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--tharun-text-muted)' }}>No recent records.</p>
        )}
      </div>
    </div>
  );
}
