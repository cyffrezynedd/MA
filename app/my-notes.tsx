import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { MOCK_COURSES, type MockCourse } from '@/lib/mocks/courses';
import { filterCourseIdsWithNotes } from '@/lib/mocks/course-progress';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useApp } from '@/providers/app-provider';

export default function MyNotesScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const muted = useThemeColor({}, 'muted');
  const notesEmptyFallback = language === 'ru' ? 'Заметок пока нет' : 'No notes yet';
  const [courses, setCourses] = useState<MockCourse[]>([]);

  const reload = useCallback(async () => {
    const ids = await filterCourseIdsWithNotes(MOCK_COURSES.map((c) => c.id));
    const idSet = new Set(ids);
    setCourses(MOCK_COURSES.filter((c) => idSet.has(c.id)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return (
    <Screen tabBarClearance="minimal">
      <ThemedText type="title">{t('home.myNotes')}</ThemedText>

      <FlatList
        data={courses}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={courses.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedText style={{ color: muted }}>
            {t('notesScreen_emptyList', { defaultValue: notesEmptyFallback })}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/note-detail/[id]', params: { id: String(item.id) } }} asChild>
            <Pressable style={styles.row}>
              <Card style={styles.card}>
                <Image source={item.preview} contentFit="cover" style={styles.preview} />
                <View style={styles.meta}>
                  <ThemedText type="subtitle" numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText numberOfLines={3}>{item.description}</ThemedText>
                </View>
              </Card>
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 16 },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: 16 },
  row: { marginBottom: 10 },
  card: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  preview: { width: 98, height: 98, borderRadius: 14 },
  meta: { flex: 1, gap: 6, justifyContent: 'flex-start' },
});
