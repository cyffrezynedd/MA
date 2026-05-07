import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SoftButton, DangerButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { NoteStatus } from '@/lib/db/notes';
import { createNote, deleteNote, getNoteById, updateNote } from '@/lib/db/notes';

export default function NoteEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const { courseId, noteId } = useLocalSearchParams<{ courseId: string; noteId?: string }>();
  const cid = Number(courseId);
  const nidRaw = noteId != null && String(noteId).length > 0 ? Number(noteId) : NaN;
  const nid = Number.isFinite(nidRaw) ? nidRaw : null;
  const isEdit = nid != null;

  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const brand3 = useThemeColor({}, 'brand3');

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

  const onDelete = useCallback(() => {
    if (nid == null) return;
    Alert.alert(t('course.confirmDeleteTitle'), t('course.confirmDeleteText'), [
      { text: t('course.cancel'), style: 'cancel' },
      {
        text: t('course.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await deleteNote(nid);
            router.back();
          })();
        },
      },
    ]);
  }, [nid, router, t]);

  return (
    <Screen>
      <ThemedText type="title">{isEdit ? t('course.edit') : t('course.addNote')}</ThemedText>

      <Card>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteTitle')}</ThemedText>
          <ThemedTextInput value={title} onChangeText={setTitle} />
        </View>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteBody')}</ThemedText>
          <ThemedTextInput value={body} onChangeText={setBody} style={styles.textarea} multiline />
        </View>

        <View style={styles.row}>
          {(['planned', 'in_progress', 'done'] as const).map((s) => {
            const active = status === s;
            return (
              <Pressable
                key={s}
                style={[
                  styles.chip,
                  active
                    ? { borderColor: `${brand3}AA`, backgroundColor: `${brand3}38` }
                    : { borderColor: border, backgroundColor: card },
                ]}
                onPress={() => setStatus(s)}>
                <ThemedText type="defaultSemiBold">{t(`status.${s}`)}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={styles.actions}>
        <SoftButton title={t('course.cancel')} onPress={() => router.back()} style={styles.actionEqual} />
        <PrimaryButton title={t('editor.save')} onPress={() => void onSave()} style={styles.actionEqual} />
      </View>
      {isEdit ? <DangerButton title={t('course.delete')} onPress={onDelete} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  textarea: { minHeight: 140, height: 140, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  chip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6, alignItems: 'stretch' },
  actionEqual: { flex: 1, minWidth: 0 },
});

