import { View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../ui';

export function CalendarArrow({ direction }) {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-steel">
      <Icon
        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
        size={22}
        color={colors.chrome}
      />
    </View>
  );
}
