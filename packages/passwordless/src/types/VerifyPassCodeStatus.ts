import PasswordlessResponseKind from './PasswordlessResponseKind';
import RateLimitExceededError from './RateLimitExceededError';

export interface VerifiedToken {
  kind: PasswordlessResponseKind.VerifiedToken;
  userID: string;
}
export interface ExpiredTokenError {
  kind: PasswordlessResponseKind.ExpiredToken;
  message: string;
}
export interface IncorrectPassCodeError {
  kind: PasswordlessResponseKind.IncorrectPassCode;
  message: string;
  attemptsRemaining: number;
}
export type VerifyTokenError =
  | ExpiredTokenError
  | IncorrectPassCodeError
  | RateLimitExceededError;

export type VerifyPassCodeStatus = VerifiedToken | VerifyTokenError;
