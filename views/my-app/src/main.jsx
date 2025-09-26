import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Bọc app bằng AuthProvider
import { AuthProvider } from "./hook/useAuth.jsx";
import AppRoutes from './routes/index.jsx'
// Chúng ta sẽ render App (đã trả về routes)
import App from "./App.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </StrictMode>
);

