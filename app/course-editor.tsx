import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SoftButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createCourse, getCourseById, updateCourse } from '@/lib/db/courses';
import { useApp } from '@/providers/app-provider';

export default function CourseEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = id ? Number(id) : null;
  const isEdit = useMemo(() => Number.isFinite(courseId ?? NaN), [courseId]);
  const { role } = useApp();

  const border = useThemeColor({}, 'border');

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
    if (role !== 'creator') {
      Alert.alert(t('editor.creatorOnlyTitle'), t('editor.creatorOnlyMessage'));
      return;
    }
    const tt = title.trim();
    const dd = description.trim();
    if (!tt || !dd) {
      Alert.alert(t('editor.required'));
      return;
    }
    if (isEdit && courseId != null) {
      await updateCourse(courseId, { title: tt, description: dd });
    } else {
      await createCourse({ title: tt, description: dd });
    }
    router.back();
  }, [courseId, description, isEdit, role, router, t, title]);

  return (
    <Screen withGradient={false}>
      <ThemedText type="title">{isEdit ? t('course.edit') : t('catalog.add')}</ThemedText>

      <Card>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteTitle')}</ThemedText>
          <TextInput value={title} onChangeText={setTitle} style={[styles.input, { borderColor: border }]} />
        </View>
        <View style={styles.field}>
          <ThemedText type="subtitle">{t('editor.noteBody')}</ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textarea, { borderColor: border }]}
            multiline
          />
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
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
});

