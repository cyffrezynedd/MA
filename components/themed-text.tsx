import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 26,
  },
  defaultSemiBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    lineHeight: 26,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 28,
  },
  link: {
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 32,
    fontSize: 17,
    color: '#0a7ea4',
  },
});
