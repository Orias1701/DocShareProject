import React, { useEffect, useState } from "react";
import post_reactionService from "../../../services/post_reactionService";
import post_reportService from "../../../services/post_reportServices";

export default function ReportInfoPanel({ report, extraActions }) {
  const [stats, setStats] = useState({ likes: 0, dislikes: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!report?.post_id) return;
    setLoading(true);
    setErr(null);

    Promise.all([
      post_reactionService.count(report.post_id).catch(() => null),
      post_reportService.countReports(report.post_id).catch(() => null),
    ])
      .then(([reactRes, reportRes]) => {
        const likes = reactRes?.data?.total_likes ?? 0;
        const dislikes = reactRes?.data?.total_dislikes ?? 0;
        const reports = reportRes?.data?.total_reports ?? 0;
        setStats({ likes, dislikes, reports });
      })
      .catch(() => setErr("Không thể tải dữ liệu."))
      .finally(() => setLoading(false));
  }, [report?.post_id]);

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: "var(--color-surface-alt)",
        borderColor: "var(--color-border-soft)",
        color: "var(--color-text)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Thống kê</h3>
        {extraActions}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded"></div>
          <div className="h-4 w-36 bg-white/10 rounded"></div>
          <div className="h-4 w-44 bg-white/10 rounded"></div>
        </div>
      ) : err ? (
        <div className="text-red-400 text-sm">{err}</div>
      ) : (
        <ul className="text-sm space-y-2">
          <li>👍 Likes: <b>{stats.likes}</b></li>
          <li>👎 Dislikes: <b>{stats.dislikes}</b></li>
          <li>🚩 Tổng báo cáo: <b>{stats.reports}</b></li>
        </ul>
      )}
    </div>
  );
}
