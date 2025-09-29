// src/components/profile/ProfileHeader.jsx
export default function ProfileHeader({
  avatar,
  realName,
  userName,
  followerCount,
  birthday,
  onEdit,
  actionButton,
}) {
  return (
    <div className="flex items-center gap-6">
      <img src={avatar} alt={realName} className="w-20 h-20 rounded-full" />
      <div>
        <h2 className="text-xl font-bold">{realName}</h2>
        <p className="text-gray-400">@{userName}</p>
        <p className="text-gray-400">Followers: {followerCount}</p>
        <p className="text-gray-400">Birthday: {birthday}</p>
      </div>

      <div className="ml-auto flex gap-3">
        {actionButton}
        {onEdit && (
          <button
            onClick={onEdit}   // 👈 GỌI hàm onEdit
            className="px-4 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
