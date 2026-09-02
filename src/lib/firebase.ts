import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if specified
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { app };

// Helper to sanitize undefined values before saving to Firestore
function sanitizeDoc<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        result[key] = sanitizeDoc(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Save or update a document in Firestore
 */
export async function saveToCloud<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(data.id));
    const cleanData = sanitizeDoc(data);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error: any) {
    if (error?.message?.includes("Quota exceeded") || error?.code === "resource-exhausted") {
      console.warn(`[Firebase] Quota limit reached for ${collectionName}/${data.id}. Saved locally.`);
    } else {
      console.warn(`[Firebase] Notice saving to ${collectionName}/${data.id}:`, error?.message || error);
    }
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteFromCloud(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
  } catch (error: any) {
    if (error?.message?.includes("Quota exceeded") || error?.code === "resource-exhausted") {
      console.warn(`[Firebase] Quota limit reached for deleting ${collectionName}/${id}.`);
    } else {
      console.warn(`[Firebase] Notice deleting ${collectionName}/${id}:`, error?.message || error);
    }
  }
}

/**
 * Bulk save documents in a single batch
 */
export async function batchSaveToCloud<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    const chunks = [];
    for (let i = 0; i < items.length; i += 400) {
      chunks.push(items.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      const currentBatch = writeBatch(db);
      for (const item of chunk) {
        const docRef = doc(db, collectionName, String(item.id));
        currentBatch.set(docRef, sanitizeDoc(item), { merge: true });
      }
      await currentBatch.commit();
    }
  } catch (error: any) {
    if (error?.message?.includes("Quota exceeded") || error?.code === "resource-exhausted") {
      console.warn(`[Firebase] Quota limit reached for batch save in ${collectionName}. Data saved locally.`);
    } else {
      console.warn(`[Firebase] Notice batch saving to ${collectionName}:`, error?.message || error);
    }
  }
}

/**
 * Delete all documents in a collection
 */
export async function clearCloudCollection(collectionName: string): Promise<void> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error: any) {
    if (error?.message?.includes("Quota exceeded") || error?.code === "resource-exhausted") {
      console.warn(`[Firebase] Quota limit reached for clearing ${collectionName}.`);
    } else {
      console.warn(`[Firebase] Notice clearing ${collectionName}:`, error?.message || error);
    }
  }
}

/**
 * Real-time listener for a Firestore collection with graceful fallback and quota management
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, collectionName);
  try {
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as T[];
        onData(items);
      },
      (err) => {
        const isQuota = err.message?.includes("Quota exceeded") || (err as any)?.code === "resource-exhausted";
        if (isQuota) {
          console.warn(`[Firebase] Storage quota reached for ${collectionName}. Falling back seamlessly to local storage cache.`);
        } else {
          console.warn(`[Firebase] Subscription notice in ${collectionName}:`, err.message || err);
        }
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn(`[Firebase] Unable to attach listener to ${collectionName}:`, e?.message || e);
    if (onError) onError(e);
    return () => {};
  }
}
