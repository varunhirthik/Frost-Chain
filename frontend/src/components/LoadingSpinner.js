// frontend/src/components/LoadingSpinner.js
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <div>{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
