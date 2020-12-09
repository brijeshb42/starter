module.exports = {
  purge: process.env.NODE_ENV === 'development' ? false : {
    enabled: true,
    content: [
      './src/**/*.ts',
      './src/**/*.tsx',
      './src/**/*.scss',
      './src/*.css',
      './src/*.tsx',
      './src/*.html',
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
