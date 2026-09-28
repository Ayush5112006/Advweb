import React from 'react';

/**
 * Suspense fallback for lazily-loaded routes.
 * Reuses the app's existing .spinner / @keyframes rotation styles so the
 * loading state matches the rest of the UI in both dark and light mode.
 */
export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="loading-container">
        <span className="spinner" />
        <p>{label}</p>
      </div>
    </div>
  );
}
