import PasswordlessResponseKind from './PasswordlessResponseKind';
import RateLimitExceededError from './RateLimitExceededError';

export interface CreatedToken {
  kind: PasswordlessResponseKind.CreatedToken;
  tokenID: string;
}

export interface InvalidEmailError {
  kind: PasswordlessResponseKind.InvalidEmail;
  message: string;
  email: string;
}

export type CreateTokenError = InvalidEmailError | RateLimitExceededError;

export type CreateTokenStatus = CreatedToken | CreateTokenError;
