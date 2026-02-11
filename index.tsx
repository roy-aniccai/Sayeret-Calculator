import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminDashboard } from './components/AdminDashboard';
import SingleTrackApp from './components/SingleTrackApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdmin ? (
      <AdminDashboard onClose={() => window.location.search = ''} />
    ) : (
      <SingleTrackApp />
    )}
  </React.StrictMode>
);