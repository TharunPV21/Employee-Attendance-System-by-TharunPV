import { useState, useEffect } from 'react';
import { tharunAttendanceApi } from '../../services/tharunApi';

function tharunFormatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function tharunFormatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TharunAllAttendance() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  const tharunLoad = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
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
  }, [filters.employeeId, filters.startDate, filters.endDate, filters.status]);

  const tharunApplyFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>All Employees Attendance</h1>

      <div className="tharun-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>Employee ID</label>
          <input
            type="text"
            className="tharun-input"
            style={{ width: 140 }}
            placeholder="EMP001"
            value={filters.employeeId}
            onChange={(e) => tharunApplyFilter('employeeId', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>Start date</label>
          <input
            type="date"
            className="tharun-input"
            style={{ width: 160 }}
            value={filters.startDate}
            onChange={(e) => tharunApplyFilter('startDate', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>End date</label>
          <input
            type="date"
            className="tharun-input"
            style={{ width: 160 }}
            value={filters.endDate}
            onChange={(e) => tharunApplyFilter('endDate', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--tharun-text-muted)' }}>Status</label>
          <select
            className="tharun-input"
            style={{ width: 140 }}
            value={filters.status}
            onChange={(e) => tharunApplyFilter('status', e.target.value)}
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half day</option>
          </select>
        </div>
      </div>

      <div className="tharun-card" style={{ overflowX: 'auto' }}>
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
          <p style={{ color: 'var(--tharun-text-muted)' }}>No records match the filters.</p>
        )}
      </div>
    </div>
  );
}
