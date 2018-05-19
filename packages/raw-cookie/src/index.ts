import {IncomingMessage, ServerResponse} from 'http';

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * RegExp to match Same-Site cookie attribute value.
 */
const sameSiteRegExp = /^(?:lax|strict)$/i;
const cache: {[name: string]: RegExp} = {};

export interface Options {
  domain?: string;
  maxAgeMilliseconds?: number;
  overwrite?: boolean;
  path?: string;
  sameSite?: boolean | 'lax' | 'strict';
  httpsOnly?: boolean;
  serverSideOnly?: boolean;
}

export function getCookie(
  req: IncomingMessage,
  res: ServerResponse,
  name: string,
): string | undefined {
  let header = req.headers['cookie'];
  if (!header) return;
  if (typeof header !== 'string') {
    header = header.join(';');
  }
  const match = header.match(getPattern(name));
  if (!match) return;
  const value = match[1];

  return value;
}

export function setCookie(
  req: IncomingMessage,
  res: ServerResponse,
  name: string,
  value: string,
  options: Options = {},
) {
  const headers = res.getHeader('Set-Cookie') || [];

  res.setHeader(
    'Set-Cookie',
    pushCookie(Array.isArray(headers) ? headers : ['' + headers], name, value, {
      ...options,
      httpsOnly:
        options.httpsOnly !== undefined
          ? !!options.httpsOnly
          : (req as any).protocol === 'https' ||
            (req.connection as any).encrypted,
    }),
  );
}

export function removeCookie(
  req: IncomingMessage,
  res: ServerResponse,
  name: string,
  options: Options = {},
) {
  setCookie(req, res, name, '', {
    ...options,
    maxAgeMilliseconds: 0,
  });
}

function getPattern(name: string) {
  if (cache[name]) return cache[name];

  return (cache[name] = new RegExp(
    '(?:^|;) *' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)',
  ));
}

function filterCookies(cookies: ReadonlyArray<string>, name: string) {
  return cookies.filter(c => c.indexOf(name + '=') !== 0);
}

function pushCookie(
  cookies: ReadonlyArray<string>,
  name: string,
  value: string,
  options: Options,
) {
  const header = generateHeader(name, value, options);
  if (options.overwrite !== false) {
    const c = filterCookies(cookies, name);
    c.push(header);
    return c;
  }
  return cookies.concat([generateHeader(name, value, options)]);
}

function generateHeader(name: string, value: string, options: Options) {
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument value is invalid');
  }

  if (options.path && !fieldContentRegExp.test(options.path)) {
    throw new TypeError('option path is invalid');
  }

  if (options.domain && !fieldContentRegExp.test(options.domain)) {
    throw new TypeError('option domain is invalid');
  }

  if (
    options.sameSite &&
    options.sameSite !== true &&
    !sameSiteRegExp.test(options.sameSite)
  ) {
    throw new TypeError('option sameSite is invalid');
  }

  let header = `${name}=${value}`;
  header += `; path=${options.path || '/'}`;
  if (options.maxAgeMilliseconds != null) {
    header += `; expires=${new Date(
      Date.now() + options.maxAgeMilliseconds,
    ).toUTCString()}`;
  }
  if (options.domain) {
    header += `; domain=${options.domain}`;
  }
  if (options.sameSite !== false) {
    header +=
      '; samesite=' +
      (options.sameSite === true
        ? 'strict'
        : options.sameSite ? options.sameSite.toLowerCase() : 'lax');
  }
  if (options.httpsOnly) header += '; secure';
  if (options.serverSideOnly !== false) header += '; httponly';

  return header;
}
