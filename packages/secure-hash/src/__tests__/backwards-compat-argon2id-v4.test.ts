// backwards compatibility for secure-password ^4.0.0 implementation

import {verify} from '..';

jest.setTimeout(20_000);

const hashes = [
  'JGFyZ29uMmlkJHY9MTkkbT04Nzg5MCx0PTMwLHA9MSRUa2R2dU4xdEpxcytSc0s5V0tTYjRRJFpodnFCaE5vSm1hb3dvVnF5SkhjLzRkdzdIMUpHcG43b1d0ZExwa1B0NXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  'JGFyZ29uMmlkJHY9MTkkbT04Nzg5MCx0PTMwLHA9MSRaUGw4d2JRMW5hVStMUnRJczBFendBJHB1Z2FmYzJWNHp4RTI5Sk5IUHhxcGxobVVrVHNmWENZTHZtaUIzWDhTaTgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
];

test('valid', async () => {
  for (const hash of hashes) {
    expect(await verify('Hello World', hash, async () => {})).toBe(true);
  }
});

test('invalid', async () => {
  for (const hash of hashes) {
    const onUpdate = jest.fn(async () => {});
    expect(await verify('Whatever World', hash, onUpdate)).toBe(false);
    expect(onUpdate).not.toBeCalled();
  }
});
