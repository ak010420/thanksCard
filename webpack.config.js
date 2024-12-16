const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: './.env', // .envファイルのパス
      safe: true, // .env.exampleが必要な場合に有効
    }),
  ],
};