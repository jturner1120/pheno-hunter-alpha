// Placeholder service for admin user management
// Replace with Firebase/Firestore integration


import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function getUsers() {
  // Fetch users from Firestore 'users' collection
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      username: data.username || data.email,
      email: data.email,
      role: data.role,
      status: data.status,
      createdDate: data.createdDate,
      lastLogin: data.lastLogin,
    };
  });
}


export async function getUserDetail(id) {
  // Fetch user detail from Firestore 'users' collection
  const userRef = doc(db, 'users', id);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    username: data.username || data.email,
    email: data.email,
    role: data.role,
    status: data.status,
    createdDate: data.createdDate,
    lastLogin: data.lastLogin,
  };
}
