---
title: Stripe
---

This library provides authentication via [Stripe's Connect API for Standard Accounts](https://stripe.com/docs/connect/standard-accounts).

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/stripe
```

## Usage

First you need to get your "Stripe Connect Client ID" and "Stripe Secret" from Stripe:

1. Go to your account's [API Keys Page](https://dashboard.stripe.com/account/apikeys).
2. Select "View test data" (unless you are setting this up for production)
3. Copy "Secret Key" into the `STRIPE_SECRET_KEY` environment variable.
4. Go to the [Connect Settings Page](https://dashboard.stripe.com/account/applications/settings)
5. Register your application (if you haven't already).
6. Select "View test data" (unless you are setting this up for production)
7. Copy "Client ID" into the `STRIPE_CONNECT_CLIENT_ID` environment variable.
8. Click "Add Redirect URI" and enter: `http://loccalhost:3000/__/auth/stripe`

For the sign in process, the user is first directed to Stripe, where they are asked to sign up for a stripe account (or grant you access to an existing stripe account), then Stripe redirects them back to your website at the `callbackURL` - which must be one of the "Redirect URI"s on the connect settings page.

See https://stripe.com/docs/connect/testing#creating-accounts for more info on testing stripe connect.

The `__` prefix is a convention to mean "do not cache these requests in a
service worker" it is supported out of the box by moped/create-react-app/etc.
You can choose any URL to be the `callbackURL` as long as it matches the URL you
gave to Stripe.

When the user posts to http://localhost:3000/__/auth/stripe they will be re-directed to Stripe to complete the sign in. Stripe will then redirect them back to the `callbackURL`, with additional info in the query. You can check if the user decided to cancel the login by calling `userCancelledLogin`, otherwise calling `completeAuthentication` may throw an error.

Once the user has successfully logged in, calling `completeAuthentication`
returns a `profile` with info about the user (e.g. their `id` and `emails`).

```typescript
import StripeAuthentication from '@authentication/stripe';
import express = require('express');

const app = express();

const stripeAuthentication = new StripeAuthentication<{message: string}>({
  callbackURL: '/__/auth/stripe'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      stripeAuthentication.callbackPath
    } method="post"><button type="submit">Conenct to Stripe</button></form>`
  );
});

app.post(stripeAuthentication.callbackPath, async (req, res, next) => {
  stripeAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'},
    scope: 'read_write'
  });
});
app.get(stripeAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (stripeAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      stripeUserID, // store this to refer to the user's stripe account in future
      profile,
      state // => {message: 'Hello world'}
    } = await stripeAuthentication.completeAuthentication(req, res);
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

```javascript
const StripeAuthentication = require('@authentication/stripe');
const express = require('express');

const app = express();

const stripeAuthentication = new StripeAuthentication({
  callbackURL: '/__/auth/stripe'
});

app.get('/', (req, res, next) => {
  res.send(
    `<form action=${
      stripeAuthentication.callbackPath
    } method="post"><button type="submit">Connect to Stripe</button></form>`
  );
});

app.post(stripeAuthentication.callbackPath, async (req, res, next) => {
  stripeAuthentication.redirectToProvider(req, res, next, {
    // you can pass some abritrary state through to the callback here
    state: {message: 'Hello world'},
    scope: 'read_write'
  });
});
app.get(stripeAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (stripeAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      stripeUserID, // store this to refer to the user's stripe account in future
      profile,
      state // => {message: 'Hello world'}
    } = await stripeAuthentication.completeAuthentication(req, res);
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
import StripeAuthentication from '@authentication/stripe';

const stripeAuthentication = new StripeAuthentication<State>(options);
```

```javascript
const StripeAuthentication = require('@authentication/stripe');

const stripeAuthentication = new StripeAuthentication(options);
```

Options:

* `clientID` (required, `string`) - defaults to `process.env.STRIPE_CONNECT_CLIENT_ID`. This is the Client ID you get from the [Connect Settings Page](https://dashboard.stripe.com/account/applications/settings).
* `secretKey` (required, `string`) - defaults to `process.env.STRIPE_SECRET_KEY`. This is the secret key you get from the [API Keys Page](https://dashboard.stripe.com/account/apikeys).
* `callbackURL` (required, `string | URL`) - a relative or absolute [URL](https://nodejs.org/api/url.html#url_class_url) that represents the path that will handle stripe's callbacks.
* `cookieKeys` (optional, `string[]`) - Optionally sign the cookie used to store the `state` between the two steps of the oauth process
* `cookieName` (optional, `string`) - Optionally override the name of the cookie used to store the `state` between the two steps of the oauth process (defaults to `'authentication_oauth2'`).
* `trustProxy` (optional, `boolean`) - If `callbackURL` is a relative URL, it will be resolved relative to the request URL. If `trustProxy` is true it will trust `x-forwarded` headers. You can also use the `BASE_URL` environment varialbe to specify the base url.

### isCallbackRequest

```js
const isCallbackRequest = stripeAuthentication.isCallbackRequest(req);
```

Returns `true` if the request has parameters indicating that it is a callback
from stripe. If this returns `false` you should call `redirectToProvider` and
redirect to the resulting URL.

### userCancelledLogin

```js
const userCancelledLogin = stripeAuthentication.userCancelledLogin(req);
```

Returns `true` if the user clicked "Cancel" at some point in the login process and stripe redirected them back to your app. You should probably return the user to the login page at this point, instead of displaying an error.

### redirectToProvider

```js
stripeAuthentication.redirectToProvider(req, res, next, options);
```

Redirect the user to Stripe with the appropriate parameters to request access to their account.

Options:

* `scope` (optional, `'read_only' | 'read_write'`) - defaults to `'read_only'`
* `state` (optional, `State`) - a JSON serializeable value that you can use once the authentication is complete. This is useful for recording where the user was before they started to log in - e.g. a URL to redirect them to after login is complete or an action that the user wanted to take as soon as they are logged in.
* `stripeLanding` (optional, `'login' | 'register'`) - defaults to `'login'` for `'read_only'` scope and `'register'` for `'read_write'` scope. This controls whether the user is given the opportunity to create a new stripe account as part of the connect flow or whether they are asked to log into an existing account.
* `alwaysPrompt` (optional, `boolean`) - defaults to `false`. Set this to `true` to ask the user to select an account to connect even if they have already connected to your application before. This is useful if you want to change the connected account or connect additional accounts.
* `registrationDefaults` (optional, `RegistrationDefaults`) - set defaults for user's registering new accounts.

Registraiton Defaults:

See https://stripe.com/docs/connect/oauth-reference for details on what each option does.

```typescript
interface RegistrationDefaults {
  email?: string;
  url?: string;
  /**
   * Two-letter country code (e.g., US or CA).
   */
  country?: string;
  phoneNumber?: string;
  businessName?: string;
  businessType?:
    | 'sole_prop'
    | 'corporation'
    | 'non_profit'
    | 'partnership'
    | 'llc';
  firstName?: string;
  lastName?: string;
  dateOfBirth?: {day: number; month: number; year: number};
  address?: {
    street?: string;
    city?: string;
    // Must be the two-letter state or province code
    // (e.g., NY for a U.S. business or AB for a Canadian one).
    state?: string;
    zip?: string;
  };
  physicalProduct?: boolean;
  shippingDays?: number;
  productCategory?:
    | 'art_and_graphic_design'
    | 'advertising'
    | 'charity'
    | 'clothing_and_accessories'
    | 'consulting'
    | 'clubs_and_membership_organizations'
    | 'education'
    | 'events_and_ticketing'
    | 'food_and_restaurants'
    | 'software'
    | 'professional_services'
    | 'tourism_and_travel'
    | 'web_development'
    | 'other';
  productDescription?: string;
  /**
   * Ingeger in **Dollars**
   */
  averagePayment?: number;
  /**
   * The estimated past year's volume for the business. Must be an integer in dollar
   */
  pastYearVolume?: number;
  /**
   * Three-letter ISO code representing currency,
   *
   * Must prefill stripe_user[country] with the corresponding country.
   */
  currency?: string;
}
```

### completeAuthentication

```js
const {
  // the stripeUserID can be passed to the stripe client to make requests on behalf
  // of the connected account. It is relatively safe to store this because it does
  // not allow requests unless you also have your platform's secret key.
  stripeUserID,
  // this is the secret key of the connected account, you should use
  // the stripeUserID instead as it is safer to store.
  accessToken,
  refreshToken,
  profile,
  rawProfile, // this is the Account returned by calling stripe.accounts.retrieve
  state,
} = await stripeAuthentication.completeAuthentication(req, res);
```

Verifies the supplied authentication info with Stripe and returns a
`stripeUserID`. It also returns the `state` that you passed in
when calling `redirectToProvider`. See [Profile](./profile.md) for more info on the fields available in the `profile` object.

### callbackPath

The `callbackPath` property is just a string pathname from the url you passed in as the `callbackURL`. This is there so you don't have to keep repeating it.
