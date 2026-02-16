const tharunBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const tharunTimeoutMs = 15000;

function tharunGetToken() {
  return localStorage.getItem('tharun_att_token');
}

function tharunFetchWithTimeout(url, options, ms) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
  ]);
}

async function tharunFetch(path, options = {}) {
  const token = tharunGetToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await tharunFetchWithTimeout(tharunBase + path, { ...options, headers }, tharunTimeoutMs);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const tharunAuthApi = {
  register: (body) => tharunFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => tharunFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => tharunFetch('/auth/me'),
};

export const tharunAttendanceApi = {
  checkIn: () => tharunFetch('/attendance/checkin', { method: 'POST' }),
  checkOut: () => tharunFetch('/attendance/checkout', { method: 'POST' }),
  myHistory: (params) => tharunFetch('/attendance/my-history?' + new URLSearchParams(params).toString()),
  mySummary: (params) => tharunFetch('/attendance/my-summary?' + new URLSearchParams(params).toString()),
  today: () => tharunFetch('/attendance/today'),
  all: (params) => tharunFetch('/attendance/all?' + new URLSearchParams(params).toString()),
  employee: (id) => tharunFetch(`/attendance/employee/${id}`),
  summary: (params) => tharunFetch('/attendance/summary?' + new URLSearchParams(params).toString()),
  exportCsv: (params) => {
    const token = tharunGetToken();
    const qs = new URLSearchParams(params).toString();
    return fetch(tharunBase + '/attendance/export?' + qs, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  todayStatus: () => tharunFetch('/attendance/today-status'),
};

export const tharunDashboardApi = {
  employee: () => tharunFetch('/dashboard/employee'),
  manager: () => tharunFetch('/dashboard/manager'),
};
