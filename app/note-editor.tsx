import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SoftButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { NoteStatus } from '@/lib/db/notes';
import { createNote, getNoteById, updateNote } from '@/lib/db/notes';

export default function NoteEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const { courseId, noteId } = useLocalSearchParams<{ courseId: string; noteId?: string }>();
  const cid = Number(courseId);
  const nid = noteId ? Number(noteId) : null;
  const isEdit = useMemo(() => Number.isFinite(nid ?? NaN), [nid]);

  const border = useThemeColor({}, 'border');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<NoteStatus>('planned');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isEdit || nid == null) return;
      const existing = await getNoteById(nid);
      if (!existing || cancelled) return;
      setTitle(existing.title);
      setBody(existing.body);
      setStatus(existing.status);
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, nid]);

  const onSave = useCallback(async () => {
    const tt = title.trim();
    const bb = body.trim();
    if (!tt || !bb || !Number.isFinite(cid)) {
      Alert.alert(t('editor.required'));
      return;
    }
    if (isEdit && nid != null) {
      await updateNote(nid, { title: tt, body: bb, status });
    } else {
      await createNote({ courseId: cid, title: tt, body: bb, status });
    }
    router.back();
  }, [body, cid, isEdit, nid, router, status, t, title]);

  return (
    <Screen withGradient={false}>
      <ThemedText type="title">{isEdit ? t('course.edit') : t('course.addNote')}</ThemedText>

      <Card>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteTitle')}</ThemedText>
          <TextInput value={title} onChangeText={setTitle} style={[styles.input, { borderColor: border }]} />
        </View>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteBody')}</ThemedText>
          <TextInput
            value={body}
            onChangeText={setBody}
            style={[styles.input, styles.textarea, { borderColor: border }]}
            multiline
          />
        </View>

        <View style={styles.row}>
          {(['planned', 'in_progress', 'done'] as const).map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, { borderColor: border }, status === s ? styles.chipActive : undefined]}
              onPress={() => setStatus(s)}>
              <ThemedText type="defaultSemiBold">{t(`status.${s}`)}</ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.actions}>
        <SoftButton title={t('course.cancel')} onPress={() => router.back()} />
        <PrimaryButton title={t('editor.save')} onPress={() => void onSave()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  input: {
    fontFamily: 'Inter_400Regular',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  textarea: { height: 140 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  chip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  chipActive: { backgroundColor: 'rgba(0, 194, 255, 0.10)' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
});

