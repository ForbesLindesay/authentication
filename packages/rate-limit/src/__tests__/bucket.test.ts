import take, {BucketOptions} from '../bucket';

test('bucket', () => {
  const config: BucketOptions = {
    maxSize: 2,
    interval: 1000,
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
  "value": 0,
}
`);
  expect(take({value: 0, timestamp: 0}, config, 0)).toMatchInlineSnapshot(`
Object {
  "timestamp": 1000,
  "value": 0,
}
`);
  expect(take({value: 0, timestamp: 1000}, config, 0)).toMatchInlineSnapshot(`
Object {
  "timestamp": 2000,
  "value": 0,
}
`);
  expect(take({value: 0, timestamp: 1000}, config, 2500))
    .toMatchInlineSnapshot(`
Object {
  "timestamp": 2000,
  "value": 0,
}
`);
  expect(take({value: 0, timestamp: 1000}, config, 30000))
    .toMatchInlineSnapshot(`
Object {
  "timestamp": 30000,
  "value": 1,
}
`);
});
