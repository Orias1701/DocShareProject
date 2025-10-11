// src/components/user_manager/panels/AlbumInfoPanel.jsx
import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_THUMB =
  "https://play-lh.googleusercontent.com/oeN7NUZCJ4jRnr9iGSvkDbgDOp9vFx-4Q9bpMMxXdeLIngX6OiO6Dokf9IPon1UXlO4=w240-h480-rw";

export default function AlbumInfoPanel({ album }) {
  // album có thể được truyền ở 2 dạng:
  // - từ list đã map: { id, name, description, thumbnail, userId, createdAt, raw }
  // - từ detail BE:   { album_id, album_name, description, url_thumbnail, user_id, created_at }
  const a = React.useMemo(() => {
    if (!album) return null;
    const raw = album.raw || album;
    return {
      id: album.id || raw.album_id,
      name: album.name || raw.album_name,
      description: album.description ?? raw.description ?? "",
      thumbnail: album.thumbnail || raw.url_thumbnail || "",
      userId: album.userId || raw.user_id,
      createdAt: album.createdAt || raw.created_at,
      raw,
    };
  }, [album]);

  if (!a) {
    return (
      <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
        Nothing to show here.
      </div>
    );
  }

  const thumb = a.thumbnail || FALLBACK_THUMB;

  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-28 h-28 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/30">
          <img
            src={thumb}
            alt={a.name || "Album thumbnail"}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_THUMB)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1 truncate" title={a.name}>
            {a.name || "(Untitled album)"}
          </h3>
          <div className="text-xs text-white/60 space-y-1">
            {a.id && (
              <div>
                <span className="text-white/50">Album ID:</span>{" "}
                <span className="text-white/80">{a.id}</span>
              </div>
            )}
            {a.userId && (
              <div>
                <span className="text-white/50">Owner:</span>{" "}
                <Link
                  to={`/profile/${encodeURIComponent(a.userId)}`}
                  className="text-blue-300 hover:underline"
                  title="Xem hồ sơ"
                >
                  {a.userId}
                </Link>
              </div>
            )}
            {a.createdAt && (
              <div>
                <span className="text-white/50">Created:</span>{" "}
                <span className="text-white/80">{a.createdAt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {a.description && (
        <div className="mt-4">
          <div className="text-sm text-white/70 whitespace-pre-line">
            {a.description}
          </div>
        </div>
      )}
    </div>
  );
}
