import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { ThemedText } from '@/components/themed-text';
import { DISLIKE_GOPHER, LIKE_GOPHER, MOCK_COURSES, MOCK_COURSES_BASE } from '@/lib/mocks/courses';
import type { CourseVote } from '@/lib/mocks/course-progress';
import { getCourseVote, setCourseVote } from '@/lib/mocks/course-progress';
import { useThemeColor } from '@/hooks/use-theme-color';

function ratingCounts(baseLikes: number, baseDislikes: number, vote: CourseVote | null) {
  const likes = baseLikes + (vote === 'like' ? 1 : 0);
  const dislikes = baseDislikes + (vote === 'dislike' ? 1 : 0);
  return { likes, dislikes };
}

export default function CatalogScreen() {
  const { t } = useTranslation();
  const courses = MOCK_COURSES;
  const brand3 = useThemeColor({}, 'brand3');
  const border = useThemeColor({}, 'border');
  const [votes, setVotes] = useState<Record<number, CourseVote | null>>({});

  const reloadVotes = useCallback(async () => {
    const next: Record<number, CourseVote | null> = {};
    await Promise.all(
      MOCK_COURSES_BASE.map(async (c) => {
        next[c.id] = await getCourseVote(c.id);
      })
    );
    setVotes(next);
  }, []);

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

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="title">{t('catalog.title')}</ThemedText>
        </View>
      </View>

      <FlatList
        style={[styles.listFlex, webHiddenScrollbarStyle()]}
        data={courses}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
                    <ThemedText numberOfLines={3}>{item.description}</ThemedText>
                  </View>
                </Pressable>
              </Link>

              <View style={styles.ratingRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('catalog.a11yLike')}
                  onPress={() => void onVoteLike(item.id, vote)}
                  style={[
                    styles.ratingItem,
                    liked ? [styles.ratingActive, { borderColor: `${brand3}AA` }] : { borderColor: border },
                  ]}>
                  <Image source={LIKE_GOPHER} contentFit="contain" style={styles.ratingGopher} />
                  <ThemedText type="defaultSemiBold">{likes}</ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('catalog.a11yDislike')}
                  onPress={() => void onVoteDislike(item.id, vote)}
                  style={[
                    styles.ratingItem,
                    disliked ? [styles.ratingActive, { borderColor: `${brand3}AA` }] : { borderColor: border },
                  ]}>
                  <Image source={DISLIKE_GOPHER} contentFit="contain" style={styles.ratingGopher} />
                  <ThemedText type="defaultSemiBold">{dislikes}</ThemedText>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
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
