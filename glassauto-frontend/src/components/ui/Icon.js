import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';

export function Icon({ name, size = 22, color = colors.ink }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
