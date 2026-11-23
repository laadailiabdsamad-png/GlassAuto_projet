import palette from './palette';

export const colors = palette;

export const tones = {
  amber: { fg: palette.amber, bg: 'rgba(240,177,60,0.13)' },
  sky: { fg: palette.sky, bg: 'rgba(108,171,255,0.13)' },
  violet: { fg: palette.violet, bg: 'rgba(178,155,255,0.14)' },
  chrome: { fg: palette.chrome, bg: 'rgba(205,203,202,0.13)' },
  success: { fg: palette.success, bg: 'rgba(63,202,140,0.13)' },
  crimson: { fg: palette.ember, bg: 'rgba(212,21,20,0.2)' },
  mute: { fg: palette.mute, bg: 'rgba(145,142,141,0.14)' },
};

export const chartSeries = ['#d41514', '#3987e5', '#c98500', '#199e70'];

export const chromeGradient = ['#f6f5f4', '#cdcbca', '#b3b0af', '#dedcdb'];

export const glassGradient = ['rgba(255,255,255,0.075)', 'rgba(255,255,255,0.025)'];

export const fonts = {
  body: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semi: 'Barlow_600SemiBold',
  bold: 'Barlow_700Bold',
  display: 'BarlowSemiCondensed_600SemiBold',
  figure: 'BarlowSemiCondensed_700Bold',
  slant: 'BarlowSemiCondensed_800ExtraBold_Italic',
};

export const navigationTheme = {
  dark: true,
  colors: {
    primary: palette.crimson,
    background: palette.obsidian,
    card: palette.carbon,
    text: palette.ink,
    border: palette.steel,
    notification: palette.crimson,
  },
  fonts: {
    regular: { fontFamily: fonts.body, fontWeight: '400' },
    medium: { fontFamily: fonts.medium, fontWeight: '500' },
    bold: { fontFamily: fonts.semi, fontWeight: '600' },
    heavy: { fontFamily: fonts.bold, fontWeight: '700' },
  },
};
