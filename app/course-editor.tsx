import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SoftButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { getCourseById, updateCourse } from '@/lib/db/courses';

export default function CourseEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = id ? Number(id) : null;
  const isEdit = useMemo(() => Number.isFinite(courseId ?? NaN), [courseId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isEdit || courseId == null) return;
      const existing = await getCourseById(courseId);
      if (!existing || cancelled) return;
      setTitle(existing.title);
      setDescription(existing.description);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, isEdit]);

  const onSave = useCallback(async () => {
    const tt = title.trim();
    const dd = description.trim();
    if (!tt || !dd) {
      Alert.alert(t('editor.required'));
      return;
    }

    if (isEdit && courseId != null) {
      const existing = await getCourseById(courseId);
      if (!existing) {
        Alert.alert(t('editor.creatorOnlyTitle'), t('editor.creatorOnlyMessage'));
        return;
      }
      await updateCourse(courseId, { title: tt, description: dd });
      router.back();
      return;
    }

    Alert.alert(t('editor.creatorOnlyTitle'), t('editor.creatorOnlyMessage'));
  }, [courseId, description, isEdit, router, t, title]);

  return (
    <Screen>
      <ThemedText type="title">{isEdit ? t('course.edit') : t('catalog.add')}</ThemedText>

      <Card>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteTitle')}</ThemedText>
          <ThemedTextInput value={title} onChangeText={setTitle} />
        </View>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteBody')}</ThemedText>
          <ThemedTextInput
            value={description}
            onChangeText={setDescription}
            style={styles.textarea}
            multiline
          />
        </View>
      </Card>

      <View style={styles.actions}>
        <SoftButton title={t('course.cancel')} onPress={() => router.back()} style={styles.actionEqual} />
        <PrimaryButton title={t('editor.save')} onPress={() => void onSave()} style={styles.actionEqual} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  textarea: { minHeight: 140, height: 140, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6, alignItems: 'stretch' },
  actionEqual: { flex: 1, minWidth: 0 },
});

