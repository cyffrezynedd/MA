import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export function Card({ style, ...rest }: ViewProps) {
  const bg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
});

