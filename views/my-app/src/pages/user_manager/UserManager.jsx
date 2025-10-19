// src/pages/UserManager.jsx
import React, { useState } from "react";
import TabBar from "../../components/user_manager/TabBar";

// Mỗi tab là 1 component tự lo fetch + list + panel riêng
import UsersTab from "../../components/user_manager/tabs/UsersTab";
import PostsTab from "../../components/user_manager/tabs/PostsTab";
import AlbumsTab from "../../components/user_manager/tabs/AlbumsTab";
import CategoriesTab from "../../components/user_manager/tabs/CategoriesTab";
import ReportsTab from "../../components/user_manager/tabs/ReportsTab";

export default function UserManager() {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="min-h-screen 
        bg-[var(--color-bg)]
        text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6
            text-[var(--color-text)]
            border-b border-[var(--color-border-soft)] pb-3">Dashboard Manager</h1>

        <TabBar
          tabs={["user", "posts", "album", "categories", "reports"]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "user" && <UsersTab />}
        {activeTab === "posts" && <PostsTab />}
        {activeTab === "album" && <AlbumsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </div>
  );
}
