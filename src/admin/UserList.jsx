import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/adminService';
import { logAdminAction } from '../services/auditLogService';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { NavLink } from 'react-router-dom';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: adminUser } = useAuth();

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleLockUnlock = async (userObj, lock) => {
    const userRef = doc(db, 'users', userObj.id);
    const before = { ...userObj };
    await updateDoc(userRef, { status: lock ? 'locked' : 'active' });
    const after = { ...userObj, status: lock ? 'locked' : 'active' };
    await logAdminAction({
      actorId: adminUser?.id,
      entity: 'user',
      action: lock ? 'lock_account' : 'unlock_account',
      before,
      after,
    });
    // Refresh users
    getUsers().then(setUsers);
  };

  const handleResetPassword = async (userObj) => {
    // Placeholder: In production, trigger secure password reset email via Firebase Admin SDK
    await logAdminAction({
      actorId: adminUser?.id,
      entity: 'user',
      action: 'force_password_reset',
      before: { ...userObj },
      after: { ...userObj },
    });
    alert('Password reset link sent (mock).');
  };

  const handleResendVerification = async (userObj) => {
    // Placeholder: In production, trigger email verification via Firebase Admin SDK
    await logAdminAction({
      actorId: adminUser?.id,
      entity: 'user',
      action: 'resend_verification',
      before: { ...userObj },
      after: { ...userObj },
    });
    alert('Verification email resent (mock).');
  };

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
              <td className="space-x-2">
                <NavLink to={`/admin/users/${user.id}`}>View</NavLink>
                {user.status === 'active' ? (
                  <button className="text-red-600" onClick={() => handleLockUnlock(user, true)}>Lock</button>
                ) : (
                  <button className="text-green-600" onClick={() => handleLockUnlock(user, false)}>Unlock</button>
                )}
                <button className="text-blue-600" onClick={() => handleResetPassword(user)}>Reset Password</button>
                <button className="text-purple-600" onClick={() => handleResendVerification(user)}>Resend Verification</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
