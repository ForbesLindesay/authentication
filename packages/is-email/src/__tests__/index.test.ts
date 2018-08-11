import isEmail, {isNotEmail} from '../';

test('isEmail empty', () => {
  expect(isEmail(5 as any)).toBe(false);
  expect(isEmail(null as any)).toBe(false);
  expect(isEmail('')).toBe(false);
});

test('isEmail invalid', () => {
  expect(isEmail('debt')).toBe(false);
  expect(isEmail('@example.com')).toBe(false);
  expect(isEmail('debt@example')).toBe(false);
  expect(isEmail('debt@-example.com')).toBe(false);
  expect(isEmail('debt@example-.com')).toBe(false);
  expect(isEmail('debt@example!com')).toBe(false);
  expect(isEmail('debt@')).toBe(false);
  const longLabel = new Array(65).join('a');
  // Should reject over 63 character domain labels.
  expect(isEmail('debt@' + longLabel + longLabel + '.com')).toBe(false);
});

test('isEmail valid', () => {
  const longLabel = new Array(64).join('a');

  expect(isEmail(longLabel + longLabel + '@example.com')).toBe(true);
  // Should accept 63 character domain labels.
  expect(isEmail('debt@' + longLabel + '.com')).toBe(true);
  expect(isEmail(".!#$%&'*+/=?^_`{|}~-a9@example.com")).toBe(true);
});

test('isNotEmail empty', () => {
  expect(isNotEmail(5 as any)).toBe(true);
  expect(isNotEmail(null as any)).toBe(true);
  expect(isNotEmail('')).toBe(true);
});

test('isNotEmail invalid', () => {
  expect(isNotEmail('debt')).toBe(true);
  expect(isNotEmail('@example.com')).toBe(true);
  expect(isNotEmail('debt@example')).toBe(true);
  expect(isNotEmail('debt@-example.com')).toBe(true);
  expect(isNotEmail('debt@example-.com')).toBe(true);
  expect(isNotEmail('debt@example!com')).toBe(true);
  expect(isNotEmail('debt@')).toBe(true);
  const longLabel = new Array(65).join('a');
  // Should reject over 63 character domain labels.
  expect(isNotEmail('debt@' + longLabel + longLabel + '.com')).toBe(true);
});

test('isNotEmail valid', () => {
  const longLabel = new Array(64).join('a');

  expect(isNotEmail(longLabel + longLabel + '@example.com')).toBe(false);
  // Should accept 63 character domain labels.
  expect(isNotEmail('debt@' + longLabel + '.com')).toBe(false);
  expect(isNotEmail(".!#$%&'*+/=?^_`{|}~-a9@example.com")).toBe(false);
});
