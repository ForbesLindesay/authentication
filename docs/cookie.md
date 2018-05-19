---
title: Cookie
---

Cookie provides a simple way to store session state in a cookie. It is secure by default (even including built in CSRF protection for all non-GET requests).

## Installation

To install, run the following command in your terminal:

```sh
yarn add @authentication/cookie
```

## Usage

In production, you will need to specify the `SECURE_KEY` environment variable, see [Signing & Encryption](#signing-encryption). If `process.env.NODE_ENV === 'development'`, signing is not required.

```typescript
import Cookie from '@authentication/cookie';

const cookie = new Cookie<number>(
  /* cookie name */ 'session_id',
  /* options */ {
    maxAge: '30 days'
  }
);

app.use(cookie.refresh);
app.get('/set-cookie/:value', (req, res, next) => {
  cookie.set(req, res, parseInt(req.params.value, 10));
  res.send('cookie set');
});
app.get('/remove-cookie', (req, res, next) => {
  cookie.remove(req, res);
});
app.get('/get-cookie', (req, res, next) => {
  // value is `number | null`
  const value = cookie.get(req, res);
  res.json(value);
});
```

```javascript
const Cookie = require('@authentication/cookie');

const cookie = new Cookie(
  /* cookie name */ 'session_id',
  /* options */ {
    maxAge: '30 days'
  }
);

app.use(cookie.refresh);
app.get('/set-cookie/:value', (req, res, next) => {
  cookie.set(req, res, parseInt(req.params.value, 10));
  res.send('cookie set');
});
app.get('/remove-cookie', (req, res, next) => {
  cookie.remove(req, res);
});
app.get('/get-cookie', (req, res, next) => {
  // value is `number | null`
  const value = cookie.get(req, res);
  res.json(value);
});
```

## Signing & Encryption

> If your app is running on heroku, you can just enable the [secure key](https://elements.heroku.com/addons/securekey) addon for free, which will automatically provide the value of `SECURE_KEY` that `@authentication/cookie` needs, and will automatically handle key rotation for you.

If cookies are not signed, users can maliciously send your application arbitrary data in the cookie. For most uses of cookies, that would be problematic. For this reason, `@authentication/cookie` requires you to sign your cookies by default. If you don't encrypt your cookies, any malicious user can read the infomration stored in cookies. For this reason, `@authentication/cookie` also requires you to encrypt your cookies by default.

The easiest way to do this is to set the `SECURE_KEY` environment variable to a secret, random string. The other option is to pass an array containing a secret, random string as the `keys` option. Enviornment variables are the recommended approach as it is generally easier to keep them secret.

### Key Rotation

It is a good idea to rotate the keys on a regular basis. This way if an old key is compromised, it will not affect the security of the current application.

To enable this, `@authentication/cookie` lets you pass an array of keys (separate keys with a `,` if using `SECURE_KEY`). The first key is always used whenever creating cookies, subsequent keys are accepted when reading cookies. Once `maxAge` has expired, you can safely delete old keys.

### Encryption Policy & Signing Policy

You can import the `SigningPolicy` enum via:

```typescript
import Cookie, {EncryptionPolicy, SigningPolicy} from '@authentication/cookie';
```

```javascript
const Cookie = require('@authentication/cookie');
const EncryptionPolicy = Cookie.EncryptionPolicy;
const SigningPolicy = Cookie.SigningPolicy;
```

Then you can specify one of:

```typescript
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  encryptionPolicy: EncryptionPolicy.Required, // default in production
  signingPolicy: SigningPolicy.Required // default in production
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  encryptionPolicy: EncryptionPolicy.Optional, // default in development
  signingPolicy: SigningPolicy.Optional // default in development
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  encryptionPolicy: EncryptionPolicy.Disabled,
  signingPolicy: SigningPolicy.Disabled
});
```

```javascript
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  encryptionPolicy: EncryptionPolicy.Required, // default in production
  signingPolicy: SigningPolicy.Required // default in production
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  encryptionPolicy: EncryptionPolicy.Optional, // default in development
  signingPolicy: SigningPolicy.Optional // default in development
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  encryptionPolicy: EncryptionPolicy.Disabled,
  signingPolicy: SigningPolicy.Disabled
});
```

* `Required` - This is the default in production. The cookie **must** be signed/encrypted. If no keys are provided and `SECURE_KEY` is empty, an error will be thrown.

  If this option is selected for `signingPolicy`, you can trust that any value in a cookie was set by the server. If this option is selected for `encryptionPolicy`, you can trust that any value in a cookie will not be exposed to users.

* `Optional` - This can be used in libraries where you do not expect the server to need to trust data sent in cookies, but you wish to enable signing/encryption if the `SECURE_KEY` environment variable is set.

  Note that if `SECURE_KEY` is not set, this is equivalent to `Disabled`.

* `Disabled` - Use this if you know that you will not need to trust the data stored in the cookie. For example, you could use this for something like a user preference for font-size.

  Note that if you select this for `signingPolicy`, you cannot trust **anything** about the value you get back in the cookie, including what type of data it contains.

  Note that if you select this for `encryptionPolicy`, all data you set in cookies is visible to users, even if you have selected `serverSideOnly`.

If encryption is enabled, signing must also be enabled. Disabling signing but enabling encryption will result in an error being thrown.

## CSRF / Same Site Policy

CSRF is a method for maliciously doing something on a web app without someone's permission. It works by pursuading the victim to visit a malicious website, which then posts to the application being manipulated. The post will happen with the user's authenticated session. By default, `@authentication/cookie` pevents this attack by ignoring all cookies on cross origin requests, except for `GET` requests. This provides good security by default, providing you stick the the golden rule:

> Never perform side effects for `GET` requests.

i.e. you should never modify your database, or perform actions as a result of a `GET` request. A malicious person can send your user a link which may cause them to make a `GET` request.

If you want, you can disable `@authentication/cookie`'s same site policy, or make it more strict by passing the `sameSitePolicy` option.

```typescript
import Cookie, {SameSitePolicy} from '@authentication/cookie';
```

```javascript
const Cookie = require('@authentication/cookie');
const SameSitePolicy = Cookie.SameSitePolicy;
```

Then you can specify one of:

```typescript
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  sameSitePolicy: SameSitePolicy.Strict
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  sameSitePolicy: SameSitePolicy.Lax // default
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  sameSitePolicy: SameSitePolicy.AnySite
});
```

```javascript
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  sameSitePolicy: SameSitePolicy.Strict
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  sameSitePolicy: SameSitePolicy.Lax // default
});
// or
const cookie = new Cookie('session_id', {
  maxAge: '30 days',
  sameSitePolicy: SameSitePolicy.AnySite
});
```

* `Strict` - Ignore cookies on all cross origin requests, even `GET` requests. This will lead to user's seeing the un-authenticated state for your application if they follow a link from elsewhere.
* `Lax` - Ignore cookies on cross origin requests, except `GET` requests. This prevents CSRF for all non-GET requests.
* `AnySite` - Allows all cross origin requests. This approach may be preferable for tracking codes for analytics, but it is **not** recommended for session IDs/user IDs etc.

## API

### `Cookie`

The `Cookie` class represents the API for a given cookie. It is the main, default export for `@authentication/cookie`.

#### `constructor(name: string, options: Options)`

You must pass a `name` for the cookie. Each instance of the cookie class should have a unique name, allowing you to store multiple separate cookies on the client.

You must also pass in `options`:

* `encryptionPolicy` (optional, `EncryptionPolicy`) - See [Signing & Encryption](#signing-encryption), `EncryptionPolicy.Required` by default if `NODE_ENV!=='development'`, otherwise `EncryptionPolicy.Optional`.
* `baseURL` (optional, `string | URL`) - A base url used to check the sameSite policy. If this is not set, we will attempt to infer the baseURL from the request's headers. You can also specify this via the `BASE_URL` environment variable.
* `domain` (optional, `string`) - a string indicating the domain of the cookie (no default).
* `serverSideOnly` (optional, `boolean`) - a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript (`true` by default).
* `keys` (optionalish, `string[]`) - Defaults to `process.env.SECURE_KEY.split(',')`. Required by default. See [Signing & Encryption](#signing-encryption) for more info.
* `maxAge` (required, `number | string | CookieSession`) - The max age of the cookie. Set this to `Cookie.Session` if you want the cookie to expire when the user closes their browser. You can set this to a number in milliseconds, or a string that gets interpreted by the [ms](https://www.npmjs.com/package/ms#examples) library.
* `overwrite` (optional, `boolean`) - a boolean indicating whether to overwrite previously set cookies of the same name (true by default). If this is true, all cookies set during the same request with the same name (regardless of path or domain) are filtered out of the Set-Cookie header when setting this cookie.
* `path` (optional, `string`) - a string indicating the path of the cookie (/ by default).
* `sameSite` (optional, `SameSitePolicy`) - See [CSRF/Same Site Policy](#csrf-same-site-policy)
* `httpsOnly` (optional, `boolean`) - a boolean indicating whether the cookie is only to be sent over HTTPS (false by default for HTTP, true by default for HTTPS).
* `signingPolicy` (optional, `SigningPolicy`) - See [Signing & Encryption](#signing-encryption), `SigningPolicy.Required` by default if `NODE_ENV!=='development'`, otherwise `SigningPolicy.Optional`. You cannot disable signing unless you disable encryption.

#### `cookie.set(req, res, value)`

Set the `cookie` to the `value` for the current `req`/`res` pair. Subsequent calls to `cookie.get` will then return `value`.

#### `cookie.get(req, res)`

Get the cookie for the current `req`/`res` pair. Returns `null` if no value was set.

#### `cookie.remove(req, res)`

Remove the cookie for the current `req`/`res` pair. Subsequent calls to `cookie.get` will return `null.

#### `cookie.refresh(req, res, next)`

Update the cookie without changing it's value. This extends the cookie to the `maxAge` set in `options`. It's generally a good idea to do this on every request. N.B. if no cookie is set, this is a no-op.

`next` is optional, if provided it is called after refreshing the cookie.
