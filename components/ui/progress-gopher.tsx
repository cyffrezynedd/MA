import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  progress: number; // 0..100
  label?: string;
};

const LEARNED_GOPHER = require('@/assets/images/sticker_learned.png');

/** Ширина колонки под стикер + зазор до полосы (как в прежнем layout `gap: 12`). */
const STICKER_W = 64;
const STICKER_COL = STICKER_W + 12;

export function ProgressGopher({ progress, label }: Props) {
  const p = Math.max(0, Math.min(100, progress));
  const track = useThemeColor({}, 'border');
  const fill = useThemeColor({}, 'progressFill');
  const muted = useThemeColor({}, 'muted');

  const anim = useRef(new Animated.Value(p)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: p,
      useNativeDriver: false, // width/height
      tension: 90,
      friction: 14,
    }).start();
  }, [anim, p]);

  const widthPct = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const stickerRevealHeight = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 94],
  });

  const pctText = useMemo(() => `${Math.round(p)}%`, [p]);
  const isCompleted = p >= 100;

  if (isCompleted) {
    return (
      <View style={styles.onlyStickerWrap}>
        <Image source={LEARNED_GOPHER} style={styles.stickerDone} contentFit="contain" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <ThemedText type="defaultSemiBold">{label ?? 'Прогресс'}</ThemedText>
        <ThemedText type="defaultSemiBold" style={[styles.headerPct, { color: muted }]}>
          {pctText}
        </ThemedText>
      </View>

      <View style={styles.barStickerRow}>
        <View style={styles.barLayer}>
          <View style={[styles.barOuter, { borderColor: track }]}>
            <Animated.View style={[styles.barFill, { backgroundColor: fill, width: widthPct }]} />
          </View>
        </View>

        <View style={styles.stickerTrack}>
          <Image source={LEARNED_GOPHER} style={[styles.sticker, styles.stickerGhost]} contentFit="contain" />
          <Animated.View style={[styles.reveal, { height: stickerRevealHeight }]}>
            <Image source={LEARNED_GOPHER} style={styles.sticker} contentFit="contain" />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10, width: '100%' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerPct: {
    flexShrink: 0,
    marginLeft: 12,
  },

  /** Ряд фиксированной высоты: полоса по центру зоны слева от стикера, гофер прижат вправо. */
  barStickerRow: {
    width: '100%',
    height: 94,
    position: 'relative',
  },
  /** Центр по горизонтали и вертикали в области без стикера (64 + 12). */
  barLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: STICKER_COL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barOuter: {
    width: '88%',
    maxWidth: '100%',
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center',
  },
  barFill: { height: '100%', borderRadius: 999 },

  stickerTrack: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: STICKER_W,
    height: 94,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reveal: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sticker: { width: 64, height: 94 },
  stickerGhost: { opacity: 0.22, position: 'absolute', bottom: 0 },

  onlyStickerWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  stickerDone: { width: 82, height: 116 },
});
