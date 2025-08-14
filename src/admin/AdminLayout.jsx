import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout flex min-h-screen bg-gray-50">
      <nav className="admin-nav w-64 bg-white border-r flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <NavLink to="/admin/dashboard" className="mb-2" activeClassName="font-semibold text-blue-600">Dashboard</NavLink>
        <NavLink to="/admin/users" className="mb-2" activeClassName="font-semibold text-blue-600">Users</NavLink>
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
