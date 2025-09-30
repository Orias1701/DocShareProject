// src/pages/viewer/ContentViewerPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import ViewPost from "../../components/viewer/ViewPost"; // nhớ path

export default function ContentViewerPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || null;

  return (
    <ViewPost
      postId={postId}
      currentUserId={currentUserId}
      backHref={-1}
    />
  );
}
