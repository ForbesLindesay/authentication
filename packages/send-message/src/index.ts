import {
  createTestAccount,
  createTransport,
  SendMailOptions,
  getTestMessageUrl,
} from 'nodemailer';

export interface MailInfo {
  /**
   * most transports should return the final Message-Id value used with this property
   */
  messageId?: string | number;
  /**
   * includes the envelope object for the message
   */
  envelope?: {};
  /**
   * an array returned by SMTP transports (includes recipient addresses that were accepted by the server)
   */
  accepted?: string[];
  /**
   * an array returned by SMTP transports (includes recipient addresses that were rejected by the server)
   */
  rejected?: string[];
  /**
   * an array returned by Direct SMTP transport. Includes recipient addresses that were temporarily rejected together with the server response
   */
  pending?: string[];
  /**
   * a string returned by SMTP transports and includes the last SMTP response from the server
   */
  response: string;
}
export interface Transport {
  /** Closes all connections in the pool. If there is a message being sent, the connection is closed later */
  close(): void;

  /** Verifies SMTP configuration */
  verify(): Promise<true>;

  /** Sends an email using the preselected transport object */
  sendMail(mailOptions: SendMailOptions): Promise<MailInfo>;
}

export enum Provider {
  Mailgun = 'mailgun',
  Postmark = 'postmark',
  SendGrid = 'sendgrid',
  SMTP = 'smtp',
  Ethereal = 'ethereal',
}
export interface MailgunProvider {
  kind: Provider.Mailgun;
  account?: {apiKey: string; domain: string};
}
export interface PostmarkProvider {
  kind: Provider.Postmark;
  apiKey?: string;
}
export interface SendGridProvider {
  kind: Provider.SendGrid;
  account?: {username: string; password: string};
}
export interface SmtpProvider {
  kind: Provider.SMTP;
  url?: string;
  config?: {
    port?: number;
    host?: string;
    authMethod?: string;
    auth?: {user: string; pass: string};
    secure?: boolean;
  };
}
export interface EtherealProvider {
  kind: Provider.Ethereal;
  account?: {username: string; password: string};
}

export type ProviderConfig =
  | MailgunProvider
  | PostmarkProvider
  | SendGridProvider
  | SmtpProvider
  | EtherealProvider;

function getDefaultProvider(): ProviderConfig {
  if (process.env.SMTP_URL) {
    return {kind: Provider.SMTP};
  }
  if (
    process.env.SMTP_HOST ||
    (process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD)
  ) {
    return {kind: Provider.SMTP};
  }
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return {kind: Provider.Mailgun};
  }
  if (process.env.POSTMARK_API_KEY) {
    return {kind: Provider.Postmark};
  }
  if (process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
    return {kind: Provider.SendGrid};
  }
  if (process.env.ETHEREAL_USERNAME && process.env.ETHEREAL_PASSWORD) {
    return {kind: Provider.Ethereal};
  }
  if (process.env.NODE_ENV === 'development') {
    return {kind: Provider.Ethereal};
  }
  throw new Error(
    'You must specify an email provider. This can be done by setting environment variables, or from within the code. See https://www.atauthentication.com/docs/send-message.html for more information.',
  );
}

function getValue<TParsed = TRaw, TRaw = string>(
  values: (TRaw | void)[],
  parse: (v: TRaw) => TParsed | void,
  message: string,
): TParsed {
  for (const value of values) {
    if (value !== undefined) {
      const result = parse(value);
      if (result === undefined) {
        throw new Error(message);
      }
      return result;
    }
  }
  throw new Error(message);
}

function toProvider(kind: Provider): ProviderConfig {
  switch (kind) {
    case Provider.Mailgun:
      return {kind};
    case Provider.Postmark:
      return {kind};
    case Provider.SendGrid:
      return {kind};
    case Provider.SMTP:
      return {kind};
    case Provider.Ethereal:
      return {kind};
    default:
      throw new Error('Unrecognised messaging provider kind');
  }
}

function getEtherealTransportUnCached() {
  return createTestAccount().then(auth =>
    createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth,
    }),
  );
}
let testTransport: null | Promise<Transport> = null;
function getEtherealTransport(provider: EtherealProvider) {
  if (
    provider.account ||
    (process.env.ETHEREAL_USERNAME && process.env.ETHEREAL_PASSWORD)
  ) {
    const t = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: provider.account
        ? {user: provider.account.username, pass: provider.account.password}
        : process.env.ETHEREAL_USERNAME && process.env.ETHEREAL_PASSWORD
          ? {
              user: process.env.ETHEREAL_USERNAME!,
              pass: process.env.ETHEREAL_PASSWORD!,
            }
          : (() => {
              throw new Error('Missing test account');
            })(),
    });
    return {
      /** Closes all connections in the pool. If there is a message being sent, the connection is closed later */
      close() {
        t.close();
      },

      /** Verifies SMTP configuration */
      verify() {
        return t.verify();
      },

      /** Sends an email using the preselected transport object */
      sendMail(mailOptions: SendMailOptions) {
        return t.sendMail(mailOptions).then(info => {
          console.log('Test message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', getTestMessageUrl(info as any));
          return info;
        });
      },
    };
  }
  if (!testTransport) {
    testTransport = getEtherealTransportUnCached();
  }
  let t = testTransport;
  return {
    /** Closes all connections in the pool. If there is a message being sent, the connection is closed later */
    close() {
      t.then(
        t => t.close(),
        err => {
          t = testTransport = getEtherealTransportUnCached();
          throw err;
        },
      );
    },

    /** Verifies SMTP configuration */
    verify() {
      return t.then(
        t => t.verify(),
        err => {
          t = testTransport = getEtherealTransportUnCached();
          throw err;
        },
      );
    },

    /** Sends an email using the preselected transport object */
    sendMail(mailOptions: SendMailOptions) {
      return t
        .then(
          t => t.sendMail(mailOptions),
          err => {
            t = testTransport = getEtherealTransportUnCached();
            throw err;
          },
        )
        .then(info => {
          console.log('Test message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', getTestMessageUrl(info as any));
          return info;
        });
    },
  };
}

export default function getTransport(
  provider: ProviderConfig | Provider = getDefaultProvider(),
): Transport {
  const p = typeof provider === 'string' ? toProvider(provider) : provider;
  switch (p.kind) {
    case Provider.Mailgun:
      return createTransport(
        require('nodemailer-mailgun-transport')({
          auth: {
            api_key: getValue<string>(
              [p.account && p.account.apiKey, process.env.MAILGUN_API_KEY],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.apiKey or specify the MAILGUN_API_KEY environment variable.',
            ),
            domain: getValue<string>(
              [p.account && p.account.domain, process.env.MAILGUN_DOMAIN],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.domain or specify the MAILGUN_DOMAIN environment variable.',
            ),
          },
        }),
      );
    case Provider.Postmark:
      return createTransport(
        require('nodemailer-postmark-transport')({
          auth: {
            apiKey: getValue<string>(
              [p.apiKey, process.env.POSTMARK_API_KEY],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide apiKey or specify the POSTMARK_API_KEY environment variable.',
            ),
          },
        }),
      );
    case Provider.SendGrid:
      return createTransport(
        require('nodemailer-sendgrid-transport')({
          auth: {
            api_user: getValue<string>(
              [p.account && p.account.username, process.env.SENDGRID_USERNAME],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.username or specify the SENDGRID_USERNAME environment variable.',
            ),
            api_key: getValue<string>(
              [p.account && p.account.password, process.env.SENDGRID_PASSWORD],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.username or specify the SENDGRID_USERNAME environment variable.',
            ),
          },
        }),
      );
    case Provider.SMTP:
      if (p.url) {
        if (typeof p.url !== 'string') {
          throw new Error('The SMTP URL must be a string');
        }
        createTransport(p.url);
      }
      if (p.config) {
        createTransport(p.config);
      }
      if (process.env.SMTP_URL) {
        return createTransport(
          getValue<string>(
            [process.env.SMTP_URL],
            v => (typeof v === 'string' ? v : undefined),
            'You must either provide url or specify the SMTP_URL environment variable.',
          ),
        );
      }
      return createTransport({
        port: process.env.SMTP_PORT
          ? parseInt(process.env.SMTP_PORT!, 10)
          : undefined,
        host: process.env.SMTP_HOST,
        auth:
          process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD
            ? {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
              }
            : undefined,
        secure: process.env.SMTP_SECURE === 'true',
      });
    case Provider.Ethereal:
      return getEtherealTransport(p);
  }
}
module.exports = getTransport;
module.exports.default = getTransport;
module.exports.Provider = Provider;
