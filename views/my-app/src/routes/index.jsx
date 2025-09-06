// src/app/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import NavBar from "../components/layouts/NavBar";

// Pages
import FollowingPage from "../pages/following/FollowingPage";
import ExplorePage from "../pages/explore/ExplorePage";
import HistoryPage from "../pages/history/HistoryPage";
import MyPostsPage from "../pages/myposts/MyPostsPage";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";

// Layout parts
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";

// Global icons/css (tùy bạn có thể đặt ở entry file)
import "../assets/font-awesome-6.6.0-pro-full-main/css/all.css";

const Placeholder = ({ name }) => (
  <div style={{ fontSize: "20px", padding: "1rem" }}>{name} Page</div>
);

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Đồng bộ class trên <body> để CSS var --sidebar-width áp dụng cho cả nav & main
  useEffect(() => {
    document.body.classList.toggle("sidebar--collapsed", isCollapsed);
    return () => {
      // cleanup nếu component unmount
      document.body.classList.remove("sidebar--collapsed");
    };
  }, [isCollapsed]);

  return (
    <BrowserRouter>
      <Header />

      {/* App shell: bọc Nav + Main để nền tối phủ kín */}
      <div className="app-shell">
        {/* Sidebar (điều khiển collapse qua setIsCollapsed) */}
        <NavBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        {/* Content: dùng class .app-main để ăn theo --sidebar-width */}
        <main>
          <Routes>
            {/* Giữ "/" là ExplorePage; nếu muốn redirect -> /explore thì thay 2 dòng dưới */}
            <Route path="/" element={<ExplorePage />} />
            {/* <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/explore" element={<ExplorePage />} /> */}

            <Route path="/following" element={<FollowingPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />

            {/* Các route NavBar khác */}
            <Route path="/profile" element={<Placeholder name="Profile" />} />
            <Route path="/new-post" element={<Placeholder name="New Post" />} />
            <Route path="/new-album" element={<Placeholder name="New Album" />} />
            <Route path="/my-albums" element={<Placeholder name="My Albums" />} />
            <Route path="/leaderboard" element={<Placeholder name="Leaderboard" />} />
            <Route path="/categories" element={<Placeholder name="Categories" />} />
            <Route path="/hashtags" element={<Placeholder name="Hashtags" />} />
          </Routes>
        </main>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
