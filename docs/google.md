---
title: Google
---

This library provides authentication via Google's OAuth2 API.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/google
```

## Usage

Follow the instructions on [Google DevConsole Project](https://developers.google.com/identity/sign-in/web/devconsole-project) to register your application and get a Client ID and Client Secret. Set the `GOOGLE_CLIENT_ID` environment variable to your Client ID and `GOOGLE_CLIENT_SECRET` to your Client Secret.

The `__` prefix is a convention to mean "do not cache these requests in a
service worker" it is supported out of the box by moped/create-react-app/etc.
You can choose any URL to be the `callbackURL` as long as it matches the URL you
gave to Google.

When the user posts to http://localhost:3000/__/auth/google they will be
re-directed to google to complete the sign in. Google will then redirect them
back to the `callbackURL`, with additional info in the query. You can check if
the user decided to cancel the login by calling `userCancelledLogin`, otherwise
calling `completeAuthentication` may throw an error.

Once the user has successfully logged in, calling `completeAuthentication`
returns a `profile` with info about the user (e.g. their `id` and `emails`), an
`accessToken` (for further API requests) and a `refreshToken` if you need to
request new access tokens.

```typescript
import GoogleAuthentication from '@authentication/google';
import express = require('express');

const app = express();

const googleAuthentication = new GoogleAuthentication<{message: string}>({
  callbackURL: '/__/auth/google'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      googleAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(googleAuthentication.callbackPath, async (req, res, next) => {
  googleAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(googleAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (googleAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken, // use this to make requests to the Google API on behalf of the user
      refreshToken,
      profile,
      state // => {message: 'Hello world'}
    } = await googleAuthentication.completeAuthentication(req, res);
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

```javascript
const GoogleAuthentication = require('@authentication/google');
const express = require('express');

const app = express();

const googleAuthentication = new GoogleAuthentication({
  callbackURL: '/__/auth/google'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      googleAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(googleAuthentication.callbackPath, async (req, res, next) => {
  googleAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(googleAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (googleAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken, // use this to make requests to the Google API on behalf of the user
      refreshToken,
      profile,
      state // => {message: 'Hello world'}
    } = await googleAuthentication.completeAuthentication(req, res);
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
import GoogleAuthentication from '@authentication/google';

const googleAuthentication = new GoogleAuthentication<State>(options);
```

```javascript
const GoogleAuthentication = require('@authentication/google');

const googleAuthentication = new GoogleAuthentication(options);
```

Options:

* `clientID` (required, `string`) - defaults to `process.env.GOOGLE_CLIENT_ID`. This is the Client ID you get from Google. It is needed to tell google which application is being signed into.
* `clientSecret` (required, `string`) - defaults to `process.env.GOOGLE_CLIENT_SECRET`. This is the Client Secret you get from Google. It is needed to verify the account with google.
* `callbackURL` (required, `string | URL`) - a relative or absolute [URL](https://nodejs.org/api/url.html#url_class_url) that represents the path that will handle google's callbacks.
* `cookieKeys` (optional, `string[]`) - Optionally sign the cookie used to store the `state` between the two steps of the oauth process
* `cookieName` (optional, `string`) - Optionally override the name of the cookie used to store the `state` between the two steps of the oauth process (defaults to `'authentication_oauth2'`).
* `trustProxy` (optional, `boolean`) - If `callbackURL` is a relative URL, it will be resolved relative to the request URL. If `trustProxy` is true it will trust `x-forwarded` headers. You can also use the `BASE_URL` environment varialbe to specify the base url.

### isCallbackRequest

```js
const isCallbackRequest = googleAuthentication.isCallbackRequest(req);
```

Returns `true` if the request has parameters indicating that it is a callback
from google. If this returns `false` you should call `redirectToProvider` and
redirect to the resulting URL.

### userCancelledLogin

```js
const userCancelledLogin = googleAuthentication.userCancelledLogin(req);
```

Returns `true` if the user clicked "Cancel" at some point in the login process
and google redirected them back to your app. You should probably return the user
to the login page at this point, instead of displaying an error.

### redirectToProvider

```js
googleAuthentication.redirectToProvider(req, res, next, options);
```

Redirect the user to google with the appropriate parameters to request access to their profile.

Options:

* `scope` (optional, `string | string[]`) - defaults to `DEFAULT_SCOPE`, see [Google's OAuth Docs](https://developers.google.com/+/web/api/rest/oauth#authorization-scopes) for a full list of possible scopes.
* `state` (optional, `State`) - a JSON serializeable value that you can use once the authentication is complete. This is useful for recording where the user was before they started to log in - e.g. a URL to redirect them to after login is complete or an action that the user wanted to take as soon as they are logged in.
* `offlineAccess` (optional, `boolean`) - Set this to `true` if your application needs to refresh access tokens when the user is not present at the browser. This is the method of refreshing access tokens described in [Google's Docs](https://developers.google.com/identity/protocols/OAuth2WebServer). This value instructs the Google authorization server to return a refresh token and an access token the first time that your application exchanges an authorization code for tokens.
* `prompt` (optional, `('consent' | 'select_account')[]`) - A case-sensitive list of prompts to present the user. If you don't specify this parameter, the user will be prompted only the first time your app requests access.
* `loginHint` (optional, `string`) - If your application knows which user is trying to authenticate, it can use this parameter to provide a hint to the Google Authentication Server. The server uses the hint to simplify the login flow either by prefilling the email field in the sign-in form or by selecting the appropriate multi-login session. Set the parameter value to an email address or sub identifier, which is equivalent to the user's Google ID.
* `includeGrantedScopes` (optional, `boolean`) - Enables applications to use incremental authorization to request access to additional scopes in context. Defaults to `true` which causes the returned access token to include any previously granted scopes, not just the requested ones. See the incremental authorization section of https://developers.google.com/identity/protocols/OAuth2WebServer for examples.
* `hostedDomain` (optional, `string`) - used in Google Apps for Work
* `requestVisibleActions` (optional, `string[]`) - [Used for google+](https://developers.google.com/+/web/app-activities/#writing_an_app_activity_using_the_google_apis_client_libraries)
* `openIDRealm` (optional, `string`) - [This parameter is needed when migrating users from Google's OpenID 2.0 to OAuth 2.0](https://developers.google.com/accounts/docs/OpenID?hl=ja#adjust-uri)

### completeAuthentication

```js
const {
  accessToken,
  refreshToken,
  profile,
  state,
} = await googleAuthentication.completeAuthentication(req, res);
```

Verifies the supplied authentication info with google and returns an
`accessToken` and a `profile`. It also returns the `state` that you passed in
when calling `redirectToProvider`. See [Profile](./profile.md) for more info on the fields available in the `profile` object.

### callbackPath

The `callbackPath` property is just a string pathname from the url you passed in as the `callbackURL`. This is there so you don't have to keep repeating it.
