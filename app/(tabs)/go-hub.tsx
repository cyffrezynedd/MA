import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { webHiddenScrollbarStyle } from '@/components/ui/scrollbar-hidden';
import { useGoHubViewModel } from '@/hooks/use-go-hub-view-model';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { GoHubRepository } from '@/lib/go-hub/types';

export default function GoHubScreen() {
  const { t } = useTranslation();
  const muted = useThemeColor({}, 'muted');
  const brand = useThemeColor({}, 'brand');

  const { repos, loading, error, fromCache, isOffline, refresh } = useGoHubViewModel();

  const openRepo = async (url: string) => {
    await openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
  };

  const renderItem = ({ item }: { item: GoHubRepository }) => (
    <Card style={styles.card}>
      <ThemedText type="defaultSemiBold">{item.fullName}</ThemedText>
      {item.description ? (
        <ThemedText style={[styles.desc, { color: muted }]} numberOfLines={3}>
          {item.description}
        </ThemedText>
      ) : null}
      <ThemedText style={[styles.meta, { color: muted }]}>
        {t('goHub.stars', { count: item.stargazersCount })}
        {item.language ? ` · ${item.language}` : ''}
      </ThemedText>
      <PrimaryButton
        title={t('goHub.open')}
        onPress={() => void openRepo(item.htmlUrl)}
        style={styles.openRepoBtn}
      />
    </Card>
  );

  return (
    <Screen>
      <ThemedText type="title">{t('goHub.title')}</ThemedText>

      {isOffline ? (
        <View style={[styles.banner, { borderColor: muted, backgroundColor: `${brand}18` }]}>
          <ThemedText type="defaultSemiBold">{t('goHub.offlineTitle')}</ThemedText>
          <ThemedText style={{ color: muted }}>{t('goHub.offlineHint')}</ThemedText>
        </View>
      ) : null}

      {fromCache && !isOffline && repos.length > 0 ? (
        <View style={[styles.banner, { borderColor: muted, backgroundColor: `${brand}12` }]}>
          <ThemedText style={{ color: muted }}>{t('goHub.cacheBanner')}</ThemedText>
        </View>
      ) : null}

      {loading && repos.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={brand} />
          <ThemedText style={[styles.loadingLabel, { color: muted }]}>{t('goHub.loading')}</ThemedText>
        </View>
      ) : null}

      {error === 'offline_empty' ? (
        <ThemedText style={[styles.empty, { color: muted }]}>{t('goHub.emptyOffline')}</ThemedText>
      ) : null}

      {error && error !== 'offline_empty' ? (
        <ThemedText style={[styles.empty, { color: muted }]}>{error}</ThemedText>
      ) : null}

      <FlatList
        data={repos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        style={webHiddenScrollbarStyle()}
        refreshControl={<RefreshControl refreshing={loading && repos.length > 0} onRefresh={() => void refresh()} />}
        contentContainerStyle={repos.length === 0 ? styles.listEmpty : styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  card: { gap: 8 },
  desc: { marginTop: 4 },
  meta: { fontSize: 13 },
  openRepoBtn: { alignSelf: 'stretch', marginTop: 8 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  loadingLabel: { fontSize: 14 },
  empty: { textAlign: 'center', paddingVertical: 12 },
  list: { paddingBottom: 8, gap: 12 },
  listEmpty: { flexGrow: 1 },
});
