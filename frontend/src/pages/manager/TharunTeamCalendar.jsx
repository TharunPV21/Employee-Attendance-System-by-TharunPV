import { useState, useEffect } from 'react';
import { tharunAttendanceApi } from '../../services/tharunApi';

function tharunFormatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function tharunGetCalendarDays(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const rows = [];
  let row = Array(startPad).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    row.push({ date: date.toISOString().split('T')[0], day: d });
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

export default function TharunTeamCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const end = new Date(year, month, 0).toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    tharunAttendanceApi
      .all({ startDate: start, endDate: end })
      .then((res) => setList(res.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [start, end]);

  const byDate = {};
  list.forEach((a) => {
    const key = new Date(a.date).toISOString().split('T')[0];
    if (!byDate[key]) byDate[key] = { present: 0, late: 0, absent: 0 };
    if (a.checkInTime) {
      if (a.status === 'late') byDate[key].late++;
      else byDate[key].present++;
    } else byDate[key].absent++;
  });

  const calendarRows = tharunGetCalendarDays(year, month);
  const selectedStats = selectedDate ? byDate[selectedDate] : null;
  const THARUN_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Team Calendar View</h1>

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

      <div className="tharun-card">
        <p style={{ fontSize: '0.8rem', color: 'var(--tharun-text-muted)', marginBottom: '0.75rem' }}>
          Green: present · Yellow: late · Red: absent (no check-in)
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
                    const stats = byDate[cell.date];
                    const total = stats ? stats.present + stats.late + stats.absent : 0;
                    const hasPresent = stats?.present > 0;
                    const hasLate = stats?.late > 0;
                    let bg = 'var(--tharun-surface-hover)';
                    if (total) {
                      if (hasLate && !hasPresent) bg = 'rgba(234, 179, 8, 0.3)';
                      else if (hasPresent) bg = 'rgba(34, 197, 94, 0.25)';
                      else bg = 'rgba(239, 68, 68, 0.2)';
                    }
                    return (
                      <td key={ci} style={{ padding: '0.25rem', verticalAlign: 'top' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDate(selectedDate === cell.date ? null : cell.date)}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            maxWidth: 48,
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
        {selectedStats && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--tharun-bg)', borderRadius: 'var(--tharun-radius-sm)' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{tharunFormatDate(selectedDate)}</p>
            <p>Present: {selectedStats.present ?? 0}</p>
            <p>Late: {selectedStats.late ?? 0}</p>
            <p>Absent: {selectedStats.absent ?? 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}
