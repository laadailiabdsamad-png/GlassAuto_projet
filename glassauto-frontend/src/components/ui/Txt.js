import { Text } from 'react-native';

const SIZES = {
  xs: 'text-[12px] leading-[16px]',
  sm: 'text-[13px] leading-[18px]',
  base: 'text-[15px] leading-[21px]',
  md: 'text-[17px] leading-[23px]',
  lg: 'text-[20px] leading-[25px]',
  xl: 'text-[26px] leading-[31px]',
  '2xl': 'text-[34px] leading-[38px]',
  '3xl': 'text-[46px] leading-[50px]',
};

const WEIGHTS = {
  body: 'font-body',
  medium: 'font-medium',
  semi: 'font-semi',
  bold: 'font-bold',
  display: 'font-display',
  figure: 'font-figure',
  slant: 'font-slant',
};

const TONES = {
  ink: 'text-ink',
  soft: 'text-soft',
  mute: 'text-mute',
  chrome: 'text-chrome',
  obsidian: 'text-obsidian',
  plate: 'text-[#4b4847]',
  white: 'text-white',
  crimson: 'text-crimson',
  ember: 'text-ember',
  success: 'text-success',
  amber: 'text-amber',
  sky: 'text-sky',
  violet: 'text-violet',
};

const ALIGNS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Txt({
  size = 'base',
  weight = 'body',
  tone = 'ink',
  align = 'left',
  className = '',
  children,
  ...rest
}) {
  return (
    <Text
      maxFontSizeMultiplier={1.25}
      className={`${SIZES[size]} ${WEIGHTS[weight]} ${TONES[tone]} ${ALIGNS[align]} ${className}`}
      {...rest}
    >
      {children}
    </Text>
  );
}
