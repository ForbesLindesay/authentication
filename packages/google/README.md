# Google Authentication

This library provides authentication via Google's OAuth2 API.

## Installation

```
yarn add @authentication/google
```

## Usage

Set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables to
the values you get when you register your app with Google (see
https://developers.google.com/identity/sign-in/web/devconsole-project).

You can then use the following code, and sign in by visiting
http://localhost:3000/__/auth/google

The `__` prefix is a convention to mean "do not cache these requests in a
service worker" it is supported out of the box by moped/create-react-app/etc.
You can choose any URL to be the `callbackURL` as long as it matches the URL you
gave to Google.

When the user first visits http://localhost:3000/__/auth/google they will be
re-directed to google to complete the sign in. Google will then redirect them
back to the `callbackURL`, with additional info in the query. You can check if
the user decided to cancel the login by calling `userCancelledLogin`, otherwise
calling `authenticateCallback` may throw an error.

Once the user has successfully logged in, calling `authenticateCallback` returns
a `profile` with info about the user (e.g. their `id` and `emails`), an
`accessToken` (for further API requests) and a `refreshToken` if you need to
request new access tokens.

```js
import GoogleAuthentication from '@authentication/google';
import express = require('express');

const app = express();

const googleAuthentication = new GoogleAuthentication({
  callbackURL: '/__/auth/google',
});

app.get('/__/auth/google', async (req, res, next) => {
  try {
    if (!googleAuthentication.isCallbackRequest(req)) {
      const url = await googleAuthentication.authenticateInit(req);
      return res.redirect(url.href);
    }
    if (googleAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken,
      refreshToken,
      profile,
    } = await googleAuthentication.authenticateCallback(req);
    console.log({accessToken, refreshToken});
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

## API

### Constructor Options

```js
import GoogleAuthentication from '@authentication/google';

const googleAuthentication = new GoogleAuthentication(options);
```

* `clientID?: string` - defaults to `process.env.GOOGLE_CLIENT_ID`. This is the
  Client ID you get from Google. It is needed to tell google which application
  is being signed into.
* `clientSecret?: string` - defaults to `process.env.GOOGLE_CLIENT_SECRET`. This
  is the Client Secret you get from Google. It is needed to verify the account
  with google.
* `callbackURL?: string | URL` - a relative or absolute
  [URL](https://nodejs.org/api/url.html#url_class_url) that represents the path
  that will handle google's callbacks.

### sCallbackRequest

```js
const isCallbackRequest = googleAuthentication.isCallbackRequest(req);
```

Returns `true` if the request has parameters indicating that it is a callback
from google. If this returns `false` you should call `authenticateInit` and
redirect to the resulting URL.

### userCancelledLogin

```js
const isCallbackRequest = googleAuthentication.userCancelledLogin(req);
```

Returns `true` if the user clicked "Cancel" at some point in the login process
and google redirected them back to your app. You should probably return the user
to the login page at this point, instead of displaying an error.

### authenticateInit

```js
const url = await googleAuthentication.authenticateInit(req, initOptions);
res.redirect(url.href);
```

Gets the [URL](https://nodejs.org/api/url.html#url_class_url) to redirect the
user to in order to start the login process. This returns a Promise for a
[URL](https://nodejs.org/api/url.html#url_class_url) as it is async.

Options:

* `callbackURL?: string | URL` - override the `callbackURL` specified in the
  constructor.
* `scope?: string | ReadonlyArray<string>` - defaults to `[]`, see
  https://developers.google.com/+/web/api/rest/oauth#authorization-scopes for a
  full list of possible scopes.
* `accessType?: 'online' | 'offline'` - Indicates whether your application can
  refresh access tokens when the user is not present at the browser. Valid
  parameter values are online, which is the default value, and offline. Set the
  value to offline if your application needs to refresh access tokens when the
  user is not present at the browser. This is the method of refreshing access
  tokens described in
  https://developers.google.com/identity/protocols/OAuth2WebServer. This value
  instructs the Google authorization server to return a refresh token and an
  access token the first time that your application exchanges an authorization
  code for tokens.
* `prompt?: ('consent' | 'select_account')[]` - A case-sensitive list of prompts
  to present the user. If you don't specify this parameter, the user will be
  prompted only the first time your app requests access.
* `loginHint?: string` - If your application knows which user is trying to
  authenticate, it can use this parameter to provide a hint to the Google
  Authentication Server. The server uses the hint to simplify the login flow
  either by prefilling the email field in the sign-in form or by selecting the
  appropriate multi-login session. Set the parameter value to an email address
  or sub identifier, which is equivalent to the user's Google ID.
* `includeGrantedScopes?: boolean` - Enables applications to use incremental
  authorization to request access to additional scopes in context. If you set
  this parameter's value to true and the authorization request is granted, then
  the new access token will also cover any scopes to which the user previously
  granted the application access. See the incremental authorization section of
  https://developers.google.com/identity/protocols/OAuth2WebServer for examples.
* `hostedDomain?: string` - used in Google Apps for Work
* `requestVisibleActions?: string[]` - Used for google+
  https://developers.google.com/+/web/app-activities/#writing_an_app_activity_using_the_google_apis_client_libraries
* `openIDRealm?: string` - This parameter is needed when migrating users from
  Google's OpenID 2.0 to OAuth 2.0 - see
  https://developers.google.com/accounts/docs/OpenID?hl=ja#adjust-uri

Typescript:

```js
import {InitOptions} from '@authentication/google';
```

TODO: explain state?

### authenticateCallback

```js
const {
  accessToken,
  refreshToken,
  profile,
} = await googleAuthentication.authenticateCallback(req, callbackOptions);
```

Verifies the supplied authentication info with google and returns an
`accessToken` and a `profile`.

Options:

* `callbackURL?: string | URL` - override the `callbackURL` specified in the
  constructor.

## License

MIT
