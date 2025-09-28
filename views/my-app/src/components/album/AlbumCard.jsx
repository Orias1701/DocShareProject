import React from "react";
import { Link } from "react-router-dom";

const FALLBACK = "https://via.placeholder.com/640x360?text=Album";

export default function AlbumCard({ post: a = {} }) {
  const id = a.album_id || a.id;
  const title = a.title || a.album_name || "Album";
  const link = a.link || `/my-albums/${id}`;
  const thumb = a.banner || a.url_thumbnail || FALLBACK;
  const time = a.uploadTime || a.created_at || "";

  return (
    <div className="bg-[#1C2028] border border-gray-700/80 rounded-xl p-4 text-white">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <img
            src={a.authorAvatar || "https://i.pravatar.cc/40?img=2"}
            className="w-8 h-8 rounded-full"
            alt="owner"
          />
          <div className="font-semibold truncate">
            {a.authorName || "Tôi"}
          </div>
        </div>
      </div>

      <Link to={link} className="block group">
        <img
          src={thumb}
          alt={title}
          className="w-full h-44 object-cover rounded-xl"
          onError={(e) => (e.currentTarget.src = FALLBACK)}
        />
      </Link>

      <div className="mt-3">
        <Link to={link} className="font-bold line-clamp-2 hover:underline">
          {title}
        </Link>
        {time && <div className="text-xs text-gray-400 mt-1">{time}</div>}
      </div>
    </div>
  );
}
