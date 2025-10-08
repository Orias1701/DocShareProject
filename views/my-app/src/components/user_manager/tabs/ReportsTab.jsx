// src/pages/user_manager/tabs/ReportsTab.jsx
import React from "react";

import ReportItem from "../../../components/user_manager/list/ReportItem";
import ReportInfoPanel from "../../../components/user_manager/panels/ReportInfoPanel";
import ConfirmModal from "../../common/ConfirmModal";

import post_reportService from "../../../services/post_reportServices"; // dùng để list (và resolve nếu có)
import postService from "../../../services/postService"; // dùng để lấy post, download, delete

const mapApiReport = (r) => ({
  id: r.report_id,
  post_id: r.post_id,
  title: `Report: ${r.post_title || r.post_id}`,
  description: `Reason: ${r.reason} — by ${r.reporter_name}`,
  createdAt: r.report_created_at,
  status: r.status || "open",
  raw: r,
});

export default function ReportsTab() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState();

  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [confirm, setConfirm] = React.useState({ open: false, target: null });

  // 🔔 banner gọn
  const [banner, setBanner] = React.useState(null); // {type:'success'|'error'|'info', text}
  const showBanner = (type, text, ms = 2200) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // dữ liệu post liên quan tới report đang chọn
  const [selectedPost, setSelectedPost] = React.useState(null);
  const [loadingPost, setLoadingPost] = React.useState(false);
  const [downloadBusy, setDownloadBusy] = React.useState(false);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const currentReport =
    data.find((r) => r.id === selectedId) ?? pageData[0] ?? null;

  // ====== FETCH LIST ======
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await post_reportService.listAll();
      if (res?.status === "success" && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiReport);
        setData(mapped);
        setFetched(true);
        setSelectedId((prev) => prev ?? mapped[0]?.id);
      } else {
        throw new Error(res?.error || "Invalid report list response");
      }
    } catch (e) {
      setError(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchReports();
  }, []); // once

  React.useEffect(() => setPage(1), [fetched]);

  // ====== FETCH POST COMPACT KHI ĐỔI SELECTION ======
  const fetchSelectedPost = React.useCallback(async () => {
    if (!currentReport?.post_id) {
      setSelectedPost(null);
      return;
    }
    try {
      setLoadingPost(true);
      const post = await postService.getByIdCompact(currentReport.post_id);
      setSelectedPost(post || null);
    } catch (_e) {
      setSelectedPost(null);
    } finally {
      setLoadingPost(false);
    }
  }, [currentReport?.post_id]);

  React.useEffect(() => {
    fetchSelectedPost();
  }, [fetchSelectedPost]);

  // ====== CẬP NHẬT UI SAU XOÁ (không reload) ======
  const removeFromLocal = (reportId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== reportId);

      // cập nhật selection nếu đang trỏ vào report vừa xoá
      setSelectedId((prevSel) => (prevSel === reportId ? next[0]?.id : prevSel));

      // điều chỉnh page nếu trang hiện tại rỗng
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  // ====== XOÁ BÀI VIẾT BỊ REPORT (dùng postService) ======
  const deleteReportedPost = async (report) => {
    const postId = report?.post_id;
    if (!postId) throw new Error("Missing post_id on report");

    // 1) Thử GET: ?action=delete_post&post_id=...
    try {
      const resGet = await postService.remove(postId);
      const ok =
        resGet?.status === "ok" ||
        resGet?.status === "success" ||
        resGet === true ||
        resGet?.message?.toLowerCase?.().includes("deleted") ||
        resGet?.message?.toLowerCase?.().includes("đã xoá");
      if (!ok) throw new Error(resGet?.message || "Delete failed");
    } catch (_) {
      // 2) Fallback POST body { post_id }: action=delete_post
      const resPost = await postService.removeViaPost(postId);
      const ok2 =
        resPost?.status === "ok" ||
        resPost?.status === "success" ||
        resPost === true ||
        resPost?.message?.toLowerCase?.().includes("deleted") ||
        resPost?.message?.toLowerCase?.().includes("đã xoá");
      if (!ok2) throw new Error(resPost?.message || "Delete failed");
    }

    // 3) (Tuỳ chọn) Resolve report nếu BE có API, không chặn UI nếu fail
    try {
      await post_reportService?.resolve?.({
        report_id: report.id,
        action: "post_deleted",
        resolution_note: "Post removed by moderator.",
      });
    } catch {}

    // 4) Cập nhật UI
    removeFromLocal(report.id);
  };

  // ====== DOWNLOAD POST ======
  const handleDownloadPost = async () => {
    const pid = currentReport?.post_id;
    if (!pid) return;
    try {
      setDownloadBusy(true);
      await postService.download(pid);
    } catch (e) {
      showBanner("error", e?.message || "Download failed");
    } finally {
      setDownloadBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report List</h2>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/20 text-white/90 hover:text-white"
              onClick={fetchReports}
              disabled={loading}
              title="Refresh reports"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

        {/* 🔔 banner */}
        {banner && (
          <div
            className={
              "px-3 py-2 rounded-md text-sm border " +
              (banner.type === "success"
                ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                : banner.type === "error"
                ? "bg-red-900/30 text-red-200 border-red-700/40"
                : "bg-white/5 text-white/80 border-white/10")
            }
          >
            {banner.text}
          </div>
        )}

        {loading && !fetched && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && data.length === 0 && (
          <div className="text-red-300 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            Failed to load reports: {error}
            <div className="mt-3">
              <button
                onClick={fetchReports}
                className="px-3 py-1.5 rounded-md bg-white text-black"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {fetched && data.length === 0 && (
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-xl p-4">
            No reports found.
          </div>
        )}

        <div className="space-y-3">
          {pageData.map((r) => (
            <ReportItem
              key={r.id}
              report={r}
              compact
              active={r.id === selectedId}
              onClick={() => setSelectedId(r.id)} // chọn giống AlbumsTab
              onEdit={() => alert("Edit report")}
              onDelete={() => setConfirm({ open: true, target: r })}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="text-sm text-white/80">
              Page <span className="font-semibold">{page}</span> / {totalPages}
            </div>
            <button
              className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-3">
        {currentReport ? (
          <ReportInfoPanel
            report={currentReport}
            post={selectedPost}
            loadingPost={loadingPost}
            extraActions={
              currentReport?.post_id ? (
                <button
                  onClick={handleDownloadPost}
                  disabled={downloadBusy}
                  className="px-3 py-1.5 rounded-md border border-white/20 text-white/90 hover:text-white disabled:opacity-40"
                  title="Download reported post (content file/bundle)"
                >
                  {downloadBusy ? "Downloading..." : "Download post"}
                </button>
              ) : null
            }
          />
        ) : (
          <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
            Nothing to show here.
          </div>
        )}
      </aside>

      <ConfirmModal
        open={confirm.open}
        // rõ nghĩa: đang xoá BÀI VIẾT bị report (không phải record report)
        message={`Delete the REPORTED post (${confirm.target?.post_id || "unknown"})?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          const target = confirm.target;
          try {
            await deleteReportedPost(target);
            showBanner("success", "Đã xoá bài viết bị report.");
          } catch (e) {
            showBanner("error", e?.message || "Delete failed");
          } finally {
            setConfirm({ open: false, target: null });
          }
        }}
      />
    </div>
  );
}
