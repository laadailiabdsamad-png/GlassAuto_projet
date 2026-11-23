import { Platform, Pressable, TextInput, View } from 'react-native';
import { colors, fonts } from '../../theme';
import { Icon } from './Icon';

const resetOutline = Platform.OS === 'web' ? { outlineStyle: 'none' } : null;

export function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View className="h-12 flex-row items-center rounded-2xl border border-white/10 bg-carbon px-4">
      <Icon name="magnify" size={20} color={colors.mute} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mute}
        selectionColor={colors.crimson}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        style={[
          {
            flex: 1,
            marginLeft: 10,
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.ink,
            padding: 0,
          },
          resetOutline,
        ]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          onPress={() => onChangeText('')}
          hitSlop={12}
        >
          <Icon name="close-circle" size={18} color={colors.mute} />
        </Pressable>
      ) : null}
    </View>
  );
}
