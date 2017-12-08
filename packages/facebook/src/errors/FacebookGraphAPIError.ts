import BaseError from '@authentication/base-error';

/**
 * References:
 *   - https://developers.facebook.com/docs/reference/api/errors/
 */
export default class FacebookGraphAPIError extends BaseError {
  readonly type: string;
  readonly subcode: number;
  readonly traceID: string;
  constructor(
    code: string,
    message: string,
    type: string,
    subcode: number,
    traceID: string,
  ) {
    super(code, message);
    this.type = type;
    this.subcode = subcode;
    this.traceID = traceID;
  }
}
