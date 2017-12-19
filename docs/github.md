---
title: GitHub
---

This library provides authentication via GitHub's OAuth2 API.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/github
```

## Usage

Register an application with GitHub. You can create a new application at [developer applications](https://github.com/settings/applications/new) within GitHub's settings panel. Set the Homepage URL to `http://localhost:3000` and the Authorization callback URL to `http://localhost:3000/__/auth/github` for this example. Copy the Client ID into the `GITHUB_CLIENT_ID` environment variable and the Client Secret into the `GITHUB_CLIENT_SECRET` environment variable.

The `__` prefix is a convention to mean "do not cache these requests in a
service worker" it is supported out of the box by moped/create-react-app/etc.
You can choose any URL to be the `callbackURL` as long as it matches the URL you
gave to Google.

When the user posts to http://localhost:3000/__/auth/github they will be
re-directed to GitHub to complete the sign in. GitHub will then redirect them
back to the `callbackURL`, with additional info in the query. You can check if
the user decided to cancel the login by calling `userCancelledLogin`, otherwise
calling `completeAuthentication` may throw an error.

Once the user has successfully logged in, calling `completeAuthentication`
returns a `profile` with info about the user (e.g. their `id` and `emails`), an
`accessToken` (for further API requests) and a `refreshToken` if you need to
request new access tokens.

```typescript
import GitHubAuthentication from '@authentication/github';
import express = require('express');

const app = express();

const gitHubAuthentication = new GitHubAuthentication<{message: string}>({
  callbackURL: '/__/auth/github'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      gitHubAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(gitHubAuthentication.callbackPath, async (req, res, next) => {
  googleAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(gitHubAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (gitHubAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken, // use this to make requests to the Google API on behalf of the user
      refreshToken,
      profile,
      state // => {message: 'Hello world'}
    } = await gitHubAuthentication.completeAuthentication(req, res);
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

```javascript
const GitHubAuthentication = require('@authentication/github');
const express = require('express');

const app = express();

const gitHubAuthentication = new GitHubAuthentication({
  callbackURL: '/__/auth/github'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      gitHubAuthentication.callbackPath
    } method="post"><button type="submit">Login</button></form>`
  );
});

app.post(gitHubAuthentication.callbackPath, async (req, res, next) => {
  gitHubAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'}
  });
});
app.get(gitHubAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (gitHubAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken, // use this to make requests to the Google API on behalf of the user
      refreshToken,
      profile,
      state // => {message: 'Hello world'}
    } = await gitHubAuthentication.completeAuthentication(req, res);
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
import GitHubAuthentication from '@authentication/github';

const gitHubAuthentication = new GitHubAuthentication<State>(options);
```

```javascript
const GitHubAuthentication = require('@authentication/github');

const gitHubAuthentication = new GitHubAuthentication(options);
```

Options:

* `clientID` (required, `string`) - defaults to `process.env.GITHUB_CLIENT_ID`. This is the Client ID you get from GitHub. It is needed to tell GitHub which application is being signed into.
* `clientSecret` (required, `string`) - defaults to `process.env.GITHUB_CLIENT_SECRET`. This is the Client Secret you get from GitHub. It is needed to verify the account with GitHub.
* `callbackURL` (required, `string | URL`) - a relative or absolute [URL](https://nodejs.org/api/url.html#url_class_url) that represents the path that will handle GitHub's callbacks.
* `cookieKeys` (optional, `string[]`) - Optionally sign the cookie used to store the `state` between the two steps of the oauth process
* `cookieName` (optional, `string`) - Optionally override the name of the cookie used to store the `state` between the two steps of the oauth process (defaults to `'authentication_oauth2'`).
* `trustProxy` (optional, `boolean`) - If `callbackURL` is a relative URL, it will be resolved relative to the request URL. If `trustProxy` is true it will trust `x-forwarded` headers. You can also use the `BASE_URL` environment varialbe to specify the base url.

### isCallbackRequest

```js
const isCallbackRequest = gitHubAuthentication.isCallbackRequest(req);
```

Returns `true` if the request has parameters indicating that it is a callback
from GitHub. If this returns `false` you should call `redirectToProvider` and
redirect to the resulting URL.

### userCancelledLogin

```js
const userCancelledLogin = gitHubAuthentication.userCancelledLogin(req);
```

Returns `true` if the user clicked "Cancel" at some point in the login process
and google redirected them back to your app. You should probably return the user
to the login page at this point, instead of displaying an error.

### redirectToProvider

```js
gitHubAuthentication.redirectToProvider(req, res, next, options);
```

Redirect the user to google with the appropriate parameters to request access to their profile.

Options:

* `scope` (optional, `string | string[]`) - defaults to `DEFAULT_SCOPE`, see [GitHub's OAuth Docs](https://developer.github.com/apps/building-oauth-apps/scopes-for-oauth-apps/) for a full list of possible scopes.
* `state` (optional, `State`) - a JSON serializeable value that you can use once the authentication is complete. This is useful for recording where the user was before they started to log in - e.g. a URL to redirect them to after login is complete or an action that the user wanted to take as soon as they are logged in.

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
