// src/components/album/AlbumCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import AlbumOptionsMenu from "./AlbumOptionsMenu"; // 👈 menu Sửa/Xóa

const FALLBACK =
  "https://play-lh.googleusercontent.com/oeN7NUZCJ4jRnr9iGSvkDbgDOp9vFx-4Q9bpMMxXdeLIngX6OiO6Dokf9IPon1UXlO4=w240-h480-rw";

/**
 * Props:
 *  - post: object album đã map (giữ tên prop cũ để không phải sửa chỗ gọi)
 *  - onDeleted: (albumId) => void
 *  - onEdit: (albumObj) => void
 */
export default function AlbumCard({ post: a = {}, onDeleted, onEdit }) {
  const id = a.album_id || a.id;
  const title = a.title || a.album_name || "Album";
  const link = a.link || `/my-albums/${id}`;
  const thumb = a.banner || a.url_thumbnail || FALLBACK;
  const time = a.uploadTime || a.created_at || "";

  const ownerId = a.user_id || a.owner_id || a.authorId || null;

  return (
    <div className="bg-[#1C2028] border border-gray-700/80 rounded-xl p-4 text-white">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={
              a.authorAvatar ||
              "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg"
            }
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            alt="owner"
            onError={(e) => (e.currentTarget.src = FALLBACK)}
          />
          <div className="font-semibold truncate">{a.authorName || "Tôi"}</div>
        </div>

        {/* 👇 Menu Sửa/Xóa */}
        <AlbumOptionsMenu
          albumId={id}
          ownerId={ownerId}
          isOwner={true}
          onEdit={() => onEdit?.(a)}
          onDeleted={onDeleted}
        />
      </div>

      {/* Thumbnail */}
      <Link to={link} className="block group">
        <img
          src={thumb}
          alt={title}
          className="w-full h-44 object-cover rounded-xl"
          onError={(e) => (e.currentTarget.src = FALLBACK)}
        />
      </Link>

      {/* Body */}
      <div className="mt-3">
        <Link to={link} className="font-bold line-clamp-2 hover:underline">
          {title}
        </Link>
        {time && <div className="text-xs text-gray-400 mt-1">{time}</div>}
      </div>
    </div>
  );
}
