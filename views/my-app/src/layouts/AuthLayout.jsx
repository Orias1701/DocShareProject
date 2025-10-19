// src/layouts/AuthLayout.jsx
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  useEffect(() => {
    // Tách style trang register khỏi main
    document.body.classList.remove("main-page");
    document.body.classList.add("register-page");
    document.body.classList.remove("sidebar--collapsed");

    return () => {
      document.body.classList.remove("register-page");
    };
  }, []);

  return <>{children}</>;
}
