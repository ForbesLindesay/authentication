export enum CreateTokenStatusKind {
  CreatedToken,
  InvalidEmail,
  RateLimitExceeded,
}

export interface CreatedToken {
  kind: CreateTokenStatusKind.CreatedToken;
  tokenID: string;
  dos: string;
}

export interface InvalidEmailError {
  kind: CreateTokenStatusKind.InvalidEmail;
  message: string;
  email: string;
}

export interface RateLimitExceededError {
  kind: CreateTokenStatusKind.RateLimitExceeded;
  message: string;
  nextTokenTimestamp: number;
}

export type CreateTokenError = InvalidEmailError | RateLimitExceededError;

export type CreateTokenStatus =
  | CreatedToken
  | InvalidEmailError
  | RateLimitExceededError;
