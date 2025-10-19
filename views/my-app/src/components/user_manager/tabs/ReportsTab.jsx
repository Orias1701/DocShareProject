import React from "react";

import ReportItem from "../../../components/user_manager/list/ReportItem";
import ReportInfoPanel from "../../../components/user_manager/panels/ReportInfoPanel";
import ConfirmModal from "../../common/ConfirmModal";

import post_reportService from "../../../services/post_reportServices";
import postService from "../../../services/postService";

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

  const [selectedId, setSelectedId] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [confirm, setConfirm] = React.useState({ open: false, target: null });

  const [banner, setBanner] = React.useState(null);
  const showBanner = (type, text, ms = 2200) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  const [selectedPost, setSelectedPost] = React.useState(null);
  const [loadingPost, setLoadingPost] = React.useState(false);
  const [downloadBusy, setDownloadBusy] = React.useState(false);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const currentReport = React.useMemo(
    () => data.find((r) => r.id === selectedId) || null,
    [data, selectedId]
  );

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await post_reportService.listAll();
      if (res?.status === "success" && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiReport);
        setData(mapped);
        setFetched(true);
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
  }, []);

  React.useEffect(() => setPage(1), [fetched]);

  React.useEffect(() => {
    const run = async () => {
      if (!currentReport?.post_id) {
        setSelectedPost(null);
        return;
      }
      try {
        setLoadingPost(true);
        const post = await postService.getByIdCompact(currentReport.post_id);
        setSelectedPost(post || null);
      } catch {
        setSelectedPost(null);
      } finally {
        setLoadingPost(false);
      }
    };
    run();
  }, [currentReport?.post_id]);

  const removeFromLocal = (reportId) => {
    setData((prev) => {
      const next = prev.filter((x) => x.id !== reportId);
      setSelectedId((prevSel) => (prevSel === reportId ? null : prevSel));
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotalPages));
      return next;
    });
  };

  const deleteReportedPost = async (report) => {
    const postId = report?.post_id;
    if (!postId) throw new Error("Missing post_id on report");
    try {
      const resGet = await postService.remove(postId);
      const okGet =
        resGet?.status === "ok" ||
        resGet?.status === "success" ||
        resGet === true ||
        resGet?.message?.toLowerCase?.().includes("deleted") ||
        resGet?.message?.toLowerCase?.().includes("đã xoá");
      if (!okGet) throw new Error(resGet?.message || "Delete failed");
    } catch {
      const resPost = await postService.removeViaPost(postId);
      const okPost =
        resPost?.status === "ok" ||
        resPost?.status === "success" ||
        resPost === true ||
        resPost?.message?.toLowerCase?.().includes("deleted") ||
        resPost?.message?.toLowerCase?.().includes("đã xoá");
      if (!okPost) throw new Error(resPost?.message || "Delete failed");
    }

    try {
      await post_reportService?.resolve?.({
        report_id: report.id,
        action: "post_deleted",
        resolution_note: "Post removed by moderator.",
      });
    } catch {}

    removeFromLocal(report.id);
  };

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
      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report List</h2>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline"
              onClick={fetchReports}
              disabled={loading}
              title="Refresh"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

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
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        )}

        {error && !data.length && (
          <div className="panel panel-muted text-red-300">
            Failed to load reports: {error}
            <button onClick={fetchReports} className="btn btn-primary mt-3">
              Retry
            </button>
          </div>
        )}

        {fetched && !data.length && (
          <div className="panel panel-muted">No reports found.</div>
        )}

        <div className="space-y-3">
          {pageData.map((r) => {
            const active = r.id === selectedId;
            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(r.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedId(r.id)}
                className={`rounded-xl transition ring-0 ${active ? "ring-1 ring-white/40" : ""}`}
              >
                <ReportItem
                  report={r}
                  compact
                  active={active}
                  onEdit={() => alert("Edit report")}
                  onDelete={() => setConfirm({ open: true, target: r })}
                />
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <div>
              Page <strong>{page}</strong> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <aside className="space-y-3">
        {selectedId ? (
          <ReportInfoPanel
            report={currentReport}
            post={selectedPost}
            loadingPost={loadingPost}
            extraActions={
              currentReport?.post_id ? (
                <button
                  onClick={handleDownloadPost}
                  disabled={downloadBusy}
                  className="btn btn-outline disabled:opacity-40"
                  title="Download reported post"
                >
                  {downloadBusy ? "Downloading..." : "Download post"}
                </button>
              ) : null
            }
          />
        ) : (
          <div className="panel panel-muted">Chọn một báo cáo để xem chi tiết.</div>
        )}
      </aside>

      {/* Confirm delete reported post */}
      <ConfirmModal
        open={confirm.open}
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
