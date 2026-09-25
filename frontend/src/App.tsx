import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './features/public/WelcomePage';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PurchasesPage } from './features/purchases/PurchasesPage';
import { TransfersPage } from './features/transfers/TransfersPage';
import { AssignmentsPage } from './features/assignments/AssignmentsPage';
import { AuditLogsPage } from './features/audit/AuditLogsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portal Landing Page */}
        <Route path="/" element={<WelcomePage />} />
        
        {/* Redirect /login to public portal popup */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            
            {/* Restricted to Admin and Base Commander */}
            <Route element={<RoleRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']} />}>
              <Route path="/assignments" element={<AssignmentsPage />} />
            </Route>

            {/* Restricted to Admin */}
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all redirects to public portal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
