import SecureHash from '../pbkdf2';

// Generated with 50,000 iterations
const OLD_HASH =
  '2:UMMAABAAAAAAAgAAAAIAAHY/tFKCjUDjiiWOtGH7Zano3yf8NE39uQpsO+HG3oIB2T6e+w28QuaggmQweYfXQYvhes4/yvffl1suIleEs4IMLD+4w7fw3RP0rORrziVoR4qh5/7QthJeoS3ZeQXJyaazasBrCmB6xVlMKACzk6X79hXoI942gqONePK/3/ehUvkKeaU/lAdH8e1CYWxMMREcremVfd8oll0jGhokpcU1EB6JnM1BqV4lTbWSjM70JpM3Vk2wdxJ/9FGUa/TVoOfGnOtO7UX2EvEvhtlSjQrPfZmNDr7hIWd+bjz9OTkuvb0dbCy1SjT45ZN43RB35EUZX/7ezHqc8w4pYuA9FznOkZcSWjw9VncrIh0BhcNCgjA7E/29zqE1hN1gyCcS2+E1q7Jg1lWvt/KORbl9WME2P0Fsi0tPpeHRbv50IEBv1hfEf41HEw585FLpwKhVYwgwgERtYbd+iF3vdkDWVSqeYctU8ztxjCC3jS3Dk0uZcHQLQPF0l3uqoFRS2ZnEGeH+qJxlKZPSsgJLP1FTQPFod71QHThZEymaATzLPBXo2ovsjkoMZvdcDWQ1dw//tJCcFpxvgtvvPL+ahGkXMKrXv5RzYQcPoJGteWjbQORFLNuWrfJwqWkL+JtmMMIQi/iJz2xb3k5RgDPhkybp/4hJxZt7jtVX9cqRYMiC7jNB1EGjVdB18Xs7RZmn/Kv7sQ==';

jest.setTimeout(50000);
test('pbkdf2', async () => {
  const sh = new SecureHash({
    minimumHashTime: '200ms',
  });

  const start = Date.now();
  const hash = await sh.hash('Hello World');
  const end = Date.now();
  expect(end - start).toBeGreaterThan(200);
  const start2 = Date.now();
  const verified = await sh.verify('Hello World', hash, async _updatedHash => {
    expect(false).toBe(true);
  });
  const end2 = Date.now();
  expect(end2 - start2).toBeGreaterThan(200);
  expect(verified).toBe(true);

  // hashing the same password multiple times should produce different results because passwords are salted
  const hash2 = await sh.hash('Hello World');
  expect(hash).not.toEqual(hash2);
});

test('argon2id update', async () => {
  const sh = new SecureHash({
    iterations: 100_000,
    minimumHashTime: '200ms',
  });
  let updated = false;
  const start = Date.now();
  const verified = await sh.verify(
    'Hello World',
    OLD_HASH,
    async updatedHash => {
      updated = true;
      const verified = await sh.verify(
        'Hello World',
        updatedHash,
        async updatedHash => {
          expect(false).toBe(true);
        },
      );
      expect(verified).toBe(true);
    },
  );
  const end = Date.now();
  expect(updated).toBe(true);
  expect(end - start).toBeGreaterThan(500);
  expect(verified).toBe(true);
});
