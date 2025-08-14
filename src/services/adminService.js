// Placeholder service for admin user management
// Replace with Firebase/Firestore integration

export async function getUsers() {
  // TODO: Fetch users from Firestore with role/status filters
  return [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'ROLE_ADMIN',
      status: 'active',
      createdDate: '2025-01-01',
      lastLogin: '2025-08-10',
    },
    // ...more users
  ];
}

export async function getUserDetail(id) {
  // TODO: Fetch user detail from Firestore
  return {
    id,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ROLE_ADMIN',
    status: 'active',
    createdDate: '2025-01-01',
    lastLogin: '2025-08-10',
  };
}
