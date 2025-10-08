import React from "react";
import PropTypes from "prop-types";
import AlbumCard from "./AlbumCard"; // card tối giản cho album

/**
 * AlbumSection — lưới hiển thị danh sách album.
 * Props:
 *  - title: tiêu đề section
 *  - albums: mảng album (đã map) [{ id, title, banner/url_thumbnail, link, ... }]
 *  - emptyText: text khi rỗng
 *  - headerRight: node hiển thị bên phải tiêu đề (button/filter...)
 *  - wrapClassName / gridClassName: custom class
 *  - CardComponent: component để render 1 album (mặc định: AlbumCard)
 *  - onDeleted: (albumId) => void — callback khi xóa album thành công
 *  - forceIsOwner: boolean — nếu true, truyền isOwner={true} xuống AlbumCard
 */
export default function AlbumSection({
  title,
  albums = [],
  emptyText = "Chưa có album nào.",
  headerRight = null,
  wrapClassName = "w-full mb-12",
  gridClassName = "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  CardComponent = AlbumCard,
  onDeleted,
  forceIsOwner = false,
}) {
  const items = Array.isArray(albums) ? albums : [];

  return (
    <section aria-label={title} className={wrapClassName}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white text-start">{title}</h2>
        {headerRight}
      </div>

      {items.length === 0 ? (
        <div className="text-start text-gray-400 border border-dashed border-gray-700/60 rounded-xl py-10 px-6">
          {emptyText}
        </div>
      ) : (
        <div className={gridClassName}>
          {items.map((alb) => (
            <CardComponent
              key={alb.id || alb.album_id}
              post={alb}
              onDeleted={onDeleted}          // ✅ thêm để callback về MyAlbumPage
              isOwner={forceIsOwner === true} // ✅ truyền cờ cho menu
            />
          ))}
        </div>
      )}
    </section>
  );
}

AlbumSection.propTypes = {
  title: PropTypes.string.isRequired,
  albums: PropTypes.array,
  emptyText: PropTypes.string,
  headerRight: PropTypes.node,
  wrapClassName: PropTypes.string,
  gridClassName: PropTypes.string,
  CardComponent: PropTypes.elementType,
  onDeleted: PropTypes.func,
  forceIsOwner: PropTypes.bool,
};
