---
title: Getting Started
---

Security is really important. You should care about it both because high-profile security breaches can be really damaging to your business, and also because as developers we have a duty of care to protect our users.

Unfortunately, node.js' small module philosophy, while great for code re-use, encourages some modules to omit security critical features by default, prefering to leave it to users to install modules to bolt on security afterwards. The most common example of this is CSRF (Cross-Site Request Forgery), an attack that is trivial to execute on an express or koa application, unless careful steps are taken to prevent it.

@authentication takes a security first approach. All the modules that are included in and recommended by @authentication should be secure by default, meaning if you supply no options, they default to the most secure configuration.

@authentication divides approximately into the following sections:

- authentication - strategies for verifying the user's identity
- sessions - how you keep track of the current user once they have authenticated
- databases - using a well designed library to connect to your database is critical for building a secure application that does not suffer from SQL Injection vulnerabilities. For this we recommend you use the [@databases](https://www.atdatabases.org/) project.
- miscellaneous - libraries for other common security critical tasks.

## Authentication

You can authenticate users via:

 - [Passwordless](passwordless.md) - more secure and easier to use and implement than password based authentication, without relying on any third parties.
 - [Facebook](facebook.md) - the world's most popular social network
 - [Google](google.md) - a popular authentication provider that's often used in startups
 - many many others

You can also add an extra layer of protection using [Google Authenticator's 2-Factor Authentication](google-authenticator.md).

Once a user is authenticated, you'll have an ID for the user, along with some profile info.

## Sessions

Once you have an authenticated user, you need to store that user in a "session". To do this, you use a cookie. You can either directly store the userID and any other session info in the cookie, or you can create a "sessions" table in your database and store just a session ID in the cookie.

The later approach has the advantage of making it easy to see which devices a user is authenticated on, and makes it easy to revoke a user's sessions when their password is changed or a breach is suspected.

@authentication supports either method. You can choose between the two packages:

- [cookie](cookie.md) - recommended for new applications, provides a simple method for setting and retrieving encrypted data in a cookie.
- [cookie-session](cookie-session.md) - recommended if migrating an existing express app that uses express' normal session API.

Both these libraries default to encrypting session data stored in cookies, and use headers to ignore cookies on cross site requests (protecting against CSRF attacks).

## Databases

### SQL

If you concatenate strings to build your SQL queries, your app will be vulnerable to SQL injection. The [@databases](https://www.atdatabases.org) libraries use [Template Literals](https://www.atdatabases.org/docs/sql) to give you the full, raw power of writing dynamic SQL queries, without any string concatention. Used properly, this will make SQL Injection vulnerabilities a thing of the past.

### MongoDB

If you use NoSQL databases such as MongoDB you must be very careful to sanitise any inputs. MongoDB mixes queries with data, and `JSON.parse` can return any JSON structure. This allows a malicious attacker to put arbitrary JSON structures in fields you expected to only contain numbers or strings.

Be careful to always validate your input.

## Miscellaneous

### Rate Limiting

See [Rate Limit](rate-limit.md)

Rate limiting is essential for preventing denial of service attacks and preventing people bute forcing password based security. It also has an added up-side though. Effective rate limiting can significantly limit the scope of an attack.

Attackers trying to exfiltrate large quantities of data from your app may end up needing to make way more requests than a typical user, even once they have discovered and exploited a vulnerability. By rate limiting to just slightly more than a typical user would request, you can reduce the data the attacker can steal.

### CSRF Protection

See [CSRF Protection](csrf-protection.md)

The [cookie](cookie.md) and [cookie-session](cookie-session.md) libraries from @authentication already prevent CSRF attacks by treating any cross site request as not having sessions/cookies attached. If you are using an alternative session library, or you just want added protection, the [CSRF Protection](csrf-protection.md) library can be used to block cross origin requests, rather than just treating them as session-less.

> N.B. All the cross site request forgery protection relies on you never modifying any data in a GET request. Only perform read operations as part of a GET request. You can use POST requests to update/modify data in your database.

### Generate PassCode

The [Generate PassCode](generate-passcode.md) library provides a simple way to securely generate pass codes with arbitrary character sets and of arbitrary lengths.

Many alternative implementations incorrectly scale each byte to the desired character set. Unfortunatley this leads to some characters being more likely than others, which can unexpectedly reduce securtiy. @authentication's implementation simply excludes un-wanted characters and keeps retrying until valid characters are returned.

### Secure Hash

[Secure Hash](secure-hash.md) provides secure hashing and validation of passwords/passcodes. It should always be used together with the [Rate Limit](rate-limit.md) library.