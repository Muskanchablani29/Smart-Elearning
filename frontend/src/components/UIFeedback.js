import React from "react";

export const LoadingSpinner = ({ message = "Loading content..." }) => (
  <div className="center-loader">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export const AlertMessage = ({ type = "error", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`alert-banner alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close-btn" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};
