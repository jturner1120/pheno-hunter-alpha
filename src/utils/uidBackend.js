// UID Data Model & Backend Utilities for Pheno Hunter
// Step 1: Data Model & Backend for UID system

import { db, serverTimestamp } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  runTransaction,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// --- Strain Registry ---
export const getStrainRegistryRef = (userId) => collection(db, 'strain_registry_' + userId);

export const addStrainToRegistry = async (userId, strainName, strainCode) => {
  const registryRef = getStrainRegistryRef(userId);
  const docRef = doc(registryRef, strainName.toLowerCase());
  await setDoc(docRef, {
    strain_name: strainName,
    strain_code: strainCode,
    created_at: serverTimestamp(),
  }, { merge: true });
};

export const getStrainCode = async (userId, strainName) => {
  const registryRef = getStrainRegistryRef(userId);
  const docRef = doc(registryRef, strainName.toLowerCase());
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().strain_code : null;
};

// --- Seed Sequence Counter ---
export const getSeedCounterRef = (userId, strainCode, dateBorn) =>
  doc(db, 'counters_seed_' + userId, `${strainCode}_${dateBorn}`);

export const getNextSeedSeq = async (userId, strainCode, dateBorn) => {
  const counterRef = getSeedCounterRef(userId, strainCode, dateBorn);
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let nextSeq = 1;
    if (counterSnap.exists()) {
      nextSeq = (counterSnap.data().seq || 0) + 1;
    }
    transaction.set(counterRef, { seq: nextSeq }, { merge: true });
    return nextSeq;
  });
};

// --- Clone Sequence Counter ---
export const getCloneCounterRef = (userId, parentPlantId) =>
  doc(db, 'counters_clone_' + userId, parentPlantId);

export const getNextCloneSeq = async (userId, parentPlantId) => {
  const counterRef = getCloneCounterRef(userId, parentPlantId);
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let nextSeq = 1;
    if (counterSnap.exists()) {
      nextSeq = (counterSnap.data().seq || 0) + 1;
    }
    transaction.set(counterRef, { seq: nextSeq }, { merge: true });
    return nextSeq;
  });
};

// --- Plant Document Helper ---
export const addPlantWithUIDFields = async (userId, plantId, plantData) => {
  // plantData should include: unique_id, strain_code, strain_name, parent_id, etc.
  const plantRef = doc(db, 'users', userId, 'plants', plantId);
  await setDoc(plantRef, {
    ...plantData,
    updated_at: serverTimestamp(),
  }, { merge: true });
};
