import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { BlockchainProvider } from './utils/BlockchainContext';
import { RoleProvider } from './utils/RoleContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CreateBatch from './components/CreateBatch';
import BatchDetails from './components/BatchDetails';
import BatchHistory from './components/BatchHistory';
import AdminPanel from './components/AdminPanel';

/**
 * Main App Component
 * 
 * Root component that sets up routing, context providers, and global UI components
 */
function App() {
  return (
    <div className="App">
      <BlockchainProvider>
        <RoleProvider>
          <Router>
            <Navigation />
            
            <main className="main-content">
            <Routes>
              {/* Main Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Batch Management */}
              <Route path="/create-batch" element={<CreateBatch />} />
              <Route path="/batch/:id" element={<BatchDetails />} />
              <Route path="/batch/:id/history" element={<BatchHistory />} />
              
              {/* Administration */}
              <Route path="/admin" element={<AdminPanel />} />
              
              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          {/* Global Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </RoleProvider>
      </BlockchainProvider>
    </div>
  );
}

/**
 * 404 Not Found Component
 */
const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="display-1 text-muted">404</h1>
          <h2>Page Not Found</h2>
          <p className="lead">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <a href="/" className="btn btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
