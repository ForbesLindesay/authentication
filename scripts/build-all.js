const {sync: spawnSync} = require('cross-spawn');

const onlyChanged = process.argv.includes('--only-changed');
const extraArgs = process.argv
  .slice(2)
  .filter((arg) => arg !== '--only-changed');
if (extraArgs.length) {
  console.log('unrecognised args: ', extraArgs);
}
const scriptArgs = onlyChanged ? [] : ['--force'];
const params = [
  '--stages',
  '--fast-exit',
  '--concurrency',
  4,
  // '--collect-logs',
  '--bin',
  'node',
  '-c',
  '../../scripts/build',
  ...scriptArgs,
];
console.log('wsrun', params);
const result = spawnSync('wsrun', params, {
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(1);
}
