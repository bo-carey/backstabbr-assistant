import * as path from 'path';
import { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WebExtPlugin from 'web-ext-plugin';

const buildTarget: string = process.env.BUILD_TARGET || 'firefox';
const gameLocation = process.env.GAME_LOCATION || '';

const config: Configuration = {
  entry: {
    main: ['./src/index.ts'],
  },
  output: {
    path: path.resolve(__dirname, `dist/${buildTarget}`),
    filename: 'main.js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(gif|jpe?g|png)$/,
        include: path.resolve('target/shared/icons/'),
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'ts-loader',
        options: {
          configFile: path.resolve('./tsconfig.json'),
          compilerOptions: {
            noEmit: false,
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'target/shared/' }, { from: `target/${buildTarget}/` }],
    }),
    new WebExtPlugin({
      sourceDir: path.resolve(__dirname, `dist/${buildTarget}`),
      artifactsDir: path.resolve(__dirname, `dist`),
      buildPackage: true,
      overwriteDest: true,
      outputFilename: `${buildTarget}.zip`,
      browserConsole: false,
      startUrl: gameLocation,
      firefoxProfile: 'default',
    }),
  ],
  stats: {
    warnings: false,
  },
};

export default config;