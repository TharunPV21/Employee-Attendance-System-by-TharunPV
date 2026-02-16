import { useState, useEffect } from 'react';
import { tharunDashboardApi } from '../../services/tharunApi';

function tharunFormatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TharunManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tharunDashboardApi
      .manager()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--tharun-text-muted)' }}>Loading dashboard…</div>;
  if (!data) return <div style={{ color: 'var(--tharun-danger)' }}>Failed to load dashboard.</div>;

  const {
    totalEmployees,
    presentToday,
    absentToday,
    lateToday,
    absentEmployees,
    weeklyTrend = [],
    departmentWise = [],
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Manager Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Total employees</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalEmployees ?? 0}</p>
        </div>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Present today</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tharun-success)' }}>{presentToday ?? 0}</p>
        </div>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Absent today</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tharun-danger)' }}>{absentToday ?? 0}</p>
        </div>
        <div className="tharun-card">
          <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>Late today</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tharun-warning)' }}>{lateToday ?? 0}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="tharun-card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Weekly attendance trend</h2>
          {weeklyTrend.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {weeklyTrend.map((d) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: 80, fontSize: '0.85rem' }}>{tharunFormatDate(d._id)}</span>
                  <div style={{ flex: 1, height: 20, background: 'var(--tharun-bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (d.present / (totalEmployees || 1)) * 100)}%`,
                        height: '100%',
                        background: 'var(--tharun-accent)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)' }}>{d.present} present</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--tharun-text-muted)' }}>No data for this week.</p>
          )}
        </div>
        <div className="tharun-card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Department-wise today</h2>
          {departmentWise.length ? (
            <ul style={{ listStyle: 'none' }}>
              {departmentWise.map((d) => (
                <li key={d._id || 'dept'} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                  <span>{d._id || 'Unset'}</span>
                  <span style={{ fontWeight: 600 }}>{d.present} present</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--tharun-text-muted)' }}>No department data.</p>
          )}
        </div>
      </div>

      <div className="tharun-card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Absent today</h2>
        {absentEmployees?.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--tharun-border)' }}>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Employee ID</th>
                <th style={{ padding: '0.5rem 0', fontWeight: 600 }}>Department</th>
              </tr>
            </thead>
            <tbody>
              {absentEmployees.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--tharun-border)' }}>
                  <td style={{ padding: '0.5rem 0' }}>{u.name}</td>
                  <td style={{ padding: '0.5rem 0', fontFamily: 'var(--tharun-mono)' }}>{u.employeeId}</td>
                  <td style={{ padding: '0.5rem 0' }}>{u.department || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--tharun-text-muted)' }}>Everyone is present today.</p>
        )}
      </div>
    </div>
  );
}
