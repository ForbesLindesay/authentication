import BaseError from '@authentication/base-error';

/**
 * Failure when verifying state matches expected state
 */
export default class StateVerificationFailure extends BaseError {
  readonly statusCode: number = 403;
  constructor(message: string) {
    super('OAUTH_STATE_VERIFICATION_FAILURE', message);
  }
}
