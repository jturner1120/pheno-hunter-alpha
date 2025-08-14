import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/adminService';
import { NavLink } from 'react-router-dom';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>{user.createdDate}</td>
              <td>{user.lastLogin}</td>
              <td>
                <NavLink to={`/admin/users/${user.id}`}>View</NavLink>
                {/* Lock/Unlock, Reset Password, Resend Verification actions to be added */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
