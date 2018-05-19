import {IncomingMessage, ServerResponse} from 'http';
import Cookie, {
  Options as CookieOptions,
  SameSitePolicy,
  SigningPolicy,
  EncryptionPolicy,
  Session,
} from '@authentication/cookie';
type AnyObject = {[key: string]: any};

const onHeaders: (
  res: ServerResponse,
  handler: () => void,
) => void = require('on-headers');

export {SameSitePolicy, Session, SigningPolicy, EncryptionPolicy};
export interface Options extends CookieOptions {
  /**
   * Name of the cookie to use (defaults to "session")
   */
  name?: string;
}

export default function cookieSession(options: Options) {
  if (!options || options.maxAge == null) {
    throw new Error('You must provide options with at least a max age');
  }
  if ('secret' in options) {
    throw new Error('The "secret" option is not supported, use "keys"');
  }
  if ('httpOnly' in options) {
    throw new Error(
      'The "httpOnly" option is not supported, use "serverSideOnly"',
    );
  }
  if ('signed' in options) {
    throw new Error(
      'The "signed" option is not supported, use "signingPolicy"',
    );
  }
  if ('secure' in options) {
    throw new Error('The "secure" option is not supported, use "httpsOnly"');
  }

  const {name, ...opts} = options;
  const cookie = new Cookie<AnyObject>(name || 'session', opts);

  return function _cookieSession(
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: any) => any,
  ): void {
    let value: AnyObject | false | undefined;
    // define req.session getter / setter
    Object.defineProperty(req, 'session', {
      configurable: true,
      enumerable: true,
      get(): AnyObject | null {
        // already retrieved
        if (value) {
          return value;
        }

        // unset
        if (value === false) {
          return null;
        }

        // get or create session
        return (value = cookie.get(req, res) || {});
      },
      set(val: AnyObject | null): AnyObject | null {
        if (val == null) {
          // unset session
          value = false;
          return null;
        }

        if (typeof val === 'object') {
          // create a new session
          try {
            JSON.stringify(val);
          } catch (ex) {
            throw new Error('req.session must be JSON serializable.');
          }
          return (value = val);
        }

        throw new Error('req.session can only be set as null or an object.');
      },
    });

    onHeaders(res, function setHeaders() {
      if (value === undefined) {
        // not accessed
        cookie.refresh(req, res);
        return;
      }
      if (value === false) {
        cookie.remove(req, res);
      } else {
        cookie.set(req, res, value);
      }
    });

    next();
  };
}

module.exports = cookieSession;
module.exports.default = cookieSession;
module.exports.SameSitePolicy = SameSitePolicy;
module.exports.Session = Session;
module.exports.SigningPolicy = SigningPolicy;
module.exports.EncryptionPolicy = EncryptionPolicy;
