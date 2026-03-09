import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
import SingleTrackApp from './components/SingleTrackApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true' || window.location.pathname.startsWith('/admin');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">טוען...</div>}>
      {isAdmin ? (
        <AdminDashboard onClose={() => window.location.href = '/'} />
      ) : (
        <SingleTrackApp />
      )}
    </Suspense>
  </React.StrictMode>
);