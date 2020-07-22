import {
  PasswordlessResponseKind,
  RateLimitExceededError,
  CreatedToken,
  InvalidEmailError,
  VerifiedToken,
  ExpiredTokenError,
  IncorrectPassCodeError,
} from './types';

export const rateLimitExceededError = ({
  message,
  nextTokenTimestamp,
}: {
  message: string;
  nextTokenTimestamp: number;
}): RateLimitExceededError => ({
  kind: PasswordlessResponseKind.RateLimitExceeded,
  message,
  nextTokenTimestamp,
});

export const createdToken = (tokenID: string): CreatedToken => ({
  kind: PasswordlessResponseKind.CreatedToken,
  tokenID,
});

export const invalidEmailError = (email: string): InvalidEmailError => ({
  kind: PasswordlessResponseKind.InvalidEmail,
  message: 'Please enter a valid e-mail address',
  email,
});

export const verifiedToken = (userID: string): VerifiedToken => ({
  kind: PasswordlessResponseKind.VerifiedToken,
  userID,
});

export const expiredTokenError = (): ExpiredTokenError => ({
  kind: PasswordlessResponseKind.ExpiredToken,
  message: 'This token has expired, please generate a new one and try again.',
});

export const incorrectPassCodeError = (
  attemptsRemaining: number,
): IncorrectPassCodeError => ({
  kind: PasswordlessResponseKind.IncorrectPassCode,
  message:
    attemptsRemaining > 0
      ? 'Incorrect pass code, please try again.'
      : 'The pass code was incorrect and you have no more attempts available, please generate a new token and try again.',
  attemptsRemaining,
});
