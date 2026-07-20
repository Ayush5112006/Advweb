import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound({ themeColor }) {
  return (
    <div className="error-container">
      <div className="error-code" style={{ color: themeColor }}>404</div>
      <h2 className="error-title">Page Not Found</h2>
      <p className="error-message">
        Oops! The page you are looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link 
        to="/" 
        className="btn btn-primary"
        style={{ backgroundColor: themeColor, borderColor: themeColor }}
      >
        Back to Home
      </Link>
    </div>
  );
}
