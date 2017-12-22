import {
  createTestAccount,
  createTransport,
  Transporter,
  SendMailOptions,
} from 'nodemailer';

export interface AsyncTransporter {
  /** Closes all connections in the pool. If there is a message being sent, the connection is closed later */
  close(): void;

  /** Verifies SMTP configuration */
  verify(): Promise<true>;

  /** Sends an email using the preselected transport object */
  sendMail(mailOptions: SendMailOptions): Promise<{} | void | null>;
}

export enum MessagingProviderKind {
  MailGun = 'mailgun',
  Postmark = 'postmark',
  SendGrid = 'sendgrid',
  SMTP = 'smtp',
  Test = 'ethereal',
}
export interface MailGunProvider {
  kind: MessagingProviderKind.MailGun;
  account?: {apiKey: string; domain: string};
}
export interface PostmarkProvider {
  kind: MessagingProviderKind.Postmark;
  apiKey?: string;
}
export interface SendGridProvider {
  kind: MessagingProviderKind.SendGrid;
  account?: {username: string; password: string};
}
export interface SmtpProvider {
  kind: MessagingProviderKind.SMTP;
  url?: string;
  config?: {
    port?: number;
    host?: string;
    authMethod?: string;
    auth?: {user: string; pass: string};
    secure?: boolean;
  };
}
export interface TestProvider {
  kind: MessagingProviderKind.Test;
  account?: {username: string; password: string};
}

export type Provider =
  | MailGunProvider
  | PostmarkProvider
  | SendGridProvider
  | SmtpProvider
  | TestProvider;

function getDefaultProvider(): Provider {
  if (process.env.SMTP_URL) {
    return {kind: MessagingProviderKind.SMTP};
  }
  if (
    process.env.SMTP_HOST ||
    (process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD)
  ) {
    return {kind: MessagingProviderKind.SMTP};
  }
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return {kind: MessagingProviderKind.MailGun};
  }
  if (process.env.POSTMARK_API_KEY) {
    return {kind: MessagingProviderKind.Postmark};
  }
  if (process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
    return {kind: MessagingProviderKind.SendGrid};
  }
  if (process.env.ETHEREAL_USERNAME && process.env.ETHEREAL_PASSWORD) {
    return {kind: MessagingProviderKind.Test};
  }
  if (process.env.NODE_ENV === 'development') {
    return {kind: MessagingProviderKind.Test};
  }
  throw new Error(
    'You must specify an email provider. @authentication supports SMTP, MailGun, Postmark, SendGrid and Ethereal out of the box.',
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
async function getTransport(provider: Provider): Promise<Transporter> {
  switch (provider.kind) {
    case MessagingProviderKind.MailGun:
      return createTransport(
        require('nodemailer-mailgun-transport')({
          auth: {
            api_key: getValue<string>(
              [
                provider.account && provider.account.apiKey,
                process.env.MAILGUN_API_KEY,
              ],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.apiKey or specify the MAILGUN_API_KEY environment variable.',
            ),
            domain: getValue<string>(
              [
                provider.account && provider.account.domain,
                process.env.MAILGUN_DOMAIN,
              ],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.domain or specify the MAILGUN_DOMAIN environment variable.',
            ),
          },
        }),
      );
    case MessagingProviderKind.Postmark:
      return createTransport(
        require('nodemailer-postmark-transport')({
          auth: {
            apiKey: getValue<string>(
              [provider.apiKey, process.env.POSTMARK_API_KEY],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide apiKey or specify the POSTMARK_API_KEY environment variable.',
            ),
          },
        }),
      );
    case MessagingProviderKind.SendGrid:
      return createTransport(
        require('nodemailer-sendgrid-transport')({
          auth: {
            api_user: getValue<string>(
              [
                provider.account && provider.account.username,
                process.env.SENDGRID_USERNAME,
              ],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.username or specify the SENDGRID_USERNAME environment variable.',
            ),
            api_key: getValue<string>(
              [
                provider.account && provider.account.password,
                process.env.SENDGRID_PASSWORD,
              ],
              v => (typeof v === 'string' ? v : undefined),
              'You must either provide account.username or specify the SENDGRID_USERNAME environment variable.',
            ),
          },
        }),
      );
    case MessagingProviderKind.SMTP:
      if (provider.url) {
        if (typeof provider.url !== 'string') {
          throw new Error('The SMTP URL must be a string');
        }
        createTransport(provider.url);
      }
      if (provider.config) {
        createTransport(provider.config);
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
    case MessagingProviderKind.Test:
      return createTransport({
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
            : await createTestAccount(),
      });
  }
}

function toProvider(kind: MessagingProviderKind): Provider {
  switch (kind) {
    case MessagingProviderKind.MailGun:
      return {kind};
    case MessagingProviderKind.Postmark:
      return {kind};
    case MessagingProviderKind.SendGrid:
      return {kind};
    case MessagingProviderKind.SMTP:
      return {kind};
    case MessagingProviderKind.Test:
      return {kind};
    default:
      throw new Error('Unrecognised messaging provider kind');
  }
}

export default function getTransportSync(
  provider: Provider | MessagingProviderKind = getDefaultProvider(),
): AsyncTransporter {
  const transport = getTransport(
    typeof provider === 'string' ? toProvider(provider) : provider,
  );
  return {
    /** Closes all connections in the pool. If there is a message being sent, the connection is closed later */
    close() {
      transport.then(t => t.close());
    },

    /** Verifies SMTP configuration */
    verify() {
      return transport.then(t => t.verify());
    },

    /** Sends an email using the preselected transport object */
    sendMail(mailOptions: SendMailOptions) {
      return transport.then(t => t.sendMail(mailOptions));
    },
  };
}
