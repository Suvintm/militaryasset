import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
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
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
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

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
