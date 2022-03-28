# Authentication

Modular, strongly typed, promise based, independent implementations of various
authentication protocols. These libraries don't have a perfectly uniform API and
they don't include session management. This means you can use them regardless of
your choice of framework.

A lot of this code has been copied (with some modificaiton) from the excellent
http://passportjs.org/ project, but I felt it was a shame that all that code was
so locked into the passport framework. My hope is that `@authentication`
provides primatives to allow experimenting with alternative high-level APIs.

<!-- VERSION_TABLE -->
Package Name | Version | Docs
-------------|---------|------
@authentication/cloudflare-ip | [![NPM version](https://img.shields.io/npm/v/@authentication/cloudflare-ip?style=for-the-badge)](https://www.npmjs.com/package/@authentication/cloudflare-ip) | [https://www.atauthentication.com/docs/cloudflare-ip.html](https://www.atauthentication.com/docs/cloudflare-ip.html)
@authentication/cookie | [![NPM version](https://img.shields.io/npm/v/@authentication/cookie?style=for-the-badge)](https://www.npmjs.com/package/@authentication/cookie) | [https://www.atauthentication.com/docs/cookie.html](https://www.atauthentication.com/docs/cookie.html)
@authentication/cookie-session | [![NPM version](https://img.shields.io/npm/v/@authentication/cookie-session?style=for-the-badge)](https://www.npmjs.com/package/@authentication/cookie-session) | [https://www.atauthentication.com/docs/cookie-session.html](https://www.atauthentication.com/docs/cookie-session.html)
@authentication/csrf-protection | [![NPM version](https://img.shields.io/npm/v/@authentication/csrf-protection?style=for-the-badge)](https://www.npmjs.com/package/@authentication/csrf-protection) | [https://www.atauthentication.com/docs/csrf-protection.html](https://www.atauthentication.com/docs/csrf-protection.html)
@authentication/facebook | [![NPM version](https://img.shields.io/npm/v/@authentication/facebook?style=for-the-badge)](https://www.npmjs.com/package/@authentication/facebook) | [https://www.atauthentication.com/docs/facebook.html](https://www.atauthentication.com/docs/facebook.html)
@authentication/generate-passcode | [![NPM version](https://img.shields.io/npm/v/@authentication/generate-passcode?style=for-the-badge)](https://www.npmjs.com/package/@authentication/generate-passcode) | [https://www.atauthentication.com/docs/generate-passcode.html](https://www.atauthentication.com/docs/generate-passcode.html)
@authentication/github | [![NPM version](https://img.shields.io/npm/v/@authentication/github?style=for-the-badge)](https://www.npmjs.com/package/@authentication/github) | [https://www.atauthentication.com/docs/github.html](https://www.atauthentication.com/docs/github.html)
@authentication/google | [![NPM version](https://img.shields.io/npm/v/@authentication/google?style=for-the-badge)](https://www.npmjs.com/package/@authentication/google) | [https://www.atauthentication.com/docs/google.html](https://www.atauthentication.com/docs/google.html)
@authentication/google-authenticator | [![NPM version](https://img.shields.io/npm/v/@authentication/google-authenticator?style=for-the-badge)](https://www.npmjs.com/package/@authentication/google-authenticator) | [https://www.atauthentication.com/docs/google-authenticator.html](https://www.atauthentication.com/docs/google-authenticator.html)
@authentication/passwordless | [![NPM version](https://img.shields.io/npm/v/@authentication/passwordless?style=for-the-badge)](https://www.npmjs.com/package/@authentication/passwordless) | [https://www.atauthentication.com/docs/passwordless.html](https://www.atauthentication.com/docs/passwordless.html)
@authentication/rate-limit | [![NPM version](https://img.shields.io/npm/v/@authentication/rate-limit?style=for-the-badge)](https://www.npmjs.com/package/@authentication/rate-limit) | [https://www.atauthentication.com/docs/rate-limit.html](https://www.atauthentication.com/docs/rate-limit.html)
@authentication/request-url | [![NPM version](https://img.shields.io/npm/v/@authentication/request-url?style=for-the-badge)](https://www.npmjs.com/package/@authentication/request-url) | [https://www.atauthentication.com/docs/request-url.html](https://www.atauthentication.com/docs/request-url.html)
@authentication/secure-hash | [![NPM version](https://img.shields.io/npm/v/@authentication/secure-hash?style=for-the-badge)](https://www.npmjs.com/package/@authentication/secure-hash) | [https://www.atauthentication.com/docs/secure-hash.html](https://www.atauthentication.com/docs/secure-hash.html)
@authentication/send-message | [![NPM version](https://img.shields.io/npm/v/@authentication/send-message?style=for-the-badge)](https://www.npmjs.com/package/@authentication/send-message) | [https://www.atauthentication.com/docs/send-message.html](https://www.atauthentication.com/docs/send-message.html)
@authentication/stripe | [![NPM version](https://img.shields.io/npm/v/@authentication/stripe?style=for-the-badge)](https://www.npmjs.com/package/@authentication/stripe) | [https://www.atauthentication.com/docs/stripe.html](https://www.atauthentication.com/docs/stripe.html)
@authentication/tumblr | [![NPM version](https://img.shields.io/npm/v/@authentication/tumblr?style=for-the-badge)](https://www.npmjs.com/package/@authentication/tumblr) | [https://www.atauthentication.com/docs/tumblr.html](https://www.atauthentication.com/docs/tumblr.html)
@authentication/auth-demo | [![NPM version](https://img.shields.io/npm/v/@authentication/auth-demo?style=for-the-badge)](https://www.npmjs.com/package/@authentication/auth-demo) | Not documented yet
@authentication/base-error | [![NPM version](https://img.shields.io/npm/v/@authentication/base-error?style=for-the-badge)](https://www.npmjs.com/package/@authentication/base-error) | Not documented yet
@authentication/is-email | [![NPM version](https://img.shields.io/npm/v/@authentication/is-email?style=for-the-badge)](https://www.npmjs.com/package/@authentication/is-email) | Not documented yet
@authentication/keygrip | [![NPM version](https://img.shields.io/npm/v/@authentication/keygrip?style=for-the-badge)](https://www.npmjs.com/package/@authentication/keygrip) | Not documented yet
@authentication/lock-by-id | [![NPM version](https://img.shields.io/npm/v/@authentication/lock-by-id?style=for-the-badge)](https://www.npmjs.com/package/@authentication/lock-by-id) | Not documented yet
@authentication/oauth1 | [![NPM version](https://img.shields.io/npm/v/@authentication/oauth1?style=for-the-badge)](https://www.npmjs.com/package/@authentication/oauth1) | Not documented yet
@authentication/oauth2 | [![NPM version](https://img.shields.io/npm/v/@authentication/oauth2?style=for-the-badge)](https://www.npmjs.com/package/@authentication/oauth2) | Not documented yet
@authentication/raw-cookie | [![NPM version](https://img.shields.io/npm/v/@authentication/raw-cookie?style=for-the-badge)](https://www.npmjs.com/package/@authentication/raw-cookie) | Not documented yet
@authentication/react-passwordless | [![NPM version](https://img.shields.io/npm/v/@authentication/react-passwordless?style=for-the-badge)](https://www.npmjs.com/package/@authentication/react-passwordless) | Not documented yet
@authentication/saml-protocol | [![NPM version](https://img.shields.io/npm/v/@authentication/saml-protocol?style=for-the-badge)](https://www.npmjs.com/package/@authentication/saml-protocol) | Not documented yet
@authentication/twitter | [![NPM version](https://img.shields.io/npm/v/@authentication/twitter?style=for-the-badge)](https://www.npmjs.com/package/@authentication/twitter) | Not documented yet
@authentication/types | [![NPM version](https://img.shields.io/npm/v/@authentication/types?style=for-the-badge)](https://www.npmjs.com/package/@authentication/types) | Not documented yet
<!-- VERSION_TABLE -->
