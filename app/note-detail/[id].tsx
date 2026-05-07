import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMockCourseById } from '@/lib/mocks/courses';
import { getCourseNote } from '@/lib/mocks/course-progress';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');

  const course = useMemo(() => getMockCourseById(courseId), [courseId]);
  const [note, setNote] = useState('');

  const reloadNote = useCallback(async () => {
    if (!Number.isFinite(courseId)) return;
    setNote(await getCourseNote(courseId));
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      void reloadNote();
    }, [reloadNote])
  );

  return (
    <Screen>
      <ScrollView
        style={webHiddenScrollbarStyle()}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <ThemedText type="title">Заметка</ThemedText>

        {!course ? (
          <ThemedText style={{ color: muted }}>Курс не найден</ThemedText>
        ) : (
          <Card style={[styles.noteCard, { borderColor: border, backgroundColor: cardBg }]}>
            <ThemedText style={{ color: note.trim() ? textColor : muted }}>
              {note.trim() ? note : 'Текст заметки пуст'}
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  noteCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 160,
  },
});
