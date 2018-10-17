import generatePassCode, {Encoding} from '../';

jest.mock('crypto', () => ({
  randomBytes(count: number, cb: (err: null, buf: Buffer) => void) {
    const seed = Buffer.from(
      'OxhR9el5IAHiwyAuaoWb9I/8+pVCu9zE0uE8sR779wOjDagq+U3lIZX3n2lmqa97S9qSmUnSHCwIuAc/R5xX0wnjG+UT8vCpApqYserXQGMhRZ73lxLv/7Imw4v3gqsHPwOW9YGOZtNf7RsIz/xct3UPILJyiLyhCTIK2CSFhItpycdya3f9kGZ7gDOTbJOmXKIrarFYqE0e4e3iqvqw34nbxvXEmlPQpSf/wqCKENZspIg1xfXcQQoapKBDmHWLKgDRcDXHWelXu0XeQ3gDMBz434HOsnqbh5e9Y32BUMIkZTtXEKihRNxU+0Wpmo4DcojyyJDJdmxffdKTEAiSiLHeEa5OeRgUfvLvRrlDiEQnhC59dAWYmuKKayuxatikA3OMH8IsW0KqeE7YoFHGJaXEl94LfQ8UlCgX/syTdvYTdDRThkhsMZ3dgnkmhyvoFgw74difZGEZmrMY+Cmye1mEu+FVEwEDkd9IZmV9GPqP2kST5cxC1yUdzYz/pPz2a4oOO+RUls4RjWp7ZzCgfBX7yKcpIlOt+a6x3SbM1oFTyzBV5UhinSfHYQsfQbKytL/djFfwBdvZanvJpsIp+uT1Wnkhj/3hrCZsW86DHC6dql2PbwZrB+1dXz//aUsD0hyBcp4AWypSuepv9tsaw6u+accEnvKm/JQyu4NnOSh3CKB2VEOUOuT2Tntg/rOM5RSFTh7jkJ2zpFdLZYb+n4Jwm3RISKlT8/j0jP0+FkbVSKAJYGxIBDZ0GqZgDPplnOCXcPRpWL/i5rt3gUnspQVLU5ezywTSKgyEvQEha/fVDg0pN2tA4jIw/TJRHFdQFIra8W0KGxQeRW5ZX2Pwb0ledFeH91Uz6z5ZbGyYpMBokdA3jT4BJuQIA15LM1BBtx5/Vc++6P5zjv47Uf8EXVdRmiffdyOFFKez7OAZzD8kxZKVL9iY2vqPEe5xjO01nomONaoK4r1EQ+5GVYH/XGD4pzS7heLD5PfJwbmNYprW9y+nOCKNzYb+ebbr4voEDNiu+TImyHNq//K/W4M5omnNsK66w0AnUA44qYE3wzSLUFHet0oAIyeABn2wmojcN2z5xZAbeeGOz6GOmaopLIxvamlvxC0X/VCOKbcWs0eKQyQXWxCzrLJJwJtPcSDhEPlhzr4STdXR7YVcK/u2lTOvpQ7odSPy2Z+VrnzOV/L0CLVbK+1QNl3CZwwuPjFadbY1kxL6o7IoxR/3yb1BR/NzukR8JzXyTQoxmmYKHEs+IQiQRqUYR+tbM4KTXYPrPlAFOtuz4MPt2Lw9JnnjYMQ7FD00DNAuOC55RrIvxWOSwFPWjEc7IJsl',
      'base64',
    );
    const result = Buffer.allocUnsafe(count);
    seed.copy(result, 0, 0, count);
    return cb(null, result);
  },
}));

test('generatePassCode(40)', async () => {
  const passCode = await generatePassCode(40);
  expect(passCode.length).toBe(40);
  expect(passCode).toMatchSnapshot();
});

test('generatePassCode(40, Encoding.decimal)', async () => {
  const passCode = await generatePassCode(40, Encoding.decimal);
  expect(passCode.length).toBe(40);
  expect(passCode).toMatchSnapshot();
});

test('generatePassCode(40, Encoding.hex)', async () => {
  const passCode = await generatePassCode(40, Encoding.hex);
  expect(passCode.length).toBe(40);
  expect(passCode).toMatchSnapshot();
});

test('generatePassCode(40, Encoding.base32)', async () => {
  const passCode = await generatePassCode(40, Encoding.base32);
  expect(passCode.length).toBe(40);
  expect(passCode).toMatchSnapshot();
});

test('generatePassCode(40, Encoding.base64)', async () => {
  const passCode = await generatePassCode(40, Encoding.base64);
  expect(passCode.length).toBe(40);
  expect(passCode).toMatchSnapshot();
});

test('generatePassCode(40, Encoding.base91)', async () => {
  const passCode = await generatePassCode(40, Encoding.base91);
  expect(passCode.length).toBe(40);
  expect(passCode).toMatchSnapshot();
});

test('generatePassCode(40, {custom})', async () => {
  expect(
    await generatePassCode(40, {
      upperCaseLetters: true,
      lowerCaseLetters: true,
      numbers: true,
      symbols: true,
    }),
  ).toMatchSnapshot('everything');
  expect(
    await generatePassCode(40, {
      upperCaseLetters: true,
      lowerCaseLetters: true,
      numbers: true,
      symbols: false,
    }),
  ).toMatchSnapshot('no symbols');
  expect(
    await generatePassCode(40, {
      upperCaseLetters: true,
      lowerCaseLetters: true,
      numbers: false,
      symbols: true,
    }),
  ).toMatchSnapshot('no numbers');
  expect(
    await generatePassCode(40, {
      upperCaseLetters: true,
      lowerCaseLetters: false,
      numbers: true,
      symbols: true,
    }),
  ).toMatchSnapshot('no lower case letters');
  expect(
    await generatePassCode(40, {
      upperCaseLetters: false,
      lowerCaseLetters: true,
      numbers: true,
      symbols: true,
    }),
  ).toMatchSnapshot('no upper case letters');
});
