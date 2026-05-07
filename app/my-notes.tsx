import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { getMockCourseById } from '@/lib/mocks/courses';
import { getLastVisitedCourseId } from '@/lib/mocks/course-progress';
import { useThemeColor } from '@/hooks/use-theme-color';
import { listAllNotes, type CourseNote } from '@/lib/db/notes';

export default function MyNotesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const muted = useThemeColor({}, 'muted');
  const [notes, setNotes] = useState<CourseNote[]>([]);

  const reload = useCallback(async () => {
    setNotes(await listAllNotes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const formatUpdatedAt = useCallback(
    (ms: number) => {
      const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
      return new Date(ms).toLocaleString(locale);
    },
    [i18n.language]
  );

  const onAddNote = async () => {
    const last = await getLastVisitedCourseId();
    if (last == null) {
      Alert.alert(t('course.addNote'), t('course.lastVisitedRequired'));
      return;
    }
    router.push({ pathname: '/note-editor', params: { courseId: String(last) } });
  };

  return (
    <Screen tabBarClearance="minimal">
      <ThemedText type="title">{t('home.myNotes')}</ThemedText>
      <PrimaryButton title={t('course.addNote')} style={styles.addBtn} onPress={() => void onAddNote()} />

      <FlatList
        style={styles.listWrapper}
        data={notes}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedText style={[styles.emptyText, { color: muted }]}>{t('notesScreen_emptyList')}</ThemedText>
        }
        renderItem={({ item }) => {
          const course = getMockCourseById(item.courseId);
          return (
            <Link href={{ pathname: '/note-detail/[id]', params: { id: String(item.id) } }} asChild>
              <Pressable style={styles.row}>
                <Card style={styles.card}>
                  <View style={styles.meta}>
                    <ThemedText type="subtitle" numberOfLines={2}>
                      {item.title}
                    </ThemedText>
                    <ThemedText numberOfLines={1} style={{ color: muted }}>
                      {course ? course.title : t('noteDetail.noLinkedCourse')}
                    </ThemedText>
                    <ThemedText style={{ color: muted }}>{t(`status.${item.status}`)}</ThemedText>
                    <ThemedText style={{ color: muted }}>{formatUpdatedAt(item.updatedAt)}</ThemedText>
                  </View>
                </Card>
              </Pressable>
            </Link>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: { marginTop: 12, marginBottom: 8 },
  listWrapper: { flex: 1 },
  list: { gap: 10, paddingBottom: 16 },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 320,
  },
  row: { marginBottom: 10 },
  card: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  meta: { flex: 1, gap: 6, justifyContent: 'flex-start' },
});
