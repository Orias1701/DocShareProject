// src/hooks/useAuth.jsx
import { useEffect, useState } from 'react';

const API_ME_URL = 'http://localhost:3000/public/index.php?action=api_me';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(API_ME_URL, {
          method: 'GET',
          credentials: 'include', // gửi cookie session
          headers: {
            'Accept': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ok') {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return { user, loading, setUser };
}
