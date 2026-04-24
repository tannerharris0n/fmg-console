import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppShell } from './components/layout/AppShell';
import { AuthGate } from './components/auth/AuthGate';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import Login from './pages/Login';
import Placeholder from './pages/Placeholder';
import Tasks from './pages/Tasks';
import PolicyPackages from './pages/PolicyPackages';
import PolicyAnalyzer from './pages/PolicyAnalyzer';
import PolicyObjects from './pages/PolicyObjects';
import PolicyProfiles from './pages/PolicyProfiles';
import Drift from './pages/Drift';
import CveWatch from './pages/CveWatch';
import Sdwan from './pages/Sdwan';
import VpnTunnels from './pages/VpnTunnels';
import HaClusters from './pages/HaClusters';
import Threats from './pages/Threats';
import AdminAudit from './pages/AdminAudit';
import Scripts from './pages/Scripts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGate><AppShell /></AuthGate>}>
            <Route index element={<Dashboard />} />

            <Route path="/devices"       element={<Devices />} />
            <Route path="/devices/:name" element={<DeviceDetail />} />

            <Route path="/fabric"        element={<Sdwan />} />
            <Route path="/fabric/sdwan"  element={<Sdwan />} />
            <Route path="/fabric/vpn"    element={<VpnTunnels />} />
            <Route path="/fabric/ha"     element={<HaClusters />} />

            <Route path="/policy"          element={<PolicyPackages />} />
            <Route path="/policy/packages" element={<PolicyPackages />} />
            <Route path="/policy/objects"  element={<PolicyObjects />} />
            <Route path="/policy/profiles" element={<PolicyProfiles />} />
            <Route path="/policy/analyzer" element={<PolicyAnalyzer />} />

            <Route path="/security"          element={<Threats />} />
            <Route path="/security/threats"  element={<Threats />} />
            <Route path="/security/drift"    element={<Drift />} />
            <Route path="/security/audit"    element={<AdminAudit />} />
            <Route path="/security/cve"      element={<CveWatch />} />

            <Route path="/tasks"    element={<Tasks />} />
            <Route path="/scripts"  element={<Scripts />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Placeholder title="Not found" note="That route does not exist." />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
