import BaseError from '@authentication/base-error';

/**
 * `TokenError` error.
 *
 * TokenError represents an error received from a token endpoint.  For details,
 * refer to RFC 6749, section 5.2.
 *
 * References:
 *   - [The OAuth 2.0 Authorization Framework](http://tools.ietf.org/html/rfc6749)
 */
export default class TokenError extends BaseError {
  readonly uri: string;
  readonly status: number;
  constructor(code: string, message: string, uri: string, status: number) {
    super(code, message);
    this.uri = uri;
    this.status = status;
  }
}
