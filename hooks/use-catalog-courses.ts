import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { persistCatalogIdSnapshotAndNotifyNew } from '@/lib/catalog/catalog-id-snapshot';
import { sqliteCourseToCatalogItem } from '@/lib/catalog/local-courses';
import {
  setSessionCatalogCourses,
  type CatalogCourseItem,
} from '@/lib/catalog/catalog-session';
import {
  fetchCoursesFromFirestore,
  subscribeCoursesFromFirestore,
  type RemoteCourse,
} from '@/lib/catalog/firestore-courses';
import { listCourses } from '@/lib/db/courses';
import { isFirebaseConfigured } from '@/lib/firebase/app';
import { MOCK_COURSES, getMockCourseById } from '@/lib/mocks/courses';
import { ensureCatalogNotificationChannel, requestNotificationPermissions } from '@/lib/notifications/channels';
import { useAuth } from '@/providers/auth-provider';

const FALLBACK_PREVIEW = require('@/assets/images/sticker_like.png');

function mockToCatalogItem(c: (typeof MOCK_COURSES)[number]): CatalogCourseItem {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    preview: c.preview,
    likes: c.likes,
    dislikes: c.dislikes,
    tests: c.tests,
    updatedAt: c.id * 86400000,
  };
}

function remoteToCatalogItem(r: RemoteCourse): CatalogCourseItem {
  const url = r.previewImageUrl?.trim() ?? '';
  const preview =
    url.length > 0 ? { uri: url } : (getMockCourseById(r.id)?.preview ?? FALLBACK_PREVIEW);

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    preview,
    likes: r.likes,
    dislikes: r.dislikes,
    tests: r.tests,
    updatedAt: r.updatedAt,
  };
}

async function withLocalCourses(mapped: CatalogCourseItem[]): Promise<CatalogCourseItem[]> {
  let locals: Awaited<ReturnType<typeof listCourses>> = [];
  try {
    locals = await listCourses();
  } catch {
    locals = [];
  }
  const remoteIds = new Set(mapped.map((c) => c.id));
  const localItems = locals.filter((row) => !remoteIds.has(row.id)).map(sqliteCourseToCatalogItem);
  return [...localItems, ...mapped];
}

export type UseCatalogCoursesResult = {
  courses: CatalogCourseItem[];
  loading: boolean;
  /** Потянуть каталог вниз: повторный запрос Firestore + проверка новых id → уведомление. */
  refreshing: boolean;
  refresh: () => Promise<void>;
  /** Firebase включён, пользователь не вошёл — показаны моки; можно подсказать вход для облака. */
  showCloudSignInHint: boolean;
};

export function useCatalogCourses(): UseCatalogCoursesResult {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CatalogCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCloudSignInHint, setShowCloudSignInHint] = useState(false);
  const notificationsPrimedRef = useRef(false);
  const catalogBaseRef = useRef<CatalogCourseItem[]>([]);

  const applyRemoteOrMocks = useCallback(async (remote: RemoteCourse[] | null) => {
    if (remote !== null) {
      const base = remote.map(remoteToCatalogItem);
      catalogBaseRef.current = base;
      const mapped = await withLocalCourses(base);
      setCourses(mapped);
      setSessionCatalogCourses(mapped);
      await ensureCatalogNotificationChannel();
      await requestNotificationPermissions();
      await persistCatalogIdSnapshotAndNotifyNew(remote.map((c) => ({ id: c.id, title: c.title })));
      return;
    }
    const base = MOCK_COURSES.map(mockToCatalogItem);
    catalogBaseRef.current = base;
    const mapped = await withLocalCourses(base);
    setCourses(mapped);
    setSessionCatalogCourses(mapped);
  }, []);

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setRefreshing(true);
    try {
      const remote = await fetchCoursesFromFirestore();
      await applyRemoteOrMocks(remote);
    } finally {
      setRefreshing(false);
    }
  }, [applyRemoteOrMocks]);

  useFocusEffect(
    useCallback(() => {
      if (notificationsPrimedRef.current) return;
      notificationsPrimedRef.current = true;
      void (async () => {
        await ensureCatalogNotificationChannel();
        await requestNotificationPermissions();
      })();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const base = catalogBaseRef.current;
        if (base.length === 0) return;
        const merged = await withLocalCourses(base);
        setCourses(merged);
        setSessionCatalogCourses(merged);
      })();
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribeFirestore: (() => void) | undefined;

    (async () => {
      if (!isFirebaseConfigured()) {
        setShowCloudSignInHint(false);
        const base = MOCK_COURSES.map(mockToCatalogItem);
        catalogBaseRef.current = base;
        const mapped = await withLocalCourses(base);
        if (!cancelled) {
          setCourses(mapped);
          setSessionCatalogCourses(mapped);
          setLoading(false);
        }
        return;
      }

      if (!user) {
        setShowCloudSignInHint(true);
        const base = MOCK_COURSES.map(mockToCatalogItem);
        catalogBaseRef.current = base;
        const mapped = await withLocalCourses(base);
        if (!cancelled) {
          setCourses(mapped);
          setSessionCatalogCourses(mapped);
          setLoading(false);
        }
        return;
      }

      setShowCloudSignInHint(false);
      setLoading(true);

      unsubscribeFirestore = subscribeCoursesFromFirestore(
        (remote) => {
          if (cancelled) return;
          void (async () => {
            await applyRemoteOrMocks(remote);
            if (!cancelled) setLoading(false);
          })();
        },
        () => {
          if (cancelled) return;
          void (async () => {
            await applyRemoteOrMocks(null);
            if (!cancelled) setLoading(false);
          })();
        }
      );
    })();

    return () => {
      cancelled = true;
      unsubscribeFirestore?.();
    };
  }, [applyRemoteOrMocks, user]);

  return { courses, loading, refreshing, refresh, showCloudSignInHint };
}
