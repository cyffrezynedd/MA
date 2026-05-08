import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SoftButton } from '@/components/ui/button';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { ThemedText } from '@/components/themed-text';
import { ProgressGopher } from '@/components/ui/progress-gopher';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCatalogCourseById, type CatalogCourseItem } from '@/lib/catalog/catalog-session';
import { sqliteCourseToCatalogItem } from '@/lib/catalog/local-courses';
import { getCourseById } from '@/lib/db/courses';
import {
  getCompletedTests,
  setCompletedTests,
  setLastVisitedCourseId,
  setLastTestsCourseId,
} from '@/lib/mocks/course-progress';
import { listNotes, type CourseNote } from '@/lib/db/notes';
import { buildTelegramShareUrl } from '@/lib/share/telegram-share';

export default function CourseDetails() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const border = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'muted');
  const cardBg = useThemeColor({}, 'card');
  const [course, setCourse] = useState<CatalogCourseItem | null>(() =>
    Number.isFinite(courseId) ? getCatalogCourseById(courseId) : null
  );
  const [completedTests, setCompletedTestsState] = useState<string[]>([]);
  const [courseNotes, setCourseNotes] = useState<CourseNote[]>([]);

  useEffect(() => {
    if (!Number.isFinite(courseId)) {
      setCourse(null);
      return;
    }
    const fromSession = getCatalogCourseById(courseId);
    if (fromSession) {
      setCourse(fromSession);
      return;
    }
    let cancelled = false;
    void getCourseById(courseId).then((row) => {
      if (cancelled) return;
      setCourse(row ? sqliteCourseToCatalogItem(row) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      if (!Number.isFinite(courseId)) return;
      const fromSession = getCatalogCourseById(courseId);
      if (fromSession) setCourse(fromSession);
    }, [courseId])
  );

  const reloadNotes = useCallback(async () => {
    if (!Number.isFinite(courseId)) return;
    setCourseNotes(await listNotes(courseId));
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      void reloadNotes();
    }, [reloadNotes])
  );

  useEffect(() => {
    if (!Number.isFinite(courseId)) return;
    (async () => {
      const tests = await getCompletedTests(courseId);
      setCompletedTestsState(tests);
      await setLastVisitedCourseId(courseId);
    })();
  }, [courseId]);

  const title = useMemo(() => course?.title ?? t('course.details'), [course, t]);
  const progress = useMemo(() => {
    if (!course || course.tests.length === 0) return 0;
    return Math.round((completedTests.length / course.tests.length) * 100);
  }, [completedTests.length, course]);

  const formatUpdatedAt = useCallback(
    (ms: number) => {
      const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
      return new Date(ms).toLocaleString(locale);
    },
    [i18n.language]
  );

  const shareCourseInTelegram = useCallback(async () => {
    if (!course || !Number.isFinite(courseId)) return;
    const link = Linking.createURL(`/course/${courseId}`);
    const text = [course.title, course.description.trim().slice(0, 200)].filter(Boolean).join('\n\n');
    const tgUrl = buildTelegramShareUrl(text, link);
    try {
      await Linking.openURL(tgUrl);
    } catch {
      /* no handler for https */
    }
  }, [course, courseId]);

  const toggleTest = async (testId: string) => {
    const next = completedTests.includes(testId)
      ? completedTests.filter((tid) => tid !== testId)
      : [...completedTests, testId];
    setCompletedTestsState(next);
    await setCompletedTests(courseId, next);
    await setLastTestsCourseId(courseId);
  };

  return (
    <Screen tabBarClearance="minimal">
      <ScrollView
        style={[styles.scroll, webHiddenScrollbarStyle()]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <ThemedText type="title" style={styles.courseTitle}>
          {title}
        </ThemedText>

        {course ? (
          <SoftButton
            title={t('courseScreen_shareTelegram')}
            onPress={() => void shareCourseInTelegram()}
            style={styles.shareBtn}
          />
        ) : null}

        {course ? (
          <>
            {course.source === 'device' ? (
              <PrimaryButton
                title={t('course.edit')}
                onPress={() => router.push({ pathname: '/course-editor', params: { id: String(courseId) } })}
                style={styles.editLocalBtn}
              />
            ) : null}

            <Card style={styles.videoCard}>
              <Image source={course.preview} contentFit="cover" style={styles.videoPreview} />
              <View style={styles.videoMeta}>
                <ThemedText>{course.description}</ThemedText>
              </View>
            </Card>

            {course.tests.length > 0 ? (
              <Card>
                <ThemedText type="subtitle">{t('courseScreen_tests')}</ThemedText>
                <ProgressGopher progress={progress} label={t('home.progress')} />
                <View style={styles.tests}>
                  {course.tests.map((test) => {
                    const done = completedTests.includes(test.id);
                    return (
                      <Pressable
                        key={test.id}
                        onPress={() => void toggleTest(test.id)}
                        style={[styles.testItem, { borderColor: border }, done ? styles.testDone : undefined]}>
                        <ThemedText type="defaultSemiBold">{test.title}</ThemedText>
                        <View style={[styles.testBadge, done ? styles.testBadgeDone : undefined]}>
                          <ThemedText type="defaultSemiBold">
                            {done ? t('courseScreen_testPassed') : t('courseScreen_testTake')}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            ) : (
              <Card>
                <ThemedText type="subtitle">{t('courseScreen_tests')}</ThemedText>
                <ThemedText style={{ color: mutedColor }}>{t('courseScreen_noTests')}</ThemedText>
              </Card>
            )}

            <Card>
              <ThemedText type="subtitle">{t('course.notes')}</ThemedText>
              <PrimaryButton
                title={t('course.addNote')}
                style={styles.addNoteBtn}
                onPress={() =>
                  router.push({ pathname: '/note-editor', params: { courseId: String(courseId) } })
                }
              />
              {courseNotes.length === 0 ? (
                <View style={styles.emptyNotes}>
                  <ThemedText style={[styles.emptyNotesText, { color: mutedColor }]}>
                    {t('course.noNotesForCourse')}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.noteList}>
                  {courseNotes.map((n) => (
                    <Pressable
                      key={n.id}
                      onPress={() =>
                        router.push({ pathname: '/note-detail/[id]', params: { id: String(n.id) } })
                      }
                      style={[styles.noteRow, { borderColor: border, backgroundColor: cardBg }]}>
                      <ThemedText type="defaultSemiBold" numberOfLines={2}>
                        {n.title}
                      </ThemedText>
                      <ThemedText style={{ color: mutedColor }}>{t(`status.${n.status}`)}</ThemedText>
                      <ThemedText style={{ color: mutedColor }}>{formatUpdatedAt(n.updatedAt)}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </Card>
          </>
        ) : (
          <Card>
            <ThemedText>{t('courseScreen_notFound')}</ThemedText>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  courseTitle: { flexShrink: 1, lineHeight: 42 },
  shareBtn: { alignSelf: 'stretch' },
  content: { flexGrow: 0, gap: 12, paddingBottom: 16 },
  editLocalBtn: { alignSelf: 'stretch', marginBottom: 4 },
  videoCard: { gap: 10 },
  videoPreview: { width: '100%', height: 180, borderRadius: 14 },
  videoMeta: { gap: 4 },
  tests: { gap: 10, marginTop: 4 },
  testItem: { borderWidth: 1, borderRadius: 14, padding: 10, gap: 8 },
  testDone: { backgroundColor: 'rgba(52, 211, 153, 0.16)' },
  testBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.38)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  testBadgeDone: {
    borderColor: 'rgba(5, 150, 105, 0.45)',
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
  },
  addNoteBtn: { marginTop: 10, alignSelf: 'stretch' },
  emptyNotes: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  emptyNotesText: {
    textAlign: 'center',
  },
  noteList: { gap: 10, marginTop: 12 },
  noteRow: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 },
});
