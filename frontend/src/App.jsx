import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TharunLayout from './components/TharunLayout';
import TharunLogin from './pages/TharunLogin';
import TharunRegister from './pages/TharunRegister';
import TharunEmployeeDashboard from './pages/employee/TharunEmployeeDashboard';
import TharunMarkAttendance from './pages/employee/TharunMarkAttendance';
import TharunMyHistory from './pages/employee/TharunMyHistory';
import TharunProfile from './pages/employee/TharunProfile';
import TharunManagerDashboard from './pages/manager/TharunManagerDashboard';
import TharunAllAttendance from './pages/manager/TharunAllAttendance';
import TharunTeamCalendar from './pages/manager/TharunTeamCalendar';
import TharunReports from './pages/manager/TharunReports';

function TharunGuestOnly({ children }) {
  const { user, token } = useSelector((s) => s.tharunAuth);
  if (token && user) return <Navigate to={user.role === 'manager' ? '/manager' : '/'} replace />;
  return children;
}

function TharunPrivateRoute({ children, role }) {
  const { user, token } = useSelector((s) => s.tharunAuth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'manager' ? '/manager' : '/'} replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<TharunGuestOnly><TharunLogin /></TharunGuestOnly>} />
      <Route path="/register" element={<TharunGuestOnly><TharunRegister /></TharunGuestOnly>} />
      <Route
        path="/"
        element={
          <TharunPrivateRoute role="employee">
            <TharunLayout />
          </TharunPrivateRoute>
        }
      >
        <Route index element={<TharunEmployeeDashboard />} />
        <Route path="mark-attendance" element={<TharunMarkAttendance />} />
        <Route path="history" element={<TharunMyHistory />} />
        <Route path="profile" element={<TharunProfile />} />
      </Route>
      <Route
        path="/manager"
        element={
          <TharunPrivateRoute role="manager">
            <TharunLayout />
          </TharunPrivateRoute>
        }
      >
        <Route index element={<TharunManagerDashboard />} />
        <Route path="attendance" element={<TharunAllAttendance />} />
        <Route path="calendar" element={<TharunTeamCalendar />} />
        <Route path="reports" element={<TharunReports />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
