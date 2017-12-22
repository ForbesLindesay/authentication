---
title: e-mail
---

The send-message package provides a subset of the [nodemailer](https://nodemailer.com) API, aiming to make it as easy as possible to configure e-mail sending in your application.

## Installation

To install, run the following command in your terminal:

```sh
yarn add @authentication/send-message
```

## Usage

```typescript
import getTransport from '@authentication/send-message';

const transport = getTransport();

transport
  .sendMail({
    from: 'me@example.com',
    to: 'them@example.com',
    subject: 'An awesome message',
    text: 'You are awesome!',
    html: '<p>You are <strong>awesome</strong>!'
  })
  .then(
    () => console.log('message sent'),
    err => {
      console.log('message could not be sent:');
      console.log(err.message);
    }
  );
```

```javascript
const getTransport = require('@authentication/send-message');

const transport = getTransport();

transport
  .sendMail({
    from: 'me@example.com',
    to: 'them@example.com',
    subject: 'An awesome message',
    text: 'You are awesome!',
    html: '<p>You are <strong>awesome</strong>!'
  })
  .then(
    () => console.log('message sent'),
    err => {
      console.log('message could not be sent:');
      console.log(err.message);
    }
  );
```

## Providers

If you do not pass any arguments to `getTransport()` it selects a provider automatically based on your environment variables. Alternatively, you can explicilty specify which provider you want to use when you create the transport.

If no provider is specified, and none of the environment variables are set:

* If `process.env.NODE_ENV === 'development'` - it will use [ethereal.email](https://ethereal.email) (`Provider.Ethereal`), which pretends to send you the e-mail and logs a link to a preview of the e-mail that would be sent in production.
* Otherwise, an error is thrown telling you that you need to setup an e-mail provider.

I personally use the default "Ethereal" provider in development, and [postmark](https://postmarkapp.com/) in production, but I have not done extensive evaluation as to which are the best options.

### Mailgun

To use [Mailgun](https://www.mailgun.com/), you need to [create an account](https://signup.mailgun.com/new/signup), and then set the `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` environment variables.

If you are using heroku, you can simply install the [Mailgun Addon](https://elements.heroku.com/addons/mailgun).

Alternatively, you can configure it in your code:

```typescript
import getTransport, {Provider} from '@authentication/send-message';

const transport = getTransport({
  kind: Provider.Mailgun,
  account: {apiKey: 'YOUR_API_KEY', domain: 'YOUR_DOMAIN'}
});
```

```javascript
const getTransport = require('@authentication/send-message');
const Provider = getTransport.Provider;

const transport = getTransport({
  kind: Provider.Mailgun,
  account: {apiKey: 'YOUR_API_KEY', domain: 'YOUR_DOMAIN'}
});
```

### Postmark

To use [Postmark](https://postmarkapp.com/), you need to [create an account](https://account.postmarkapp.com/sign_up), and then set the `POSTMARK_API_KEY` environment variable.

Alternatively, you can configure it in your code:

```typescript
import getTransport, {Provider} from '@authentication/send-message';

const transport = getTransport({
  kind: Provider.Postmark,
  apiKey: 'YOUR_API_KEY'
});
```

```javascript
const getTransport = require('@authentication/send-message');
const Provider = getTransport.Provider;

const transport = getTransport({
  kind: Provider.Postmark,
  apiKey: 'YOUR_API_KEY'
});
```

### SendGrid

To use [SendGrid](https://sendgrid.com/), you need to [create an account](https://app.sendgrid.com/signup), and then set the `SENDGRID_USERNAME` and `SENDGRID_PASSWORD` environment variables.

If you are using heroku, you can simply install the [SendGrid Addon](https://elements.heroku.com/addons/sendgrid).

Alternatively, you can configure it in your code:

```typescript
import getTransport, {Provider} from '@authentication/send-message';

const transport = getTransport({
  kind: Provider.SendGrid,
  account: {username: 'YOUR_USERNAME', password: 'YOUR_PASSWORD'}
});
```

```javascript
const getTransport = require('@authentication/send-message');
const Provider = getTransport.Provider;

const transport = getTransport({
  kind: Provider.SendGrid,
  account: {username: 'YOUR_USERNAME', password: 'YOUR_PASSWORD'}
});
```

### SMTP

SMTP is the more DIY approach. This will work well for very small volumes of e-mail being sent from a personal address. You'll need to find the SMTP config for your e-mail provider. You can then either use a URL or a config object.

#### URL

Either set the `SMTP_URL` environment variable, or configure it in code:

```typescript
import getTransport, {Provider} from '@authentication/send-message';

const transport = getTransport({
  kind: Provider.SMTP,
  url: 'smtps://username:password@smtp.example.com/?pool=true'
});
```

```javascript
const getTransport = require('@authentication/send-message');
const Provider = getTransport.Provider;

const transport = getTransport({
  kind: Provider.SMTP,
  url: 'smtps://username:password@smtp.example.com/?pool=true'
});
```

#### Config Object

Either set `SMTP_PORT`, `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `SMTP_SECURE` (which can be either `'true'` or `'false'`), or configure it in your code:

```typescript
import getTransport, {Provider} from '@authentication/send-message';

const transport = getTransport({
  kind: Provider.SMTP,
  config: {
    // see https://nodemailer.com/smtp/ for full list of options
    host: 'smtp.example.com',
    secure: true,
    auth: {
      user: 'username',
      pass: 'password'
    }
  }
});
```

```javascript
const getTransport = require('@authentication/send-message');
const Provider = getTransport.Provider;

const transport = getTransport({
  kind: Provider.SMTP,
  config: {
    // see https://nodemailer.com/smtp/ for full list of options
    host: 'smtp.example.com',
    secure: true,
    auth: {
      user: 'username',
      pass: 'password'
    }
  }
});
```

### Ethereal

The test provider uses [ethereal.email](https://ethereal.email) to give you previews of messages, without actually sending any real messages. This is great for testing.

If `process.env.NODE_ENV === 'development'`, and no other envrionment variables have been set, [ethereal.email](https://ethereal.email) will be used by default. Credentials for [ethereal.email](https://ethereal.email) will be automatically generated, if you have not specified them manually. A link to each e-mail that is sent will be logged to the console.

You can set `ETHEREAL_USERNAME` and `ETHEREAL_PASSWORD` to force a specific etherium account to be used consistently. This also enables you to use [ethereal.email](https://ethereal.email) in production if you want (e.g. for a staging environment perhaps?).

Finally, it is also possible to configure etherial in code:

```typescript
import getTransport, {Provider} from '@authentication/send-message';

const transport = getTransport({
  kind: Provider.Ethereal,
  account: {username: 'YOUR_USERNAME', password: 'YOUR_PASSWORD'}
});
```

```javascript
const getTransport = require('@authentication/send-message');
const Provider = getTransport.Provider;

const transport = getTransport({
  kind: Provider.Ethereal,
  account: {username: 'YOUR_USERNAME', password: 'YOUR_PASSWORD'}
});
```
