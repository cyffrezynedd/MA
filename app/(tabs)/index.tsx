import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { PrimaryButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCompletedTests, getLastTestsCourseId, getLastVisitedCourseId } from '@/lib/mocks/course-progress';
import { getMockCourseById, MOCK_COURSES } from '@/lib/mocks/courses';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const border = useThemeColor({}, 'border');
  const progressFill = useThemeColor({}, 'progressFill');
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');
  const [lastCourseId, setLastCourseId] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const lastCourse = useMemo(() => {
    if (lastCourseId == null) return MOCK_COURSES[0] ?? null;
    return getMockCourseById(lastCourseId) ?? (MOCK_COURSES[0] ?? null);
  }, [lastCourseId]);

  const refreshLastCourse = useCallback(async () => {
    const testsCourseId = await getLastTestsCourseId();
    const visitedId = await getLastVisitedCourseId();
    setLastCourseId(testsCourseId ?? visitedId ?? null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshLastCourse();
    }, [refreshLastCourse])
  );

  useEffect(() => {
    if (!lastCourse) return;
    (async () => {
      const completed = await getCompletedTests(lastCourse.id);
      setCompletedCount(completed.length);
    })();
  }, [lastCourse]);

  const progress = useMemo(() => {
    if (!lastCourse || lastCourse.tests.length === 0) return 0;
    return Math.round((completedCount / lastCourse.tests.length) * 100);
  }, [completedCount, lastCourse]);

  return (
    <Screen>
      <ScrollView
        style={[styles.pageScroll, webHiddenScrollbarStyle()]}
        contentContainerStyle={styles.pageScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <ThemedText type="title" style={styles.screenTitle} numberOfLines={2}>
          {t('home.titleStudent')}
        </ThemedText>

        <Card style={styles.heroCard}>
          <ThemedText type="subtitle">{t('home.lastCourse')}</ThemedText>
          {!lastCourse ? (
            <View style={styles.heroBody}>
              <ThemedText type="defaultSemiBold">{t('catalog.title')}</ThemedText>
            </View>
          ) : (
            <View style={styles.heroFill}>
              <Link href={{ pathname: '/course/[id]', params: { id: String(lastCourse.id) } }} asChild>
                <Pressable style={styles.lastCourseColumn}>
                  <View style={[styles.previewBlock, { borderColor: border, backgroundColor: card }]}>
                    <Image source={lastCourse.preview} contentFit="cover" style={styles.lastPreviewImage} />
                  </View>
                  <View style={[styles.textBlock, { borderColor: border, backgroundColor: card }]}>
                    <ThemedText type="defaultSemiBold" numberOfLines={2}>
                      {lastCourse.title}
                    </ThemedText>
                    <ThemedText style={styles.descriptionText}>{lastCourse.description}</ThemedText>
                  </View>
                </Pressable>
              </Link>

              <View style={styles.progressFooter}>
                <View style={[styles.progressTrack, { borderColor: border }]}>
                  <View style={[styles.progressFillInner, { backgroundColor: progressFill, width: `${progress}%` }]} />
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.progressPercent, { color: muted }]}>
                  {progress}%
                </ThemedText>
              </View>
            </View>
          )}
        </Card>

        <View style={styles.bottomRow}>
          <PrimaryButton
            title={t('home.history')}
            titleNumberOfLines={2}
            onPress={() => router.push('/completed-history')}
            style={styles.quickPrimary}
          />
          <PrimaryButton
            title={t('home.myNotes')}
            titleNumberOfLines={2}
            onPress={() => router.push('/my-notes')}
            style={styles.quickPrimary}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageScroll: {
    flex: 1,
  },
  /** Карточка забирает свободную высоту между заголовком и кнопками contentContainer (`flexGrow:1`). */
  pageScrollContent: {
    flexGrow: 1,
    flexDirection: 'column',
    width: '100%',
    gap: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    flexShrink: 1,
    paddingBottom: 2,
  },
  /** Растягивается между title и строкой быстрых действий зазор без пустого фона между. */
  heroCard: {
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  heroBody: {
    flex: 1,
    gap: 12,
    marginTop: 6,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  heroFill: {
    flex: 1,
    width: '100%',
    marginTop: 6,
    gap: 10,
    minHeight: 0,
  },
  lastCourseColumn: { flexDirection: 'column', gap: 12, width: '100%' },
  previewBlock: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
    overflow: 'hidden',
  },
  lastPreviewImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  textBlock: {
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 26,
  },
  progressFooter: {
    marginTop: 'auto',
    width: '100%',
    gap: 6,
    paddingTop: 2,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFillInner: { height: '100%', borderRadius: 999 },
  progressPercent: { alignSelf: 'center', fontSize: 17, lineHeight: 24 },

  bottomRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  /** `PrimaryButton`: на web у Link+asChild стили часто срываются; здесь тот же вид, что Sort / Add note. */
  quickPrimary: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
});
