import PasswordlessResponseKind from './PasswordlessResponseKind';

export default interface RateLimitExceededError {
  kind: PasswordlessResponseKind.RateLimitExceeded;
  message: string;
  nextTokenTimestamp: number;
}
