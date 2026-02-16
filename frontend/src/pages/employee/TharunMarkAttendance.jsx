import { useState, useEffect } from 'react';
import { tharunAttendanceApi } from '../../services/tharunApi';

function tharunFormatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TharunMarkAttendance() {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const tharunLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tharunAttendanceApi.today();
      setToday(res);
    } catch (err) {
      setToday(null);
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

  if (loading && today === null && !error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mark Attendance</h1>
        <div style={{ color: 'var(--tharun-text-muted)' }}>Loading…</div>
      </div>
    );
  }
  if (error && today === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mark Attendance</h1>
        <div className="tharun-card" style={{ color: 'var(--tharun-danger)', maxWidth: 420 }}>
          <p style={{ marginBottom: '0.75rem' }}>{error}</p>
          <button type="button" className="tharun-btn tharun-btn-primary" onClick={tharunLoad}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const checkedIn = today?.checkedIn ?? false;
  const checkedOut = today?.checkedOut ?? false;
  const record = today?.today;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mark Attendance</h1>
      <div className="tharun-card" style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Today</h2>
        <p style={{ color: 'var(--tharun-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--tharun-text-muted)' }}>Check in</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{record?.checkInTime ? tharunFormatTime(record.checkInTime) : 'Not yet'}</p>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--tharun-text-muted)' }}>Check out</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{record?.checkOutTime ? tharunFormatTime(record.checkOutTime) : 'Not yet'}</p>
        </div>
        {record && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--tharun-text-muted)' }}>Status</p>
            <span className={`tharun-badge tharun-badge-${record.status}`}>{record.status}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
          {checkedOut && <p style={{ color: 'var(--tharun-success)' }}>You have completed today's attendance.</p>}
        </div>
      </div>
    </div>
  );
}
