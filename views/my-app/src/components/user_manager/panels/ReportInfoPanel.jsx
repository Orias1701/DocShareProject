// src/components/user_manager/panels/ReportInfoPanel.jsx
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
        const likes =
          reactRes?.data?.total_likes ??
          reactRes?.data?.likes ??
          reactRes?.total_likes ??
          reactRes?.likes ??
          0;

        const dislikes =
          reactRes?.data?.total_dislikes ??
          reactRes?.data?.dislikes ??
          reactRes?.total_dislikes ??
          reactRes?.dislikes ??
          0;

        const reports =
          reportRes?.data?.total_reports ??
          reportRes?.total_reports ??
          0;

        setStats({ likes, dislikes, reports });
      })
      .catch(() => setErr("Không thể tải dữ liệu."))
      .finally(() => setLoading(false));
  }, [report?.post_id]);

  // Card wrapper giống panel bên phải
  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Thống kê</h3>
        {extraActions || null}
      </div>

      {/* Body */}
      {loading ? (
        // skeleton mượt, tránh giật chữ
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded"></div>
          <div className="h-4 w-36 bg-white/10 rounded"></div>
          <div className="h-4 w-44 bg-white/10 rounded"></div>
        </div>
      ) : err ? (
        <div className="text-red-300 text-sm">{err}</div>
      ) : (
        <ul className="text-sm text-white/90 space-y-2">
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-thumbs-up w-5 text-center"></i>
            Likes: <b className="ml-1">{stats.likes}</b>
          </li>
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-thumbs-down w-5 text-center"></i>
            Dislikes: <b className="ml-1">{stats.dislikes}</b>
          </li>
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-flag w-5 text-center"></i>
            Tổng báo cáo: <b className="ml-1">{stats.reports}</b>
          </li>
        </ul>
      )}
    </div>
  );
}
