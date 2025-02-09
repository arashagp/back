/**
 * @type {import('prettier').Config}
 */
module.exports = {
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  printWidth: 140,
  arrowParens: 'always',
  proseWrap: 'preserve',
  bracketSpacing: false,
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  tabWidth: 2,
  bracketSameLine: true,
  plugins: [ require.resolve('prettier-plugin-tailwindcss'), require.resolve('prettier-plugin-packagejson') ],
};
