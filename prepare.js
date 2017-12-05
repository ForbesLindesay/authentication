const writeFileSync = require('fs').writeFileSync;
const unlinkSync = require('fs').unlinkSync;
const babel = require('babel-core');
const lsrSync = require('lsr').lsrSync;

const pkg = require(__dirname +
  '/packages/' +
  process.argv[2] +
  '/package.json');
lsrSync(__dirname + '/packages/' + process.argv[2] + '/lib').forEach(entry => {
  if (entry.isFile() && /\.jsx?$/.test(entry.path)) {
    writeFileSync(
      entry.fullPath.replace(/\.jsx$/, '.js'),
      babel.transformFileSync(entry.fullPath, {
        babelrc: false,
        presets: [
          pkg['@authentication/target'] === 'browser'
            ? require.resolve('@moped/babel-preset/browser')
            : require.resolve('@moped/babel-preset/server'),
        ],
      }).code,
    );
    if (/\.jsx$/.test(entry.fullPath)) {
      unlinkSync(entry.fullPath);
    }
  }
});
