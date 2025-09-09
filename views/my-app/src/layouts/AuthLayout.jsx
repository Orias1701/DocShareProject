// pages/layouts/AuthLayout.js
import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout" >
      <div className="auth-container" >
        {children}
      </div>
    </div>
  );
}
