export enum VerifyPassCodeStatusKind {
  CorrectPassCode,
  ExpiredToken,
  IncorrectPassCode,
  RateLimitExceeded,
}
export interface CorrectPassCode<State> {
  kind: VerifyPassCodeStatusKind.CorrectPassCode;
  userID: string;
  state: State;
}
export interface ExpiredTokenError {
  kind: VerifyPassCodeStatusKind.ExpiredToken;
  message: string;
}
export interface IncorrectPassCodeError {
  kind: VerifyPassCodeStatusKind.IncorrectPassCode;
  message: string;
  attemptsRemaining: number;
}
export interface RateLimitExceededError {
  kind: VerifyPassCodeStatusKind.RateLimitExceeded;
  message: string;
  nextTokenTimestamp: number;
}
export type VerifyPassCodeError =
  | ExpiredTokenError
  | IncorrectPassCodeError
  | RateLimitExceededError;

export type VerifyPassCodeStatus<State> =
  | CorrectPassCode<State>
  | ExpiredTokenError
  | IncorrectPassCodeError
  | RateLimitExceededError;
