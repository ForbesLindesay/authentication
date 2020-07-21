import {RateLimitState, RateLimitStore} from '@authentication/rate-limit';
import Token from './Token';

export interface TokensAPI<State = undefined> {
  save(token: Token<State>): Promise<string>;
  load(tokenID: string): Promise<Token<State> | null>;
  update(tokenID: string, token: Token<State>): Promise<null | void | {}>;
  remove(tokenID: string): Promise<null | void | {}>;
}
export interface NamespacedStoreAPI<State = undefined> {
  tokens: TokensAPI<State>;
  rateLimit: RateLimitStore<string>;
}

export interface UnnamespacedStoreAPI<State = undefined> {
  saveToken(token: Token<State>): Promise<string>;
  loadToken(tokenID: string): Promise<Token<State> | null>;
  updateToken(tokenID: string, token: Token<State>): Promise<null | void | {}>;
  removeToken(tokenID: string): Promise<null | void | {}>;
  saveRateLimit(
    id: string,
    state: RateLimitState,
    oldState: null | RateLimitState,
  ): Promise<void | null | {}>;
  loadRateLimit(id: string): Promise<null | RateLimitState>;
  removeRateLimit(id: string): Promise<void | null | {}>;
}

export type StoreConfig<State = undefined> =
  | NamespacedStoreAPI<State>
  | UnnamespacedStoreAPI<State>;

export default class Store<State = undefined> {
  readonly saveToken: (token: Token<State>) => Promise<string>;
  readonly loadToken: (tokenID: string) => Promise<Token<State> | null>;
  readonly updateToken: (
    tokenID: string,
    token: Token<State>,
  ) => Promise<null | void | {}>;
  readonly removeToken: (tokenID: string) => Promise<null | void | {}>;
  readonly saveRateLimit: (
    id: string,
    state: RateLimitState,
    oldState: null | RateLimitState,
  ) => Promise<void | null | {}>;
  readonly loadRateLimit: (id: string) => Promise<null | RateLimitState>;
  readonly removeRateLimit: (id: string) => Promise<void | null | {}>;
  constructor(config: StoreConfig<State>) {
    if ('tokens' in config) {
      this.saveToken = (t) => config.tokens.save(t);
      this.loadToken = (t) => config.tokens.load(t);
      this.updateToken = (i, t) => config.tokens.update(i, t);
      this.removeToken = (i) => config.tokens.remove(i);
      this.saveRateLimit = (i, s, old) => config.rateLimit.save(i, s, old);
      this.loadRateLimit = (i) => config.rateLimit.load(i);
      this.removeRateLimit = (i) => config.rateLimit.remove(i);
    } else {
      this.saveToken = (t) => config.saveToken(t);
      this.loadToken = (t) => config.loadToken(t);
      this.updateToken = (i, t) => config.updateToken(i, t);
      this.removeToken = (i) => config.removeToken(i);
      this.saveRateLimit = (i, s, old) => config.saveRateLimit(i, s, old);
      this.loadRateLimit = (i) => config.loadRateLimit(i);
      this.removeRateLimit = (i) => config.removeRateLimit(i);
    }
  }
}
