import {
  collection,
  getDocs,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';

import { getFirebaseApp, isUsingFirestoreEmulator } from '@/lib/firebase/app';
import { getFirestoreDb } from '@/lib/firebase/firestore';

/** Document shape mapped from Firestore collection `courses` (lab contract). */

export type RemoteCourseTest = {
  id: string;
  title: string;
};

export type RemoteCourse = {
  id: number;
  title: string;
  description: string;
  previewImageUrl: string;
  likes: number;
  dislikes: number;
  tests: RemoteCourseTest[];
  category: string;
  keywords: string[];
  updatedAt: number;
};

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toMillis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (
    value &&
    typeof value === 'object' &&
    'toMillis' in value &&
    typeof (value as Timestamp).toMillis === 'function'
  ) {
    return (value as Timestamp).toMillis();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  return Date.now();
}

function parseTests(value: unknown): RemoteCourseTest[] {
  if (!Array.isArray(value)) return [];
  const out: RemoteCourseTest[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const id = asString(rec.id, '');
    const title = asString(rec.title, '');
    if (!id || !title) continue;
    out.push({ id, title });
  }
  return out;
}

function parseKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((k): k is string => typeof k === 'string' && k.length > 0);
}

export function mapCourseDocToRemote(docSnap: QueryDocumentSnapshot<DocumentData>): RemoteCourse | null {
  const data = docSnap.data() as Record<string, unknown>;
  const idFromField = asNumber(data.id, Number.NaN);
  const idFromDoc = Number(docSnap.id);
  const id = Number.isFinite(idFromField) ? idFromField : Number.isFinite(idFromDoc) ? idFromDoc : Number.NaN;
  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: asString(data.title, 'Untitled'),
    description: asString(data.description, ''),
    previewImageUrl: asString(data.previewImageUrl ?? data.previewUrl, ''),
    likes: asNumber(data.likes, 0),
    dislikes: asNumber(data.dislikes, 0),
    tests: parseTests(data.tests),
    category: asString(data.category, ''),
    keywords: parseKeywords(data.keywords),
    updatedAt: toMillis(data.updatedAt),
  };
}

/** Same semantics as `fetchCoursesFromFirestore`: empty emulator → `null`. */
export function finalizeRemoteCourseList(courses: RemoteCourse[]): RemoteCourse[] | null {
  courses.sort((a, b) => a.id - b.id);
  if (courses.length === 0 && isUsingFirestoreEmulator()) {
    return null;
  }
  return courses;
}

/**
 * Reads all documents from `courses`. On any failure returns `null` (caller falls back to mocks).
 */
export async function fetchCoursesFromFirestore(): Promise<RemoteCourse[] | null> {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const db = getFirestoreDb(app);
    const snap = await getDocs(collection(db, 'courses'));
    const courses: RemoteCourse[] = [];

    for (const docSnap of snap.docs) {
      const mapped = mapCourseDocToRemote(docSnap);
      if (mapped) courses.push(mapped);
    }

    return finalizeRemoteCourseList(courses);
  } catch {
    return null;
  }
}

/**
 * Live subscription to `courses`. Invokes `onData` with the mapped list (or `null` when empty emulator / identical rules as fetch).
 */
export function subscribeCoursesFromFirestore(
  onData: (courses: RemoteCourse[] | null) => void,
  onError?: (error: Error) => void
): () => void {
  const app = getFirebaseApp();
  if (!app) {
    onData(null);
    return () => {};
  }

  const db = getFirestoreDb(app);
  const colRef = collection(db, 'courses');

  return onSnapshot(
    colRef,
    (snap) => {
      const courses: RemoteCourse[] = [];
      for (const docSnap of snap.docs) {
        const mapped = mapCourseDocToRemote(docSnap);
        if (mapped) courses.push(mapped);
      }
      onData(finalizeRemoteCourseList(courses));
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
      onData(null);
    }
  );
}
