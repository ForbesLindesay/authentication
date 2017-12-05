import {IncomingMessage} from 'http';
import StateStore from './StateStore';
import getUID from './getUID';

export interface Options {
  /**
   * The key in the session under which to store the state
   */
  key: string;
}

/**
 * Creates an instance of `SessionStore`.
 *
 * This is the state store implementation for the OAuth2Strategy used when
 * the `state` option is enabled.  It generates a random state and stores it in
 * `req.session` and verifies it when the service provider redirects the user
 * back to the application.
 *
 * This state store requires session support.  If no session exists, an error
 * will be thrown.
 */
export default class SessionStore implements StateStore {
  private readonly _key: string;
  constructor(options: Options) {
    if (!options.key) {
      throw new TypeError('Session-based state store requires a session key');
    }
    this._key = options.key;
  }

  /**
   * Store request state.
   *
   * This implementation simply generates a random string and stores the value in
   * the session, where it will be used for verification when the user is
   * redirected back to the application.
   */
  async store(req: IncomingMessage) {
    const session: any = (req as any).session;
    if (!session) {
      throw new Error(
        'OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?',
      );
    }

    const key = this._key;
    const state = await getUID(24);
    if (!session[key]) {
      session[key] = {};
    }
    session[key].state = state;
    return state;
  }

  /**
   * Verify request state.
   *
   * This implementation simply compares the state parameter in the request to the
   * value generated earlier and stored in the session.
   */
  async verify(req: IncomingMessage, providedState: string | void) {
    const session: any = (req as any).session;
    if (!session) {
      throw new Error(
        'OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?',
      );
    }

    const key = this._key;
    if (!session[key]) {
      return {
        ok: false,
        info: {message: 'Unable to verify authorization request state.'},
      };
    }

    const state: void | string = session[key].state;
    if (!state) {
      return {
        ok: false,
        info: {message: 'Unable to verify authorization request state.'},
      };
    }

    delete session[key].state;
    if (Object.keys(session[key]).length === 0) {
      delete session[key];
    }

    if (state !== providedState) {
      return {
        ok: false,
        info: {message: 'Invalid authorization request state.'},
      };
    }
    return true;
  }
}
