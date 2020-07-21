import {URL} from 'url';

/**
 * Reconstructs the original URL of the request.
 *
 * This function builds a URL that corresponds the original URL requested by the
 * client, including the protocol (http or https) and host.
 *
 * If the request passed through any proxies that terminate SSL, the
 * `X-Forwarded-Proto` header is used to detect if the request was encrypted to
 * the proxy, assuming that the proxy has been flagged as trusted.
 */
export default function getRequestURL(
  expressRequestOrKoaContext: {
    readonly headers?: unknown;
    readonly url?: string;
    readonly connection?: unknown;
  },
  options: {
    trustProxy?: boolean | void | undefined;
    baseURL?: URL | string;
  } = {},
): URL {
  const path = expressRequestOrKoaContext.url || '';
  if (options.baseURL) {
    const result = new URL(path, options.baseURL);
    if (
      !result.href.startsWith(
        typeof options.baseURL === 'string'
          ? options.baseURL
          : options.baseURL.href,
      )
    ) {
      throw new Error(
        'The url should start with the base URL. Either baseURL or req.url is invalid.',
      );
    }
    return result;
  }

  const trustProxy =
    typeof options.trustProxy === 'boolean'
      ? options.trustProxy
      : process.env.NODE_ENV === 'development';

  const tls: boolean =
    safeGetBoolean(expressRequestOrKoaContext.connection, 'encrypted', false) ||
    (trustProxy &&
      'https' ===
        safeGetString(expressRequestOrKoaContext.headers, 'x-forwarded-proto')
          .toLowerCase()
          .split(/\s*,\s*/)[0]);

  const host =
    (trustProxy &&
      safeGetString(expressRequestOrKoaContext.headers, 'x-forwarded-host')) ||
    safeGetString(expressRequestOrKoaContext.headers, 'host');

  if (!host) {
    throw new Error('Unable to determine the host for this request.');
  }

  const protocol = tls ? 'https' : 'http';
  const result = new URL(protocol + '://' + host + path);

  if (!result.href.startsWith(protocol + '://' + host)) {
    throw new Error(
      'The url should start with the base URL. Either baseURL or req.url is invalid.',
    );
  }

  return result;
}

module.exports = Object.assign(getRequestURL, {default: getRequestURL});

function safeGetString(obj: unknown, key: string): string {
  if (obj && typeof obj === 'object') {
    return `${(obj as any)[key]}`;
  } else {
    return '';
  }
}

function safeGetBoolean(
  obj: unknown,
  key: string,
  defaultValue: boolean,
): boolean {
  if (
    obj &&
    typeof obj === 'object' &&
    typeof (obj as any)[key] === 'boolean'
  ) {
    return (obj as any)[key];
  } else {
    return defaultValue;
  }
}
