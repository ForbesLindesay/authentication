import request from 'then-request';

// These typically change once every few years at most.
// We check they are up to date as part of running tests.
// They are also upated on app startup and then again every 24 hours.
export const cachedCloudflareIps = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/12',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];
export default async function getCloudflareIps() {
  const files = await Promise.all([
    request('GET', 'https://www.cloudflare.com/ips-v4').getBody('utf8'),
    request('GET', 'https://www.cloudflare.com/ips-v6').getBody('utf8'),
  ]);

  const subnets = files
    .map(range => {
      const results = range.split('\n').filter(Boolean);
      if (results.length === 0) {
        throw new Error('a list was empty');
      }
      return results;
    })
    .reduce((a, b) => [...a, ...b], []);

  return subnets;
}
