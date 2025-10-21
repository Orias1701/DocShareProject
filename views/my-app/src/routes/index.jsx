// src/app/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "../hook/useAuth";
import RequireAuth from "../pages/auth/RequireAuth";

// Layout & Components
import NavBar from "../components/layouts/NavBar";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import Modal from "../components/common/Modal";
import NewAlbumForm from "../components/common/NewAlbumForm";
import AuthLayout from "../layouts/AuthLayout";

// Pages
import ExplorePage from "../pages/explore/ExplorePage";
import FollowingPage from "../pages/following/FollowingPage";
import MyPostsPage from "../pages/myposts/MyPostsPage";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import MyAlbumPage from "../pages/myalbum/MyAlbumPage";
import NewPostPage from "../pages/new-post/NewPostPage";
import LeaderboardPage from "../pages/leaderboard/LeaderboardPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import HashtagsPage from "../pages/hashtags/HashtagsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import FileViewerPage from "../pages/viewer/FileViewerPage";
import ContentViewerPage from "../pages/viewer/ContentViewerPage";
import ProfilePageOther from "../pages/profile/ProfilePageOther";
import AlbumDetailPage from "../pages/myalbum/AlbumDetailPage";
import CategoryDetailPage from "../pages/categories/CategoryDetailPage";
import SearchPage from "../pages/search/SearchPage";
import UserManager from "../pages/user_manager/UserManager";

// Global css
import "../assets/font-awesome-6.6.0-pro-full-main/css/all.css";

/** Layout chính (public), không yêu cầu đăng nhập */
function MainLayout({
  isCollapsed,
  setIsCollapsed,
  isNewAlbumModalOpen,
  setNewAlbumModalOpen,
}) {
  useEffect(() => {
    document.body.classList.add("main-page");
    return () => document.body.classList.remove("main-page");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar--collapsed", isCollapsed);
    return () => document.body.classList.remove("sidebar--collapsed");
  }, [isCollapsed]);

  return (
    <>
      <Header />
      <div className="app-shell">
        <NavBar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onNewAlbumClick={() => setNewAlbumModalOpen(true)}
        />
        <main>
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route index element={<ExplorePage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="hashtags/:slug" element={<HashtagsPage />} />
            <Route path="viewer/file" element={<FileViewerPage />} />
            <Route path="viewer/content/:postId" element={<ContentViewerPage />} />
            <Route path="profile/:userId" element={<ProfilePageOther />} />
            <Route path="albums/:albumId" element={<AlbumDetailPage />} />
            <Route path="categories/:categoryId" element={<CategoryDetailPage />} />
            <Route path="search" element={<SearchPage />} />

            {/* ✅ NHỮNG ROUTE TỪNG BỊ CHẶN → GIỜ THÀNH PUBLIC */}
            <Route path="following" element={<FollowingPage />} />
            <Route path="my-posts" element={<MyPostsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="my-albums" element={<MyAlbumPage />} />
            <Route path="album/:albumId" element={<AlbumDetailPage />} />
            <Route path="new-post" element={<NewPostPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* 🔒 CHỈ TRANG NÀY YÊU CẦU ĐĂNG NHẬP */}
            <Route
              path="user-manager"
              element={
                <RequireAuth>
                  <UserManager />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
      <Modal
        isOpen={isNewAlbumModalOpen}
        onClose={() => setNewAlbumModalOpen(false)}
      >
        <NewAlbumForm onClose={() => setNewAlbumModalOpen(false)} />
      </Modal>
    </>
  );
}

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNewAlbumModalOpen, setNewAlbumModalOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth pages */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            }
          />

          {/* Main layout */}
          <Route
            path="/*"
            element={
              <MainLayout
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isNewAlbumModalOpen={isNewAlbumModalOpen}
                setNewAlbumModalOpen={setNewAlbumModalOpen}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
