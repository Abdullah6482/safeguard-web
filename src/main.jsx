import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import LoginScreen from './screens/auth/LoginScreen';
import ManagerDashboard from './screens/manager/ManagerDashboard';
import ManagerReviewScreen from './screens/manager/ManagerReviewScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'white', backgroundColor: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>React Render Crash!</h2>
          <p style={{ marginTop: '20px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</p>
          <p style={{ marginTop: '20px', color: '#999', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{this.state.info?.componentStack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<ManagerDashboard />} />
          <Route path="/review/:id" element={<ManagerReviewScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
