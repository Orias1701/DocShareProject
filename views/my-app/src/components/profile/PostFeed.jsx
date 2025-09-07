import React from 'react';
import PostCard from './PostCard';

/**
 * Component `PostFeed`
 * @description Render một danh sách các `PostCard`.
 */
const PostFeed = ({ posts }) => {
    return (
        <div className="flex flex-col gap-6">
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
};

export default PostFeed;