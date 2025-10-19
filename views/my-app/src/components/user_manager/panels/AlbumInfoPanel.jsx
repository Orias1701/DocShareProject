// src/components/user_manager/panels/AlbumInfoPanel.jsx
import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_THUMB =
  "https://play-lh.googleusercontent.com/oeN7NUZCJ4jRnr9iGSvkDbgDOp9vFx-4Q9bpMMxXdeLIngX6OiO6Dokf9IPon1UXlO4=w240-h480-rw";

export default function AlbumInfoPanel({ album }) {
  // Chuẩn hóa dữ liệu đầu vào (list hoặc detail từ BE)
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
      <div
        className="p-6 rounded-xl border"
        style={{
          background: "var(--color-card-bg)",
          borderColor: "var(--color-card-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        Nothing to show here.
      </div>
    );
  }

  const thumb = a.thumbnail || FALLBACK_THUMB;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: "var(--color-card-bg)",
        borderColor: "var(--color-card-border)",
        color: "var(--color-text)",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0"
          style={{
            background: "var(--color-muted-bg)",
            border: "1px solid var(--color-border-soft)",
          }}
        >
          <img
            src={thumb}
            alt={a.name || "Album thumbnail"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_THUMB;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1 truncate" title={a.name}>
            {a.name || "(Untitled album)"}
          </h3>

          <div
            className="text-xs space-y-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {a.id && (
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>
                  Album ID:
                </span>{" "}
                <span style={{ color: "var(--color-text)" }}>{a.id}</span>
              </div>
            )}

            {a.userId && (
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>
                  Owner:
                </span>{" "}
                <Link
                  to={`/profile/${encodeURIComponent(a.userId)}`}
                  className="hover:underline"
                  style={{ color: "var(--color-link)" }}
                  title="Xem hồ sơ"
                >
                  {a.userId}
                </Link>
              </div>
            )}

            {a.createdAt && (
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>
                  Created:
                </span>{" "}
                <span style={{ color: "var(--color-text)" }}>
                  {a.createdAt}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {a.description && (
        <div className="mt-4">
          <div
            className="text-sm whitespace-pre-line"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {a.description}
          </div>
        </div>
      )}
    </div>
  );
}
