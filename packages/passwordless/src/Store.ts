import {RateLimitStore} from '@authentication/rate-limit';
import Token from './Token';

export interface TokensStore<State = undefined> {
  insert(token: Token<State>): Promise<string>;
  load(tokenID: string): Promise<Token<State> | null>;
  update(
    tokenID: string,
    token: Token<State>,
    oldToken: Token<State>,
  ): Promise<void>;
  remove(tokenID: string): Promise<void>;
}
export default interface PasswordlessStore<State = undefined> {
  tokens: TokensStore<State>;
  rateLimit: RateLimitStore<string>;
}
