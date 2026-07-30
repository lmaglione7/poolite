import { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  scaleTo?: number;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

// A single animated element (not Pressable wrapping a separate Animated.View)
// so layout styles like flex:1 apply to the actual flex child — nesting them
// on an inner view breaks flex distribution in a row (the parent doesn't see
// the size hint), which is exactly what happened in the floating tab bar.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mirrors the prototype's `style-active="transform:scale(.95)"` micro-interaction.
export function PressableScale({ scaleTo = 0.96, haptic = true, style, onPress, children, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <AnimatedPressable
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      onPress={(e: any) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
