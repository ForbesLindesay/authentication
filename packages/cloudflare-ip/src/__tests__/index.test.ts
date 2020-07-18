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
