---
title: Cloudflare IP
---

A small utility to test if an IP address belongs to Cloudflare. This is based off their [publicly available list of IP Ranges](https://www.cloudflare.com/ips/). This utility automatically re-fetches that list once every 24 hours, and it has historically only changed once every few years, so your library shoudl always be up to date.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/cloudflare-ip
```

## Usage

Calling `isCloudflareIp` returns `true` if the IP address is within the range used by Cloudflare and `false` if it is not within the range used by Cloudflare.

```typescript
import isCloudflareIp from '@authentication/cloudflare-ip';

// non-cloudflare ips should be false
isCloudflareIp('66.249.66.1')                // false
isCloudflareIp('1.1.1.1')                    // false

// localhost should be false
isCloudflareIp('127.0.0.1'))                 // false
isCloudflareIp('::1'))                       // false

// cloudflare ips should pass
isCloudflareIp('103.21.244.0'))              // true
isCloudflareIp('2400:cb00:0000::0000'))      // true
```

```javascript
const isCloudflareIp = require('@authentication/cloudflare-ip');

// non-cloudflare ips should be false
isCloudflareIp('66.249.66.1')                // false
isCloudflareIp('1.1.1.1')                    // false

// localhost should be false
isCloudflareIp('127.0.0.1'))                 // false
isCloudflareIp('::1'))                       // false

// cloudflare ips should pass
isCloudflareIp('103.21.244.0'))              // true
isCloudflareIp('2400:cb00:0000::0000'))      // true
```

If you pass in a string that does not represent a valid IPv4 or IPv6 address, an error will be thrown.