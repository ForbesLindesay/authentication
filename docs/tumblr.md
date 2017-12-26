---
title: Tumblr
---

This library provides authentication via Tumblr's OAuth1 API.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/tumblr
```

## Usage

Register an application with Tumblr. You can create a new application on [Tumblr's OAuth Apps Page](https://www.tumblr.com/oauth/apps). Set the Default Callback URL to `http://localhost:3000/__/auth/tumblr` for this example. Copy the OAuth consumer key into the `TUMBLR_CONSUMER_KEY` environment variable and the OAuth consumer secret into the `TUMBLR_CONSUMER_SECRET` environment variable.

The `__` prefix is a convention to mean "do not cache these requests in a
service worker" it is supported out of the box by moped/create-react-app/etc.
You can choose any URL to be the `callbackURL` as long as it matches the URL you
gave to Tumblr.

When the user posts to http://localhost:3000/__/auth/tumblr they will be
re-directed to Tumblr to complete the sign in. Tumblr will then redirect them
back to the `callbackURL`, with additional info in the query. You can check if
the user decided to cancel the login by calling `userCancelledLogin`, otherwise
calling `completeAuthentication` may throw an error.

Once the user has successfully logged in, calling `completeAuthentication`
returns a `profile` with info about the user (e.g. their `id`), and a
`token` & `tokenSecret` (for further API requests) if you need to
request new access tokens.

```typescript
import TumblrAuthentication from '@authentication/tumblr';
import express = require('express');

const app = express();

const tumblrAuthentication = new TumblrAuthentication<{message: string}>({
  callbackURL: '/__/auth/tumblr'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      tumblrAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(tumblrAuthentication.callbackPath, async (req, res, next) => {
  tumblrAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(tumblrAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (tumblrAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      token,
      tokenSecret,
      profile,
      state // => {message: 'Hello world'}
    } = await tumblrAuthentication.completeAuthentication(req, res);
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

```javascript
const TumblrAuthentication = require('@authentication/tumblr');
const express = require('express');

const app = express();

const tumblrAuthentication = new TumblrAuthentication({
  callbackURL: '/__/auth/tumblr'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      tumblrAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(tumblrAuthentication.callbackPath, async (req, res, next) => {
  tumblrAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(tumblrAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (tumblrAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      token,
      tokenSecret,
      profile,
      state // => {message: 'Hello world'}
    } = await tumblrAuthentication.completeAuthentication(req, res);
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
import TumblrAuthentication from '@authentication/tumblr';

const tumblrAuthentication = new TumblrAuthentication<State>(options);
```

```javascript
const TumblrAuthentication = require('@authentication/tumblr');

const tumblrAuthentication = new TumblrAuthentication(options);
```

Options:

* `consumerKey` (required, `string`) - defaults to `process.env.TUMBLR_CONSUMER_KEY`. This is the Consumer Key you get from Tumblr. It is needed to tell Tumblr which application is being signed into.
* `consumerSecret` (required, `string`) - defaults to `process.env.TUMBLR_CONSUMER_SECRET`. This is the Consumer Secret you get from Tumblr. It is needed to verify the account with Tumblr.
* `callbackURL` (required, `string | URL`) - a relative or absolute [URL](https://nodejs.org/api/url.html#url_class_url) that represents the path that will handle Tumblr's callbacks.
* `cookieKeys` (optional, `string[]`) - Optionally sign the cookie used to store the `state` between the two steps of the oauth process
* `cookieName` (optional, `string`) - Optionally override the name of the cookie used to store the `state` between the two steps of the oauth process (defaults to `'authentication_oauth2'`).
* `trustProxy` (optional, `boolean`) - If `callbackURL` is a relative URL, it will be resolved relative to the request URL. If `trustProxy` is true it will trust `x-forwarded` headers. You can also use the `BASE_URL` environment varialbe to specify the base url.

### isCallbackRequest

```js
const isCallbackRequest = tumblrAuthentication.isCallbackRequest(req);
```

Returns `true` if the request has parameters indicating that it is a callback
from Tumblr. If this returns `false` you should call `redirectToProvider` and
redirect to the resulting URL.

### userCancelledLogin

```js
const userCancelledLogin = tumblrAuthentication.userCancelledLogin(req);
```

Returns `true` if the user clicked "Cancel" at some point in the login process
and Tumblr redirected them back to your app. You should probably return the user
to the login page at this point, instead of displaying an error.

### redirectToProvider

```js
tumblrAuthentication.redirectToProvider(req, res, next, options);
```

Redirect the user to Tumblr with the appropriate parameters to request access to their profile.

Options:

* `state` (optional, `State`) - a JSON serializeable value that you can use once the authentication is complete. This is useful for recording where the user was before they started to log in - e.g. a URL to redirect them to after login is complete or an action that the user wanted to take as soon as they are logged in.

### completeAuthentication

```js
const {
  accessToken,
  refreshToken,
  profile,
  state,
} = await tumblrAuthentication.completeAuthentication(req, res);
```

Verifies the supplied authentication info with Tumblr and returns an
`accessToken` and a `profile`. It also returns the `state` that you passed in
when calling `redirectToProvider`. See [Profile](./profile.md) for more info on the fields available in the `profile` object.

### callbackPath

The `callbackPath` property is just a string pathname from the url you passed in as the `callbackURL`. This is there so you don't have to keep repeating it.
