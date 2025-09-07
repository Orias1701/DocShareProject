import React from 'react';

/**
 * Component `PostCard`
 * @description Hiển thị một card bài viết hoàn chỉnh trên trang profile.
 */
const PostCard = ({ post }) => {
    return (
        <div className="bg-[#1621] p-5 rounded-lg border border-[#2d2d33]">
            {/* Header của bài viết */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.realName} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-white">{post.author.realName}</p>
                        <p className="text-xs text-gray-500">{post.postDate}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                    <i className="fa-solid fa-ellipsis"></i>
                </button>
            </div>

            {/* Nội dung các "mangle" bên trong bài viết */}
            <div className="space-y-3 mb-4">
                {post.mangles.map((mangle, index) => (
                    <div key={index} className="flex items-center gap-4 bg-[#2C323B] p-3 rounded-lg">
                        <img src={mangle.image} alt={mangle.title} className="w-16 h-16 rounded-md object-cover" />
                        <div>
                            <p className="font-semibold text-sm text-white">{mangle.title}</p>
                            <p className="text-xs text-gray-400">{mangle.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lượt tương tác */}
            <div className="flex items-center justify-between text-sm text-gray-400 border-b border-[#2d2d33] pb-2 mb-2">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-heart text-pink-500"></i>
                    <span>{post.reactionCount}</span>
                </div>
                <span>{post.commentCount}</span>
            </div>

            {/* Các nút Like, Comment, Share */}
            <div className="grid grid-cols-3 gap-2 text-gray-300 font-medium">
                <button className="flex items-center justify-center gap-2 py-2 rounded-md hover:bg-[#2C323B]">
                    <i className="fa-regular fa-thumbs-up"></i>
                    <span>Like</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 rounded-md hover:bg-[#2C323B]">
                    <i className="fa-regular fa-comment"></i>
                    <span>Comment</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 rounded-md hover:bg-[#2C323B]">
                    <i className="fa-solid fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;