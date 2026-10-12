/* eslint-disable react-refresh/only-export-components */
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
const LoginScreen=lazy(()=>import('./screens/auth/LoginScreen'));
const ManagerDashboard=lazy(()=>import('./screens/manager/ManagerDashboard'));
const ManagerReviewScreen=lazy(()=>import('./screens/manager/ManagerReviewScreen'));
const SidebarLayout=lazy(()=>import('./screens/manager/SidebarLayout'));
const IncidentsPage=lazy(()=>import('./screens/manager/IncidentsPage'));
const CapaRegistryPage=lazy(()=>import('./screens/manager/CapaRegistryPage'));
const AnalyticsPage=lazy(()=>import('./screens/manager/AnalyticsPage'));
const TeamPage=lazy(()=>import('./screens/manager/TeamPage'));
const PoliciesPage=lazy(()=>import('./screens/manager/PoliciesPage'));
const SettingsPage=lazy(()=>import('./screens/manager/SettingsPage'));

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('Application error', error, info); }
  render() { return this.state.hasError ? <div className="page-center"><div className="error-card"><h1>Something went wrong</h1><p>The dashboard could not render this page. Reload and try again.</p><button className="btn btn-primary" onClick={()=>location.reload()}>Reload dashboard</button></div></div> : this.props.children; }
}

function Unauthorized() { const navigate=useNavigate(); return <div className="page-center"><div className="error-card"><h1>Manager access required</h1><p>This account is not authorized for the management portal.</p><button className="btn btn-primary" onClick={()=>navigate('/login')}>Return to sign in</button></div></div>; }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><BrowserRouter><AuthProvider><Suspense fallback={<div className="page-center"><div className="loader"/></div>}><Routes>
    <Route path="/login" element={<LoginScreen/>}/><Route path="/unauthorized" element={<Unauthorized/>}/>
    <Route element={<ProtectedRoute role="manager"/>}><Route element={<SidebarLayout/>}>
      <Route path="/" element={<ManagerDashboard/>}/><Route path="/incidents" element={<IncidentsPage/>}/><Route path="/incidents/:id" element={<ManagerReviewScreen/>}/><Route path="/review/:id" element={<ManagerReviewScreen/>}/><Route path="/capa" element={<CapaRegistryPage/>}/><Route path="/analytics" element={<AnalyticsPage/>}/><Route path="/team" element={<TeamPage/>}/><Route path="/policies" element={<PoliciesPage/>}/><Route path="/settings" element={<SettingsPage/>}/>
    </Route></Route><Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Suspense></AuthProvider></BrowserRouter></ErrorBoundary></React.StrictMode>
);
