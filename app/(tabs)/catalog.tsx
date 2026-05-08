import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/button';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { DISLIKE_GOPHER, LIKE_GOPHER } from '@/lib/mocks/courses';
import type { CourseVote } from '@/lib/mocks/course-progress';
import { getCourseVote, setCourseVote } from '@/lib/mocks/course-progress';
import { catalogCourseToListItem, orderCoursesByListItems } from '@/lib/catalog/catalog-adapters';
import {
  applyCatalogQuery,
  type CatalogSortMode,
} from '@/lib/catalog/catalog-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCatalogCourses } from '@/hooks/use-catalog-courses';
import { isFirebaseConfigured } from '@/lib/firebase/app';

const CATEGORY_KEYS = ['all', 'basics', 'concurrency', 'http'] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

const SORT_MODES: CatalogSortMode[] = [
  'updated_desc',
  'updated_asc',
  'title_asc',
  'title_desc',
];

function ratingCounts(baseLikes: number, baseDislikes: number, vote: CourseVote | null) {
  const likes = baseLikes + (vote === 'like' ? 1 : 0);
  const dislikes = baseDislikes + (vote === 'dislike' ? 1 : 0);
  return { likes, dislikes };
}

export default function CatalogScreen() {
  const { t } = useTranslation();
  const { courses, loading, refreshing, refresh } = useCatalogCourses();
  const brand3 = useThemeColor({}, 'brand3');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const [search, setSearch] = useState('');
  const [categoryKey, setCategoryKey] = useState<CategoryKey>('all');
  const [sortIndex, setSortIndex] = useState(0);
  const sortMode = SORT_MODES[sortIndex] ?? 'updated_desc';

  const [votes, setVotes] = useState<Record<number, CourseVote | null>>({});

  const listRows = useMemo(() => courses.map(catalogCourseToListItem), [courses]);

  const filteredCourses = useMemo(() => {
    const category =
      categoryKey === 'all'
        ? null
        : categoryKey === 'basics'
          ? 'basics'
          : categoryKey === 'concurrency'
            ? 'concurrency'
            : 'http';
    const ordered = applyCatalogQuery(listRows, {
      search,
      category,
      sort: sortMode,
    });
    return orderCoursesByListItems(ordered, courses);
  }, [categoryKey, courses, listRows, search, sortMode]);

  const reloadVotes = useCallback(async () => {
    const next: Record<number, CourseVote | null> = {};
    await Promise.all(
      courses.map(async (c) => {
        next[c.id] = await getCourseVote(c.id);
      })
    );
    setVotes(next);
  }, [courses]);

  useEffect(() => {
    void reloadVotes();
  }, [reloadVotes]);

  useFocusEffect(
    useCallback(() => {
      void reloadVotes();
    }, [reloadVotes])
  );

  const onVoteLike = useCallback(async (courseId: number, current: CourseVote | null) => {
    let next: CourseVote | null;
    if (current === 'like') next = null;
    else next = 'like';
    await setCourseVote(courseId, next);
    setVotes((prev) => ({ ...prev, [courseId]: next }));
  }, []);

  const onVoteDislike = useCallback(async (courseId: number, current: CourseVote | null) => {
    let next: CourseVote | null;
    if (current === 'dislike') next = null;
    else next = 'dislike';
    await setCourseVote(courseId, next);
    setVotes((prev) => ({ ...prev, [courseId]: next }));
  }, []);

  const categoryLabel = (key: CategoryKey) => {
    if (key === 'all') return t('catalog.categoryAll');
    if (key === 'basics') return t('catalog.catBasics');
    if (key === 'concurrency') return t('catalog.catConcurrency');
    return t('catalog.catHttp');
  };

  const sortLabel = () => {
    switch (sortMode) {
      case 'updated_desc':
        return t('catalog.sortUpdatedDesc');
      case 'updated_asc':
        return t('catalog.sortUpdatedAsc');
      case 'title_asc':
        return t('catalog.sortTitleAsc');
      case 'title_desc':
        return t('catalog.sortTitleDesc');
      default:
        return '';
    }
  };

  const cycleSort = () => {
    setSortIndex((i) => (i + 1) % SORT_MODES.length);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="title">{t('catalog.title')}</ThemedText>
          {!isFirebaseConfigured() ? (
            <ThemedText style={[styles.mockHint, { color: muted }]}>{t('catalog.mockHint')}</ThemedText>
          ) : null}
        </View>
      </View>

      {!loading ? (
        <View style={styles.toolbar}>
          <ThemedTextInput
            placeholder={t('catalog.searchPlaceholder')}
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.sortRow}>
            <PrimaryButton
              title={t('catalog.sortLabel')}
              onPress={cycleSort}
              accessibilityRole="button"
              accessibilityHint={sortLabel()}
              style={styles.sortPrimary}
            />
            <ThemedText type="subtitle" style={styles.sortValue} numberOfLines={1}>
              : {sortLabel()}
            </ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.chipsScroll, webHiddenScrollbarStyle()]}
            contentContainerStyle={styles.chipsScrollContent}
            keyboardShouldPersistTaps="handled">
            {CATEGORY_KEYS.map((key) => {
              const active = categoryKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setCategoryKey(key)}
                  style={[
                    styles.chip,
                    active
                      ? { borderColor: `${brand3}AA`, backgroundColor: `${brand3}38` }
                      : { borderColor: border, backgroundColor: card },
                  ]}>
                  <ThemedText type="defaultSemiBold">{categoryLabel(key)}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
          <ThemedText style={{ color: muted }}>{t('catalog.loading')}</ThemedText>
        </View>
      ) : (
        <FlatList
          style={[styles.listFlex, webHiddenScrollbarStyle()]}
          data={filteredCourses}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            isFirebaseConfigured() ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void refresh()}
                accessibilityLabel={t('catalog.refreshingHint')}
              />
            ) : undefined
          }
          ListEmptyComponent={<ThemedText>{t('catalog.empty')}</ThemedText>}
          renderItem={({ item }) => {
            const vote = votes[item.id] ?? null;
            const { likes, dislikes } = ratingCounts(item.likes, item.dislikes, vote);
            const liked = vote === 'like';
            const disliked = vote === 'dislike';

            return (
              <Card style={styles.courseCard}>
                <Link href={{ pathname: '/course/[id]', params: { id: String(item.id) } }} asChild>
                  <Pressable style={styles.cardTap}>
                    <Image source={item.preview} contentFit="cover" style={styles.preview} />
                    <View style={styles.courseRight}>
                      <ThemedText type="subtitle" numberOfLines={1}>
                        {item.title}
                      </ThemedText>
                      {item.source === 'device' ? (
                        <ThemedText style={[styles.onDevice, { color: muted }]}>{t('catalog.onDevice')}</ThemedText>
                      ) : null}
                      <ThemedText numberOfLines={3}>{item.description}</ThemedText>
                    </View>
                  </Pressable>
                </Link>

                <View style={styles.ratingRow}>
                  <Pressable
                    accessibilityLabel={t('catalog.a11yLike')}
                    onPress={() => void onVoteLike(item.id, vote)}
                    style={[styles.ratingItem, liked && styles.ratingActive, { borderColor: border }]}>
                    <Image source={LIKE_GOPHER} style={styles.ratingGopher} />
                    <ThemedText type="defaultSemiBold">{likes}</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={t('catalog.a11yDislike')}
                    onPress={() => void onVoteDislike(item.id, vote)}
                    style={[styles.ratingItem, disliked && styles.ratingActive, { borderColor: border }]}>
                    <Image source={DISLIKE_GOPHER} style={styles.ratingGopher} />
                    <ThemedText type="defaultSemiBold">{dislikes}</ThemedText>
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  mockHint: { marginTop: 6, fontSize: 14, lineHeight: 20 },
  onDevice: { fontSize: 12, marginTop: 2 },
  toolbar: { gap: 10, marginBottom: 4 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 2,
    marginTop: 4,
    minWidth: 0,
  },
  sortPrimary: { flexShrink: 0 },
  sortValue: { flex: 1, flexShrink: 1, minWidth: 0 },
  chipsScroll: { flexGrow: 0, alignSelf: 'stretch', maxHeight: 52 },
  chipsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
    paddingVertical: 2,
    paddingRight: 8,
  },
  chip: {
    flexShrink: 0,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 24 },
  listFlex: { flex: 1 },
  list: { paddingBottom: 16, gap: 10 },
  courseCard: { marginBottom: 10, flexDirection: 'column', gap: 12 },
  cardTap: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  preview: { width: 98, borderRadius: 14 },
  courseRight: { flex: 1, gap: 6, justifyContent: 'flex-start' },
  ratingRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ratingActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
  },
  ratingGopher: { width: 40, height: 40 },
});
