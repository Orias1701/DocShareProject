// src/layouts/AuthLayout.jsx
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  useEffect(() => {
    // Đảm bảo không dính style của main
    document.body.classList.remove("main-page");
    document.body.classList.add("register-page");
    return () => {
      document.body.classList.remove("register-page");
    };
  }, []);

  return <>{children}</>;
}
