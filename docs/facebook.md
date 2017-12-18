---
title: Facebook
---

This library provides authentication via Facebook's OAuth2 API.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/facebook
```

## Usage

First you need to get your "App ID" and "App Secret" from Facebook:

1. "Add a New App" on [Facebook's Apps Page](https://developers.facebook.com/apps/)
2. "+ Add Product" -> "Facebook Login" -> "Set Up"
3. Ignore the "Quickstart" and go to "Facebook Login" -> "Settings" in the sidebar.
4. Add your callback URL to "Valid OAuth redirect URIs" (e.g.
   `http://localhost:3000/__/auth/facebook`) then "Save Changes"
5. Go to "Settings" -> "Basic":
6. "Add Platform" -> "Website"
7. Enter site URL (e.g. http://localhost:3000/)
8. Add "localhost" (or your domain name) to "App Domains"
9. "Save Changes"
10. Copy "App ID" into the `FACEBOOK_APP_ID` environment variable
11. Copy "App Secret" into `FACEBOOK_APP_SECRET` environment variable

For the sign in process, the user is first directed to Facebook, where they are asked if they want to grant your website permission to see their information, then Facebook redirects them back to your website at the `callbackURL` - which must be one of the "Valid OAuth redirect URIs".

The `__` prefix is a convention to mean "do not cache these requests in a
service worker" it is supported out of the box by moped/create-react-app/etc.
You can choose any URL to be the `callbackURL` as long as it matches the URL you
gave to Facebook.

When the user posts to http://localhost:3000/__/auth/facebook they will be re-directed to Facebook to complete the sign in. Facebook will then redirect them back to the `callbackURL`, with additional info in the query. You can check if the user decided to cancel the login by calling `userCancelledLogin`, otherwise calling `completeAuthentication` may throw an error.

Once the user has successfully logged in, calling `completeAuthentication`
returns a `profile` with info about the user (e.g. their `id` and `emails`), an
`accessToken` (for further API requests) and a `refreshToken` if you need to
request new access tokens.

```typescript
import FacebookAuthentication from '@authentication/facebook';
import express = require('express');

const app = express();

const facebookAuthentication = new FacebookAuthentication<{message: string}>({
  callbackURL: '/__/auth/facebook'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      facebookAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(facebookAuthentication.callbackPath, async (req, res, next) => {
  facebookAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(facebookAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (facebookAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken, // use this to make requests to the Facebook API on behalf of the user
      refreshToken,
      profile,
      state // => {message: 'Hello world'}
    } = await facebookAuthentication.completeAuthentication(req, res);
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

```javascript
const FacebookAuthentication = require('@authentication/facebook');
const express = require('express');

const app = express();

const facebookAuthentication = new FacebookAuthentication({
  callbackURL: '/__/auth/facebook'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      facebookAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(facebookAuthentication.callbackPath, async (req, res, next) => {
  facebookAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(facebookAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (facebookAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken, // use this to make requests to the Facebook API on behalf of the user
      refreshToken,
      profile,
      state // => {message: 'Hello world'}
    } = await facebookAuthentication.completeAuthentication(req, res);
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

## API

### Constructor

```typescript
import FacebookAuthentication from '@authentication/facebook';

const facebookAuthentication = new FacebookAuthentication<State>(options);
```

```javascript
const FacebookAuthentication = require('@authentication/facebook');

const facebookAuthentication = new FacebookAuthentication(options);
```

Options:

* `appID` (required, `string`) - defaults to `process.env.FACEBOOK_APP_ID`. This is the App ID you get from Facebook. It is needed to tell Facebook which application is being signed into.
* `appSecret` (required, `string`) - defaults to `process.env.FACEBOOK_APP_SECRET`. This is the App Secret you get from Facebook. It is needed to verify the account with Facebook.
* `callbackURL` (required, `string | URL`) - a relative or absolute [URL](https://nodejs.org/api/url.html#url_class_url) that represents the path that will handle facebook's callbacks.
* `cookieKeys` (optional, `string[]`) - Optionally sign the cookie used to store the `state` between the two steps of the oauth process
* `cookieName` (optional, `string`) - Optionally override the name of the cookie used to store the `state` between the two steps of the oauth process (defaults to `'authentication_oauth2'`).
* `trustProxy` (optional, `boolean`) - If `callbackURL` is a relative URL, it will be resolved relative to the request URL. If `trustProxy` is true it will trust `x-forwarded` headers. You can also use the `BASE_URL` environment varialbe to specify the base url.

### isCallbackRequest

```js
const isCallbackRequest = facebookAuthentication.isCallbackRequest(req);
```

Returns `true` if the request has parameters indicating that it is a callback
from facebook. If this returns `false` you should call `redirectToProvider` and
redirect to the resulting URL.

### userCancelledLogin

```js
const userCancelledLogin = facebookAuthentication.userCancelledLogin(req);
```

Returns `true` if the user clicked "Cancel" at some point in the login process and facebook redirected them back to your app. You should probably return the user to the login page at this point, instead of displaying an error.

### redirectToProvider

```js
facebookAuthentication.redirectToProvider(req, res, next, options);
```

Redirect the user to Facebook with the appropriate parameters to request access to their profile.

Options:

* `scope` (optional, `string | string[]`) - defaults to `DEFAULT_SCOPE`, see [Facebook's OAuth Docs](https://developers.facebook.com/docs/facebook-login/permissions/) for a full list of possible scopes.
* `state` (optional, `State`) - a JSON serializeable value that you can use once the authentication is complete. This is useful for recording where the user was before they started to log in - e.g. a URL to redirect them to after login is complete or an action that the user wanted to take as soon as they are logged in.
* `display` (optional, `string`) - use this to control the look and feel of the permissions page - see https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
* `isReRequest` (optional, `boolean`) - If a user declines your app a given permission, Facebook will not re-request that permission unless you explicilty pass `{isReRequest: true}`. You might want to do this after explaining in more detail why you need a given permission.

### completeAuthentication

```js
const {
  accessToken,
  refreshToken,
  profile,
  rawProfile, // the raw profile is the un-normalized data from Facebook
  state,
} = await facebookAuthentication.completeAuthentication(req, res, options);
```

Verifies the supplied authentication info with Facebook and returns an
`accessToken` and a `profile`. It also returns the `state` that you passed in
when calling `redirectToProvider`. See [Profile](./profile.md) for more info on the fields available in the `profile` object.

Options:

* `imageSize` (optional, `number`) - The prefered profile image size in pixels. Facebook will always return a range of a few sizes in the `images` array but specifying this will override the contents of the `image` property on the `profile`.
* `profileFields` (optional, `string[]`) - Request additional fields as part of the profile request. By default, fields needed for `profile` are fetched, providing the appropriate scope was included.

### callbackPath

The `callbackPath` property is just a string pathname from the url you passed in as the `callbackURL`. This is there so you don't have to keep repeating it.
