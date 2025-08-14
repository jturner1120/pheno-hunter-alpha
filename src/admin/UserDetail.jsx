import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDetail } from '../services/adminService';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDetail(id).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading user details...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Detail</h1>
      <div className="bg-white p-4 border rounded">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Created:</strong> {user.createdDate}</p>
        <p><strong>Last Login:</strong> {user.lastLogin}</p>
      </div>
    </div>
  );
}
