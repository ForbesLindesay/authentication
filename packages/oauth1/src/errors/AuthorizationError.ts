import BaseError from '@authentication/base-error';

/**
 * `AuthorizationError` error.
 *
 * AuthorizationError represents an error in response to an authorization
 * request.  For details, refer to RFC 6749, section 4.1.2.1.
 *
 * References:
 *   - [The OAuth 2.0 Authorization Framework](http://tools.ietf.org/html/rfc6749)
 */
export default class AuthorizationError extends BaseError {
  readonly uri: void | string;
  readonly status: number;
  constructor(code: string, message: string, uri?: string, status?: number) {
    super(code, message);
    this.uri = uri;
    if (!status) {
      switch (code) {
        case 'access_denied':
          status = 403;
          break;
        case 'server_error':
          status = 502;
          break;
        case 'temporarily_unavailable':
          status = 503;
          break;
      }
    }
    this.status = status || 500;
  }
}
