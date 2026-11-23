const palette = require('./src/theme/palette');

module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: palette,
      fontFamily: {
        body: ['Barlow_400Regular'],
        medium: ['Barlow_500Medium'],
        semi: ['Barlow_600SemiBold'],
        bold: ['Barlow_700Bold'],
        display: ['BarlowSemiCondensed_600SemiBold'],
        figure: ['BarlowSemiCondensed_700Bold'],
        slant: ['BarlowSemiCondensed_800ExtraBold_Italic'],
      },
      borderRadius: {
        field: '14px',
        card: '20px',
        plate: '28px',
      },
    },
  },
  plugins: [],
};
