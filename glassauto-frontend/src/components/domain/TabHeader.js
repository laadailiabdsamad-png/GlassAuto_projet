import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../hooks/useNotifications';
import { IconButton, Txt } from '../ui';

export function TabHeader({ title, subtitle, actionIcon, actionLabel, onAction }) {
  const navigation = useNavigation();
  const { unread } = useNotifications();
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 gap-0.5">
        <Txt size="xl" weight="display" accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? (
          <Txt size="sm" tone="soft">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      <View className="flex-row gap-3">
        {actionIcon ? <IconButton icon={actionIcon} label={actionLabel} onPress={onAction} /> : null}
        <IconButton
          icon="bell-outline"
          label="Notifications"
          badge={unread}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>
    </View>
  );
}
