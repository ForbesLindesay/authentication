import {KeygripSecret, KeygripPublic, KeygripPassThrough, Keygrip} from '../';

const KEY_A = 'skadfjweiosdfnkadlsjfjew8hioehfsfs';
const KEY_B = 'sdajf923q84hsdfy89ewhfvsdfjias98vh';
const KEY_C = 'saf8p90q34ny48sercuicnxousdifmcasj';
const payload = Buffer.from('Hello World');

const testPackUnpack = (getGrip: (keys: string[]) => Keygrip) => {
  const kg = new KeygripSecret([KEY_A, KEY_B, KEY_C]);
  const packed = kg.pack(payload);
  const unpacked = kg.unpack(packed);

  expect(unpacked).toBeTruthy();
  expect(unpacked!.outdated).toBe(false);
  expect(unpacked!.payload.toString('utf8')).toBe('Hello World');

  const kg2 = new KeygripSecret([KEY_B, KEY_C, KEY_A]);
  const unpacked2 = kg2.unpack(packed);
  expect(unpacked2).toBeTruthy();
  expect(unpacked2!.outdated).toBe(true);
  expect(unpacked2!.payload.toString('utf8')).toBe('Hello World');

  const kg3 = new KeygripSecret([KEY_B, KEY_C]);
  const unpacked3 = kg3.unpack(packed);
  expect(unpacked3).toBe(null);
};
test('KeygripSecret', () => {
  testPackUnpack(keys => new KeygripSecret(keys));
  const kg = new KeygripSecret([KEY_A]);
  const packed = kg.pack(payload);
  expect(packed.toString('hex').includes(payload.toString('hex'))).toBe(false);
});

test('KeygripPublic', async () => {
  testPackUnpack(keys => new KeygripPublic(keys));
  const kg = new KeygripPublic([KEY_A]);
  const packed = kg.pack(payload);
  expect(packed.toString('hex').includes(payload.toString('hex'))).toBe(true);
});

test('KeygripPassThrough', async () => {
  const kg = new KeygripPassThrough();
  const packed = kg.pack(Buffer.from('Hello World'));
  const unpacked = kg.unpack(packed);

  expect(unpacked).toBeTruthy();
  expect(unpacked!.outdated).toBe(false);
  expect(unpacked!.payload.toString('utf8')).toBe('Hello World');
});
