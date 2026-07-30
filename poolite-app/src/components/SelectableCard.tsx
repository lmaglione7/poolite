import { StyleSheet, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';

export function SelectableCard({
  selected,
  onPress,
  style,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  return (
    <PressableScale
      scaleTo={0.96}
      onPress={onPress}
      style={[
        styles.base,
        { backgroundColor: selected ? colors.selectedBg : colors.card, borderColor: selected ? colors.accent : colors.border },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    borderWidth: 2,
  },
});
