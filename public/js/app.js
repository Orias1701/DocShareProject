// public/js/app.js
const API = 'index.php'; // same file, with ?action=

document.addEventListener('DOMContentLoaded', () => {
    loadGroup1();
    loadGroup2();

    // search (basic)
    const searchBox = document.getElementById('searchBox');
    searchBox && searchBox.addEventListener('keyup', (e) => {
        const q = e.target.value.trim().toLowerCase();
        filterTables(q);
    });

    // modal close
    document.addEventListener('click', (ev) => {
        if (ev.target.matches('#modalClose')) closeModal();
        if (ev.target.matches('.modal') && ev.target.classList.contains('open')) closeModal();
    });
});

function fetchJson(url) {
    return fetch(url).then(r => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
    });
}

function loadGroup1() {
    const el = document.getElementById('group1-table');
    el.innerHTML = 'Đang tải...';
    fetchJson(API + '?action=group1')
        .then(resp => {
            if (resp.status !== 'ok') throw new Error(resp.message || 'Lỗi');
            renderGroup1(resp.data);
        })
        .catch(err => el.innerHTML = `<div class="muted">Lỗi: ${escapeHtml(err.message)}</div>`);
}

function loadGroup2() {
    const el = document.getElementById('group2-table');
    el.innerHTML = 'Đang tải...';
    fetchJson(API + '?action=group2')
        .then(resp => {
            if (resp.status !== 'ok') throw new Error(resp.message || 'Lỗi');
            renderGroup2(resp.data);
        })
        .catch(err => el.innerHTML = `<div class="muted">Lỗi: ${escapeHtml(err.message)}</div>`);
}

function renderGroup1(rows) {
    const wrap = document.getElementById('group1-table');
    if (!rows || rows.length === 0) { wrap.innerHTML = '<div class="muted">Không có bài viết.</div>'; return; }

    let html = '<table class="table"><thead><tr>' +
        '<th>Bài viết</th><th>Tác giả (followers)</th><th>Album</th><th>Bình luận</th><th>Phản ứng</th><th>Báo cáo</th>' +
        '</tr></thead><tbody>';

    rows.forEach(r => {
        const titleText = convertHtmlToText(r.title);
        const excerptText = convertHtmlToText(r.excerpt || '');
        html += `<tr>
      <td><div class="post-title" data-postid="${escapeHtml(r.post_id)}">${escapeHtml(titleText)}</div><div class="muted">${escapeHtml(excerptText)}</div></td>
      <td>${escapeHtml(r.author_name || '—')}<div class="muted">${escapeHtml(r.author_followers || 0)} người theo dõi</div></td>
      <td>${escapeHtml(r.album_name || '—')}</td>
      <td>${escapeHtml(r.comment_count || 0)}</td>
      <td>${escapeHtml(r.reaction_count || 0)}</td>
      <td>${escapeHtml(r.report_count || 0)}</td>
    </tr>`;
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;
    attachPostClicks();
}

function renderGroup2(rows) {
    const wrap = document.getElementById('group2-table');
    if (!rows || rows.length === 0) { wrap.innerHTML = '<div class="muted">Không có bài viết.</div>'; return; }

    let html = '<table class="table"><thead><tr>' +
        '<th>Bài viết</th><th>Danh mục</th><th>Hashtags</th><th>Album</th><th>Bình luận</th><th>Phản ứng</th>' +
        '</tr></thead><tbody>';

    rows.forEach(r => {
        const titleText = convertHtmlToText(r.title);
        const excerptText = convertHtmlToText(r.excerpt || '');
        html += `<tr>
      <td><div class="post-title" data-postid="${escapeHtml(r.post_id)}">${escapeHtml(titleText)}</div><div class="muted">${escapeHtml(excerptText)}</div></td>
      <td>${escapeHtml(r.category_name || '—')}</td>
      <td>${escapeHtml(r.hashtags || '')}</td>
      <td>${escapeHtml(r.album_name || '—')}</td>
      <td>${escapeHtml(r.comment_count || 0)}</td>
      <td>${escapeHtml(r.reaction_count || 0)}</td>
    </tr>`;
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;
    attachPostClicks();
}

function attachPostClicks() {
    document.querySelectorAll('.post-title').forEach(el => {
        el.onclick = () => {
            const pid = el.getAttribute('data-postid');
            openPostDetail(pid);
        };
    });
}

function openPostDetail(postId) {
    const modal = document.getElementById('postModal');
    const content = document.getElementById('modalContent') || document.createElement('div');
    if (!content.id) content.id = 'modalContent';

    if (!modal.classList.contains('open')) modal.classList.add('open');
    content.innerHTML = '<div class="muted">Đang tải chi tiết...</div>';
    if (!document.getElementById('modalContent')) {
        document.querySelector('.modal-inner').appendChild(content);
    }

    fetchJson(API + '?action=post_detail_api&post_id=' + encodeURIComponent(postId))
        .then(resp => {
            if (resp.status !== 'ok') throw new Error(resp.message || 'Not found');
            renderPostModal(resp.data);
        })
        .catch(err => {
            content.innerHTML = `<div class="muted">Lỗi: ${escapeHtml(err.message)}</div>`;
        });
}

function renderPostModal(data) {
    const modal = document.getElementById('postModal');
    const content = document.getElementById('modalContent');
    const p = data.post;
    
    const titleText = convertHtmlToText(p.title);
    const excerptText = convertHtmlToText(p.excerpt || '');
    
    let html = `<h2>${escapeHtml(titleText)}</h2>`;
    html += `<p class="muted">Đăng: ${escapeHtml(p.created_at || '')} — Album: ${escapeHtml(p.album_name || '—')} — Tác giả: ${escapeHtml(p.author_name || '—')}</p>`;
    html += `<div style="margin:10px 0">${p.content || ''}</div>`;
    html += `<h3>Danh mục</h3><div>${escapeHtml(p.category_name || '—')}</div>`;

    html += `<h3>Hashtags</h3>`;
    if (data.hashtags && data.hashtags.length) {
        html += '<div>';
        data.hashtags.forEach(h => { html += `<span class="badge">${escapeHtml(h.hashtag_name)}</span>`; });
        html += '</div>';
    } else html += '<div class="muted">Không có hashtag</div>';

    html += `<h3>Bình luận (${data.comments.length})</h3>`;
    if (data.comments.length) {
        html += '<ul>';
        data.comments.forEach(c => {
            html += `<li><strong>${escapeHtml(c.full_name || c.user_id)}</strong> <span class="muted">(${escapeHtml(c.created_at)})</span><div>${escapeHtml(c.content)}</div></li>`;
        });
        html += '</ul>';
    } else html += '<div class="muted">Không có bình luận</div>';

    html += `<h3>Phản ứng (${data.reactions.length})</h3>`;
    if (data.reactions.length) {
        html += '<ul>';
        data.reactions.forEach(r => {
            html += `<li>${escapeHtml(r.full_name || r.user_id)} — <em>${escapeHtml(r.reaction_type)}</em> <span class="muted">(${escapeHtml(r.created_at)})</span></li>`;
        });
        html += '</ul>';
    } else html += '<div class="muted">Không có phản ứng</div>';

    html += `<h3>Báo cáo (${data.reports.length})</h3>`;
    if (data.reports.length) {
        html += '<ul>';
        data.reports.forEach(rp => {
            html += `<li><strong>${escapeHtml(rp.full_name || rp.user_id)}</strong> — ${escapeHtml(rp.reason)} <span class="muted">(${escapeHtml(rp.created_at)})</span></li>`;
        });
        html += '</ul>';
    } else html += '<div class="muted">Không có báo cáo</div>';

    html += `<div class="muted" style="margin-top:12px">Người theo dõi tác giả: ${escapeHtml(String(data.author_follower_count || 0))}</div>`;

    content.innerHTML = html;
}

function closeModal() {
    const modal = document.getElementById('postModal');
    modal.classList.remove('open');
}

function filterTables(query) {
    query = (query || '').trim().toLowerCase();
    document.querySelectorAll('.table tbody tr').forEach(tr => {
        const text = tr.textContent.toLowerCase();
        tr.style.display = text.indexOf(query) === -1 ? 'none' : '';
    });
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"'`=\/]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' }[c];
    });
}

// Thêm hàm này vào cuối file của bạn
function convertHtmlToText(html) {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}