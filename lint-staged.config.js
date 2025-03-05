module.exports = {
  '**/*.(ts|js)?(x)': (filenames) => [
    `eslint --fix ${filenames.map((file) => `"${file}"`).join(' ')}`,
    `prettier --write ${filenames.map((file) => `"${file}"`).join(' ')}`,
  ],
};
