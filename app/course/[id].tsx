import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { ThemedText } from '@/components/themed-text';
import { ProgressGopher } from '@/components/ui/progress-gopher';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMockCourseById } from '@/lib/mocks/courses';
import {
  getCompletedTests,
  getCourseNote,
  setCompletedTests,
  setCourseNote,
  setLastVisitedCourseId,
  setLastTestsCourseId,
} from '@/lib/mocks/course-progress';

export default function CourseDetails() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const border = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const cardBg = useThemeColor({}, 'card');
  const course = useMemo(() => getMockCourseById(courseId), [courseId]);
  const [completedTests, setCompletedTestsState] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!Number.isFinite(courseId)) return;
    (async () => {
      const [tests, savedNote] = await Promise.all([getCompletedTests(courseId), getCourseNote(courseId)]);
      setCompletedTestsState(tests);
      setNote(savedNote);
      await setLastVisitedCourseId(courseId);
    })();
  }, [courseId]);

  const title = useMemo(() => course?.title ?? t('course.details'), [course, t]);
  const progress = useMemo(() => {
    if (!course) return 0;
    return Math.round((completedTests.length / course.tests.length) * 100);
  }, [completedTests.length, course]);

  const toggleTest = async (testId: string) => {
    const next = completedTests.includes(testId)
      ? completedTests.filter((id) => id !== testId)
      : [...completedTests, testId];
    setCompletedTestsState(next);
    await setCompletedTests(courseId, next);
    await setLastTestsCourseId(courseId);
  };

  const saveNote = async (value: string) => {
    setNote(value);
    await setCourseNote(courseId, value);
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
          <>
            <Card style={styles.videoCard}>
              <Image source={course.preview} contentFit="cover" style={styles.videoPreview} />
              <View style={styles.videoMeta}>
                <ThemedText>{course.description}</ThemedText>
              </View>
            </Card>

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

            <Card>
              <ThemedText type="subtitle">{t('home.myNotes')}</ThemedText>
              <TextInput
                multiline
                value={note}
                onChangeText={(v) => void saveNote(v)}
                placeholder={t('courseScreen_notePlaceholder')}
                placeholderTextColor={mutedColor}
                style={[
                  styles.noteInput,
                  {
                    borderColor: border,
                    color: textColor,
                    backgroundColor: cardBg,
                  },
                ]}
              />
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
  content: { flexGrow: 0, gap: 12, paddingBottom: 16 },
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
  noteInput: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
  },
});

