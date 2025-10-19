import { useEffect } from "react";
import NavBar from "../components/layouts/NavBar";
import Footer from "../components/layouts/Footer";

export default function MainLayout() {
  useEffect(() => {
    document.body.classList.add("main-page");
    return () => document.body.classList.remove("main-page");
  }, []);

  return (
    <div className="app-shell">
      <NavBar />

      <main>
        <h1 className="text-xl font-semibold mb-2">
          N Bài viết mới nhất của mỗi category
        </h1>
        <p className="text-sm opacity-80">Mỗi hàng là 1 category</p>
      </main>

      <Footer />
    </div>
  );
}
