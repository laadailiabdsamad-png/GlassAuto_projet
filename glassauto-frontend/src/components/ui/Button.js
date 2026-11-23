import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

const VARIANTS = {
  primary: { box: 'bg-crimson', text: 'white', color: '#ffffff' },
  chrome: { box: 'bg-chrome', text: 'obsidian', color: colors.obsidian },
  outline: { box: 'border border-edge bg-transparent', text: 'ink', color: colors.ink },
  danger: { box: 'border border-crimson bg-transparent', text: 'ember', color: colors.ember },
  subtle: { box: 'bg-steel', text: 'ink', color: colors.ink },
};

const HEIGHTS = {
  md: 'h-[52px] px-5 rounded-field',
  sm: 'h-[44px] px-4 rounded-xl',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className = '',
  accessibilityHint,
}) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const style = VARIANTS[variant];

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handlePress = async () => {
    const outcome = onPress ? onPress() : null;
    if (outcome && typeof outcome.then === 'function') {
      setBusy(true);
      try {
        await outcome;
      } finally {
        if (mounted.current) {
          setBusy(false);
        }
      }
    }
  };

  const inactive = disabled || busy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={handlePress}
      className={`flex-row items-center justify-center active:opacity-80 ${HEIGHTS[size]} ${style.box} ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      {busy ? (
        <ActivityIndicator color={style.color} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? <Icon name={icon} size={size === 'sm' ? 18 : 20} color={style.color} /> : null}
          <Txt size={size === 'sm' ? 'sm' : 'base'} weight="semi" tone={style.text} numberOfLines={1}>
            {label}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}
