import getCloudflareIps, {cachedCloudflareIps} from '../getCloudflareIps';
import isCloudflareIp from '..';

test('getCloudflareIps', async () => {
  const currentIps = await getCloudflareIps();
  expect(currentIps).toEqual(cachedCloudflareIps);
});

test('isCloudflareIp - ipv4', () => {
  expect(isCloudflareIp('172.68.34.53')).toBe(true);
  expect(isCloudflareIp('240.68.34.53')).toBe(false);
});

test('isCloudflareIp - ipv4 subnet', () => {
  expect(isCloudflareIp('188.114.96.0/20')).toBe(true);
  expect(isCloudflareIp('188.114.96.0/19')).toBe(false);
});

test('isCloudflareIp - ipv6', () => {
  expect(isCloudflareIp('2405:8100:ffff:ffff:ffff:ffff:ffff:ffff')).toBe(true);
  expect(isCloudflareIp('2405:8101:ffff:ffff:ffff:ffff:ffff:ffff')).toBe(false);
});

test('isCloudflareIp - ipv6 subnet', () => {
  expect(isCloudflareIp('2405:8100::/32')).toBe(true);
  expect(isCloudflareIp('2405:8100::/16')).toBe(false);
});

test('compatibility with https://github.com/danneu/cloudflare-ip', () => {
  // non-cloudflare ips should be false
  expect(isCloudflareIp('66.249.66.1')).toBe(false);
  expect(isCloudflareIp('1.1.1.1')).toBe(false);
  // localhost should be false
  expect(isCloudflareIp('127.0.0.1')).toBe(false);
  expect(isCloudflareIp('::1')).toBe(false);
  // cloudflare ips should pass
  expect(isCloudflareIp('103.21.244.0')).toBe(true);
  expect(isCloudflareIp('2400:cb00:0000::0000')).toBe(true);
});
test('changes from https://github.com/danneu/cloudflare-ip', () => {
  // garbage should throw an error
  // N.B. this deviates from the behaviour of https://github.com/danneu/cloudflare-ip
  expect(() => (isCloudflareIp as any)()).toThrow();
  expect(() => (isCloudflareIp as any)('')).toThrow();
  expect(() => (isCloudflareIp as any)(0)).toThrow();
  expect(() => (isCloudflareIp as any)('chicken')).toThrow();
});
