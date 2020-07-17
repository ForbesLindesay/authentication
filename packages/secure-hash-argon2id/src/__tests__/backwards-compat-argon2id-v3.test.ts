// backwards compatibility for secure-password ^3.0.0 implementation

import {verify} from '../';

jest.setTimeout(20_000);

const hashes = [
  'JGFyZ29uMmlkJHY9MTkkbT04Nzg5MCx0PTMwLHA9MSRuRk1HZzlIVlZxMGZyeWhqUXRkbXB3JEsyMjZkRW1rUnhFSU8wN1JpY20vdno4TVFyQnNWbkk5dk9MbDN5aDIwTVUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  'JGFyZ29uMmlkJHY9MTkkbT04Nzg5MCx0PTMwLHA9MSR2ekl5NCs4Nkk3VUFBNXZjRUJrRmxRJDVlcTVBSnN4UHJYN3BudXRtd0NFUEZzaEEzL0twV2hGR2xSVDk1NkJUWlEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
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
