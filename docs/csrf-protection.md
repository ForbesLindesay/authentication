---
title: CSRF Protection
---

@authentication/csrf-protection provides protection from CSRF attacks that is ridiculously easy to implement. CSRF attacks can be really serious, so you should always protect against them.

P.S. if you're using @authentication/cookie, it already provides some builtin CSRF protection.

## Installation

To install, run the following command in your terminal:

```sh
yarn add @authentication/csrf-protection
```

## Usage

Simply add one line to the start of your express app.

```typescript
import express = require('express');
import csrfProtection from '@authentication/csrf-protection';

const app = express();

app.use(csrfProtection());

// ... the rest of your app ...
// Yes, it really is that simple!
```

```javascript
const express = require('express');
const csrfProtection = require('@authentication/csrf-protection');

const app = express();

app.use(csrfProtection());

// ... the rest of your app ...
// Yes, it really is that simple!
```

> It is important that you never modify any state in a `GET` request. CSRF Protection does not apply to `GET` requests because this would result in the user seeing the app in a logged out state whenever they followed a link to it.

### Options

* `errorHandler`, (optional, `(req: Request, res, Response, next: NextFunction, headers: {host: string, referer?: URL, origin?: URL}) => any`) - Override the default error handling behvaiour for when the `referer` and `origin` are not provided or do not match the `host`.
* `host` (optional, `string`) - The host (e.g. `www.example.com`). By defualt, this is extracted from the request headers, but if you are running behind a reverse proxy, you may need to specify this manually.
* `ignoreMethods`, (optional, `string[]`) - The array of methods to ignore, defaults to `['GET', 'HEAD', 'OPTIONS']`.

### Proxies

Some proxies can modify the `host` header (this is not true of most cloud providers, such as cloudflare and heroku). This could lead to legitimate requests from your application being treated as cross-origin and rejected. To prevent this, you can either provide the `host` option to explicitly override the request's host, or set the `BASE_URL`/`BASE_URI` environment variable.
