import take, {ExponentialOptions} from '../exponential';

test('bucket', () => {
  const config: ExponentialOptions = {
    baseDelay: 1000,
    factor: 2,
    freeAttempts: 2,
  };
  expect(take(null, config, 0)).toMatchInlineSnapshot(`
    Object {
      "timestamp": 0,
      "value": 1,
    }
  `);
  expect(take({value: 1, timestamp: 0}, config, 0)).toMatchInlineSnapshot(`
    Object {
      "timestamp": 0,
      "value": 2,
    }
  `);
  expect(take({value: 2, timestamp: 0}, config, 0)).toMatchInlineSnapshot(`
Object {
  "timestamp": 1000,
  "value": 3,
}
`);
  expect(take({value: 3, timestamp: 1000}, config, 1000))
    .toMatchInlineSnapshot(`
Object {
  "timestamp": 3000,
  "value": 4,
}
`);
  expect(take({value: 3, timestamp: 1000}, config, 0)).toMatchInlineSnapshot(`
Object {
  "timestamp": 3000,
  "value": 4,
}
`);
  expect(take({value: 4, timestamp: 3000}, config, 50000))
    .toMatchInlineSnapshot(`
Object {
  "timestamp": 50000,
  "value": 5,
}
`);
});
