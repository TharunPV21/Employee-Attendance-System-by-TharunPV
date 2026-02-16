import { useState, useEffect } from 'react';
import { tharunAttendanceApi } from '../../services/tharunApi';

function tharunFormatTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function tharunFormatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const THARUN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function tharunGetCalendarDays(year, month, attendanceMap) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const rows = [];
  let row = Array(startPad).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const key = date.toISOString().split('T')[0];
    row.push({ date: key, day: d, record: attendanceMap[key] });
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }
  return rows;
}

export default function TharunMyHistory() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const tharunLoad = async () => {
    setLoading(true);
    try {
      const [historyRes, summaryRes] = await Promise.all([
        tharunAttendanceApi.myHistory({ month, year }),
        tharunAttendanceApi.mySummary({ month, year }),
      ]);
      setList(historyRes.data || []);
      setSummary(summaryRes.summary || null);
    } catch (_) {
      setList([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tharunLoad();
  }, [month, year]);

  const attendanceMap = {};
  list.forEach((a) => {
    const key = new Date(a.date).toISOString().split('T')[0];
    attendanceMap[key] = a;
  });
  const calendarRows = tharunGetCalendarDays(year, month, attendanceMap);
  const selectedRecord = selectedDate ? attendanceMap[selectedDate] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Attendance History</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <select
          className="tharun-input"
          style={{ width: 'auto' }}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {THARUN_MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          className="tharun-input"
          style={{ width: 'auto' }}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[year - 2, year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="tharun-badge tharun-badge-present">Present: {summary.present}</span>
          <span className="tharun-badge tharun-badge-absent">Absent: {summary.absent}</span>
          <span className="tharun-badge tharun-badge-late">Late: {summary.late}</span>
          <span className="tharun-badge tharun-badge-halfday">Half-day: {summary.halfDay}</span>
          <span style={{ color: 'var(--tharun-text-muted)' }}>Total hours: {summary.totalHours?.toFixed(1) ?? 0}h</span>
        </div>
      )}

      <div className="tharun-card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Calendar view</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)', marginBottom: '0.75rem' }}>
          Green: Present · Red: Absent · Yellow: Late · Orange: Half day
        </p>
        {loading ? (
          <p style={{ color: 'var(--tharun-text-muted)' }}>Loading…</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <th key={d} style={{ padding: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    if (!cell) return <td key={ci} style={{ padding: '0.25rem' }} />;
                    const status = cell.record?.status || 'absent';
                    const bg =
                      status === 'present' ? 'rgba(34, 197, 94, 0.25)' :
                      status === 'absent' ? 'rgba(239, 68, 68, 0.25)' :
                      status === 'late' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(249, 115, 22, 0.25)';
                    return (
                      <td key={ci} style={{ padding: '0.25rem', verticalAlign: 'top' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDate(selectedDate === cell.date ? null : cell.date)}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            maxWidth: 44,
                            borderRadius: 'var(--tharun-radius-sm)',
                            background: selectedDate === cell.date ? 'var(--tharun-accent)' : bg,
                            color: selectedDate === cell.date ? 'white' : 'inherit',
                            border: '1px solid var(--tharun-border)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          }}
                        >
                          {cell.day}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {selectedRecord && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--tharun-bg)', borderRadius: 'var(--tharun-radius-sm)' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{tharunFormatDate(selectedRecord.date)}</p>
            <p>Check in: {tharunFormatTime(selectedRecord.checkInTime)}</p>
            <p>Check out: {tharunFormatTime(selectedRecord.checkOutTime)}</p>
            <p>Status: <span className={`tharun-badge tharun-badge-${selectedRecord.status}`}>{selectedRecord.status}</span></p>
            <p>Hours: {selectedRecord.totalHours ?? 0}h</p>
          </div>
        )}
      </div>

      <div className="tharun-card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Table view</h2>
        {list.length ? (
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
              {list.map((r) => (
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
          <p style={{ color: 'var(--tharun-text-muted)' }}>No records for this month.</p>
        )}
      </div>
    </div>
  );
}
