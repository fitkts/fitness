const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 공통 설정
const commonConfig = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          }
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
};

// 메인 프로세스 설정
const mainConfig = {
  ...commonConfig,
  entry: './src/main/main.ts',
  target: 'electron-main',
  externalsPresets: { node: true },
  externals: {
    'better-sqlite3': 'commonjs2 better-sqlite3'
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js',
  },
};

// 렌더러 프로세스 설정
const rendererConfig = {
  ...commonConfig,
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'renderer.js',
    publicPath: './',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    port: 5000,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      publicPath: './',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
      publicPath: './'
    }),
  ],
};

module.exports = [mainConfig, rendererConfig]; 
