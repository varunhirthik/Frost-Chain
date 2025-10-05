import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * FROST-CHAIN DApp Entry Point
 * 
 * Renders the main App component to the DOM
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
