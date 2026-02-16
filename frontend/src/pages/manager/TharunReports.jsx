import { useState, useEffect } from 'react';
import { tharunAttendanceApi } from '../../services/tharunApi';

function tharunFormatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function tharunFormatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TharunReports() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().slice(0, 7) + '-01',
    endDate: new Date().toISOString().slice(0, 10),
    employeeId: '',
  });

  const tharunLoad = async () => {
    setLoading(true);
    try {
      const params = { startDate: filters.startDate, endDate: filters.endDate };
      if (filters.employeeId) params.employeeId = filters.employeeId;
      const res = await tharunAttendanceApi.all(params);
      setList(res.data || []);
    } catch (_) {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tharunLoad();
  }, [filters.startDate, filters.endDate, filters.employeeId]);

  const tharunExport = () => {
    const params = { startDate: filters.startDate, endDate: filters.endDate };
    if (filters.employeeId) params.employeeId = filters.employeeId;
    tharunAttendanceApi.exportCsv(params).then((res) => {
      if (!res.ok) return;
      res.blob().then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance-export.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reports</h1>

      <div className="tharun-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>From</label>
          <input
            type="date"
            className="tharun-input"
            style={{ width: 160 }}
            value={filters.startDate}
            onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>To</label>
          <input
            type="date"
            className="tharun-input"
            style={{ width: 160 }}
            value={filters.endDate}
            onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>Employee ID (optional)</label>
          <input
            type="text"
            className="tharun-input"
            style={{ width: 140 }}
            placeholder="EMP001"
            value={filters.employeeId}
            onChange={(e) => setFilters((p) => ({ ...p, employeeId: e.target.value }))}
          />
        </div>
        <button className="tharun-btn tharun-btn-primary" onClick={tharunExport}>
          Export CSV
        </button>
      </div>

      <div className="tharun-card" style={{ overflowX: 'auto' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Attendance data</h2>
        {loading ? (
          <p style={{ color: 'var(--tharun-text-muted)' }}>Loading…</p>
        ) : list.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--tharun-border)' }}>
                <th style={{ padding: '0.5rem 0.5rem 0.5rem 0', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Check In</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Check Out</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.5rem', fontWeight: 600 }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--tharun-border)' }}>
                  <td style={{ padding: '0.5rem 0.5rem 0.5rem 0' }}>{tharunFormatDate(r.date)}</td>
                  <td style={{ padding: '0.5rem' }}>{r.userId?.name ?? '—'}</td>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--tharun-mono)' }}>{r.userId?.employeeId ?? '—'}</td>
                  <td style={{ padding: '0.5rem' }}>{r.userId?.department ?? '—'}</td>
                  <td style={{ padding: '0.5rem' }}>{tharunFormatTime(r.checkInTime)}</td>
                  <td style={{ padding: '0.5rem' }}>{tharunFormatTime(r.checkOutTime)}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span className={`tharun-badge tharun-badge-${r.status}`}>{r.status}</span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{r.totalHours ?? 0}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--tharun-text-muted)' }}>No records for the selected range.</p>
        )}
      </div>
    </div>
  );
}
