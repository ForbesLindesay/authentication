import {Address4, Address6} from 'ip-address';
import getCloudflareIps, {cachedCloudflareIps} from './getCloudflareIps';

let lastFetch = 0;
let lastResult = cachedCloudflareIps.map(intoAddress);
function getIPAddressesCached(
  cacheDuration: number,
  onError?: (err: Error) => void,
) {
  if (Date.now() - lastFetch > cacheDuration) {
    lastFetch = Date.now();
    getCloudflareIps().then(
      updated => {
        lastResult = updated.map(intoAddress);
      },
      error => {
        lastFetch = 0;
        if (onError) {
          onError(error);
        }
      },
    );
  }
  return lastResult;
}

// returns undefined | Address4 | Address6
function intoAddress(str: string) {
  const ipv6: Address6 | Address4 = new Address6(str.trim());
  if (ipv6.valid) return ipv6;
  const ipv4 = new Address4(str.trim());
  if (ipv4.valid) return ipv4;
  throw new Error(`"${str}" is not a valid ip address`);
}

const DEFAULT_OPTIONS = {cacheDuration: 24 * 60 * 60_000};
export default function isCloudflareIp(
  ip: string,
  {
    cacheDuration,
    onError,
  }: {cacheDuration: number; onError?: (err: Error) => void} = DEFAULT_OPTIONS,
) {
  const testIp = intoAddress(ip);
  if (!testIp) return false;
  const cloudflareIps = getIPAddressesCached(cacheDuration, onError);
  return cloudflareIps.some(cf => testIp.isInSubnet(cf));
}
