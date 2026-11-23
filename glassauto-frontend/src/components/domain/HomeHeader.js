import { Image, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Avatar, IconButton, Txt } from '../ui';

const wordmark = require('../../../assets/glassauto-wordmark.png');

export function HomeHeader({ title, subtitle }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { unread } = useNotifications();
  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between">
        <View className="rounded-xl bg-white px-3 py-2">
          <Image
            source={wordmark}
            accessibilityLabel="GlassAuto Express"
            resizeMode="contain"
            style={{ width: 98, height: 26 }}
          />
        </View>
        <View className="flex-row items-center gap-3">
          <IconButton
            icon="bell-outline"
            label="Notifications"
            badge={unread}
            onPress={() => navigation.navigate('Notifications')}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mon profil"
            onPress={() => navigation.navigate('Profile')}
            className="active:opacity-70"
          >
            <Avatar name={user.full_name} size={44} />
          </Pressable>
        </View>
      </View>
      <View className="gap-1">
        <Txt size="xl" weight="display" accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? <Txt tone="soft">{subtitle}</Txt> : null}
      </View>
    </View>
  );
}
