// Admin audit logging service
// Logs admin actions to Firestore 'admin_audit_log' collection

import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logAdminAction({ actorId, entity, action, before, after }) {
  const logRef = collection(db, 'admin_audit_log');
  await addDoc(logRef, {
    actorId,
    entity,
    action,
    before,
    after,
    timestamp: serverTimestamp(),
  });
}
