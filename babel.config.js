module.exports = {
  presets: ['babel-preset-expo'], // ✅ đổi dòng này
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@assets': './src/assets',
          '@app-navigation': './src/app-navigation',
          '@app-views': './src/app-views',
          '@app-uikits': './src/app-uikits',
          '@app-components': './src/app-components',
          '@app-helper': './src/app-helper',
          '@app-services': './src/app-services',
          '@app-context': './src/app-context',
          '@app-schemas': './src/app-schemas',
          '@app-layout': './src/app-layout',
          '@redux': './src/redux',
        },
      },
    ],
    'react-native-reanimated/plugin', // luôn ở cuối
  ],
};