---
title: Get Request URL
---

A small utility to get the original URL that a request was made with. e.g. if your user types `http://example.com/foo/bar` into the address bar, and it loads the web page on your server, this should return `http://example.com/foo/bar`.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/request-url
```

## Usage

Calling `getRequestURL` with either an express request or koa context returns the `URL` object representing the full URL that the visitor navigated to in order to load the page.

```typescript
import getRequestURL from '@authentication/cloudflare-ip';
import express from 'express';

const app = express();

app.use((req, res) => {
  res.send(`The URL you requested is: ${getRequestURL(req).href}`);
});

app.listen(process.env.PORT || 3000);
```

```javascript
const getRequestURL = require('@authentication/cloudflare-ip');
const express = require('express');

const app = express();

app.use((req, res) => {
  res.send(`The URL you requested is: ${getRequestURL(req).href}`);
});

app.listen(process.env.PORT || 3000);
```

### Trust Proxy

If you run your app behind a proxy in production, you will also need to pass `{trustProxy: true}`. `trustProxy` is enabled by default if `NODE_ENV=development` to make it easier to use `getRequestURL` with setups like webpack-dev-server.

**N.B.** If a malicious user finds a way to bypass the proxy, or if the proxy does not overwrite the `x-forwarded-host` and `x-forwarded-proto` headers, it may be possible for a malicous attacker to force this function to return a URL for a server you do not control.

### Base URL

Instead of setting `trustProxy`, if you know the host name you expect your app to be running on, you should set the `baseURL` option. This is much more secure. You can use an environment variable to support different values between development, staging and production:

```typescript
import getRequestURL from '@authentication/cloudflare-ip';
import express from 'express';

const app = express();

app.use((req, res) => {
  res.send(`The URL you requested is: ${getRequestURL(req, {
    // set this variable to something like: https://www.example.com
    baseURL: process.env.BASE_URL,
  }).href}`);
});

app.listen(process.env.PORT || 3000);
```

```javascript
const getRequestURL = require('@authentication/cloudflare-ip');
const express = require('express');

const app = express();

app.use((req, res) => {
  res.send(`The URL you requested is: ${getRequestURL(req, {
    // set this variable to something like: https://www.example.com
    baseURL: process.env.BASE_URL,
  }).href}`);
});

app.listen(process.env.PORT || 3000);
```
