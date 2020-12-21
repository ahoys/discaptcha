import path from 'path';

export default {
  mode: 'production',
  target: 'web',
  entry: path.resolve('src/discaptcha.ts'),
  output: {
    path: path.resolve('build'),
    filename: 'discaptcha.js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: 'babel-loader',
        include: [path.resolve('src')],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules'],
  },
  node: {
    fs: 'empty',
  },
};
