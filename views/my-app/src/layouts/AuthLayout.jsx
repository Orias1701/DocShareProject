import React, { useEffect } from "react";

/**
 * AuthLayout: full-screen, tách khỏi layout chính.
 * - Gỡ class của main layout (main-page, sidebar--collapsed)
 * - Thêm class 'auth-page' để CSS chỉ áp cho login/register
 * - Ép body/viewport full-screen, có thể cuộn khi form dài
 */
export default function AuthLayout({ children }) {
  useEffect(() => {
    document.body.classList.remove("main-page", "sidebar--collapsed");
    document.body.classList.add("auth-page");

    // đảm bảo khung nhìn full-screen cho auth
    const prevStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      height: document.body.style.height,
      overflowY: document.body.style.overflowY,
    };
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.overflowY = "auto";

    return () => {
      document.body.classList.remove("auth-page");
      // khôi phục lại body style trước đó
      document.body.style.margin = prevStyle.margin;
      document.body.style.padding = prevStyle.padding;
      document.body.style.height = prevStyle.height;
      document.body.style.overflowY = prevStyle.overflowY;
    };
  }, []);

  return (
      <div className="auth-main">{children}</div>
  );
}
