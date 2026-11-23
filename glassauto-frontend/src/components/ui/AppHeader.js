import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

export function AppHeader({ title, subtitle, right }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8 }} className="bg-obsidian px-5 pb-3">
      <View className="w-full max-w-[720px] flex-row items-center gap-3 self-center">
        <IconButton icon="arrow-left" label="Retour" onPress={() => navigation.goBack()} />
        <View className="flex-1">
          <Txt size="lg" weight="display" numberOfLines={1} accessibilityRole="header">
            {title}
          </Txt>
          {subtitle ? (
            <Txt size="sm" tone="mute" numberOfLines={1}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
