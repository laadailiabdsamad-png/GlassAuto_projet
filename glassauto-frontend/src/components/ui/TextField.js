import { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { colors, fonts } from '../../theme';
import { Field } from './Field';
import { Icon } from './Icon';
import { Txt } from './Txt';

const resetOutline = Platform.OS === 'web' ? { outlineStyle: 'none' } : null;

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  icon,
  secure = false,
  multiline = false,
  maxLength,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const border = error ? 'border-crimson' : focused ? 'border-chrome' : 'border-edge';

  return (
    <Field label={label} error={error} hint={hint}>
      <View
        className={`flex-row rounded-field border bg-carbon px-4 ${border} ${multiline ? 'min-h-[112px] items-start py-3' : 'h-[54px] items-center'}`}
      >
        {icon ? (
          <View className="mr-3">
            <Icon name={icon} size={20} color={focused ? colors.chrome : colors.mute} />
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mute}
          secureTextEntry={hidden}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.crimson}
          accessibilityLabel={label || placeholder}
          style={[
            {
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.ink,
              padding: 0,
              minHeight: multiline ? 84 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            resetOutline,
          ]}
          {...rest}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            onPress={() => setHidden((current) => !current)}
            hitSlop={12}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.mute} />
          </Pressable>
        ) : null}
      </View>
      {multiline && maxLength ? (
        <Txt size="xs" tone="mute" align="right">
          {value.length} / {maxLength}
        </Txt>
      ) : null}
    </Field>
  );
}
