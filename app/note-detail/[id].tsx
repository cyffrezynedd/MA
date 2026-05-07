import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SoftButton, DangerButton } from '@/components/ui/button';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMockCourseById } from '@/lib/mocks/courses';
import { deleteNote, getNoteById, type CourseNote } from '@/lib/db/notes';

export default function NoteDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = Number(id);
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');

  const [note, setNote] = useState<CourseNote | null>(null);

  const reloadNote = useCallback(async () => {
    if (!Number.isFinite(noteId)) {
      setNote(null);
      return;
    }
    setNote(await getNoteById(noteId));
  }, [noteId]);

  useFocusEffect(
    useCallback(() => {
      void reloadNote();
    }, [reloadNote])
  );

  const course = note ? getMockCourseById(note.courseId) : null;

  const formatUpdatedAt = (ms: number) => {
    const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
    return new Date(ms).toLocaleString(locale);
  };

  const onEdit = () => {
    if (!note) return;
    router.push({
      pathname: '/note-editor',
      params: { courseId: String(note.courseId), noteId: String(note.id) },
    });
  };

  const onDelete = () => {
    if (!note) return;
    Alert.alert(t('course.confirmDeleteTitle'), t('course.confirmDeleteText'), [
      { text: t('course.cancel'), style: 'cancel' },
      {
        text: t('course.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await deleteNote(note.id);
            router.back();
          })();
        },
      },
    ]);
  };

  const invalidId = !Number.isFinite(noteId);

  return (
    <Screen>
      <ScrollView
        style={webHiddenScrollbarStyle()}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <ThemedText type="title">{t('noteDetail.title')}</ThemedText>

        {invalidId || !note ? (
          <ThemedText style={{ color: muted }}>{t('noteDetail.notFound')}</ThemedText>
        ) : (
          <>
            <Card style={[styles.noteCard, { borderColor: border, backgroundColor: cardBg }]}>
              <ThemedText type="subtitle" style={{ color: textColor }}>
                {note.title}
              </ThemedText>
              {course ? (
                <ThemedText style={{ color: muted }}>
                  {t('noteDetail.courseLabel')}: {course.title}
                </ThemedText>
              ) : (
                <ThemedText style={{ color: muted }}>{t('noteDetail.noLinkedCourse')}</ThemedText>
              )}
              <ThemedText style={{ color: muted }}>
                {t(`status.${note.status}`)}
              </ThemedText>
              <ThemedText style={{ color: muted }}>
                {t('noteDetail.updatedAt')}: {formatUpdatedAt(note.updatedAt)}
              </ThemedText>
              <ThemedText type="subtitle" style={{ marginTop: 8 }}>
                {t('noteDetail.body')}
              </ThemedText>
              <ThemedText style={{ color: note.body.trim() ? textColor : muted }}>
                {note.body.trim() ? note.body : t('noteDetail.bodyEmpty')}
              </ThemedText>
            </Card>

            <View style={styles.actions}>
              <SoftButton title={t('course.cancel')} onPress={() => router.back()} style={styles.actionEqual} />
              <PrimaryButton title={t('course.edit')} onPress={onEdit} style={styles.actionEqual} />
            </View>
            <DangerButton title={t('course.delete')} onPress={onDelete} />
          </>
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
    gap: 8,
  },
  actions: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  actionEqual: { flex: 1, minWidth: 0 },
});
