---
title: Cookie Session
---

`@authentication/cookie-session` provides a very similar API to [cookie-session](https://www.npmjs.com/package/cookie-session) but with more secure defaults. This means it can be used to support other libraries that expect to have a standard express session available.

Advantages relative to `cookie-session`:

* We throw an error, rather than silently failing, if you forget to provide keys in production.
* We encrypt cookies, in addition to signing them.
* We automatically refresh cookies, so that sessions stay alive providing the user visits your site at least every `maxAge`.
* We polyfill `sameSitePolicy` to provide built in protection from CSRF attacks by default.

Disadvantages relative to `cookie-session`:

* Because we encrypt data by default, and store the signature as part of the cookie, you may hit size limits sooner than you would with `cookie-session`. It is a good idea to keep your `cookie-session` under 2,000 bytes to avoid this risk.

Advantages relative to non-cookie session providers:

* You do not need any database on the server side for `@authentication/cookie-session`, making it simpler to deploy.
* Because data comes with each request, load balancing should not cause any issues.

Disadvantages relative to non-cookie session providers:

* The amount of data you can store is limited to the size of the cookie.
* The entire session is sent with every request, which can hurt performance if your session is large.
* You must provide keys for signing and encryption, in order to securely use `@authentication/cookie-session`.

## Installation

To install, run the following command in your terminal:

```sh
yarn add @authentication/cookie-session
```

## Usage

In production, you will need to specify the `SECURE_KEY` environment variable, see [Signing](/docs/cookie.html#signing-encryption). If `process.env.NODE_ENV === 'development'`, signing is not required.

```typescript
import cookieSession from '@authentication/cookie-session';

app.use(
  cookieSession({
    maxAge: '24 hours'
  })
);
app.get('/set/:value', (req, res, next) => {
  req.session.value = parseInt(req.params.value, 10);
  res.send('session value set');
});
app.get('/remove', (req, res, next) => {
  req.session = null;
});
app.get('/get', (req, res, next) => {
  // value is `number | null`
  res.json(req.session.value);
});
```

```javascript
const cookieSession = require('@authentication/cookie');

app.use(
  cookieSession({
    maxAge: '24 hours'
  })
);
app.get('/set/:value', (req, res, next) => {
  req.session.value = parseInt(req.params.value, 10);
  res.send('session value set');
});
app.get('/remove', (req, res, next) => {
  req.session = null;
});
app.get('/get', (req, res, next) => {
  // value is `number | null`
  res.json(req.session.value);
});
```

## Options

You can pass a string as the `name` option to override the cookie name. For all other options, see [Cookie](/docs/cookie.html)
