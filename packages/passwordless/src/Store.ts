import {
  RateLimitState,
  StoreAPI as RateLimitStoreAPI,
} from '@authentication/rate-limit';
import Token from './Token';

export interface TokensAPI<State = undefined> {
  save(token: Token<State>): Promise<string>;
  load(tokenID: string): Promise<Token<State> | null>;
  update(tokenID: string, token: Token<State>): Promise<null | void | {}>;
  remove(tokenID: string): Promise<null | void | {}>;
}
export interface NamespacedStoreAPI<State = undefined> {
  tokens: TokensAPI<State>;
  rateLimit: RateLimitStoreAPI<string>;
}

export interface UnnamespacedStoreAPI<State = undefined> {
  saveToken(token: Token<State>): Promise<string>;
  loadToken(tokenID: string): Promise<Token<State> | null>;
  updateToken(tokenID: string, token: Token<State>): Promise<null | void | {}>;
  removeToken(tokenID: string): Promise<null | void | {}>;
  saveRateLimit(id: string, state: RateLimitState): Promise<void | null | {}>;
  loadRateLimit(id: string): Promise<null | RateLimitState>;
  removeRateLimit(id: string): Promise<void | null | {}>;
}

export type StoreAPI<State = undefined> =
  | NamespacedStoreAPI<State>
  | UnnamespacedStoreAPI<State>;

export interface TransactionalStoreAPI<State = undefined> {
  tx<T>(fn: (store: StoreAPI<State>) => Promise<T>): Promise<T>;
}
export type StoreConfig<State = undefined> =
  | TransactionalStoreAPI<State>
  | StoreAPI<State>;

export class StoreTransaction<State = undefined> {
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
  ) => Promise<void | null | {}>;
  readonly loadRateLimit: (id: string) => Promise<null | RateLimitState>;
  readonly removeRateLimit: (id: string) => Promise<void | null | {}>;
  constructor(config: StoreAPI<State>) {
    if ('tokens' in config) {
      this.saveToken = t => config.tokens.save(t);
      this.loadToken = t => config.tokens.load(t);
      this.updateToken = (i, t) => config.tokens.update(i, t);
      this.removeToken = i => config.tokens.remove(i);
      this.saveRateLimit = (i, s) => config.rateLimit.save(i, s);
      this.loadRateLimit = i => config.rateLimit.load(i);
      this.removeRateLimit = i => config.rateLimit.remove(i);
    } else {
      this.saveToken = t => config.saveToken(t);
      this.loadToken = t => config.loadToken(t);
      this.updateToken = (i, t) => config.updateToken(i, t);
      this.removeToken = i => config.removeToken(i);
      this.saveRateLimit = (i, s) => config.saveRateLimit(i, s);
      this.loadRateLimit = i => config.loadRateLimit(i);
      this.removeRateLimit = i => config.removeRateLimit(i);
    }
  }
}
export default class Store<State = undefined> {
  readonly tx: <T>(
    fn: (store: StoreTransaction<State>) => Promise<T>,
  ) => Promise<T>;
  constructor(config: StoreConfig<State>) {
    if ('tx' in config) {
      this.tx = fn => config.tx(store => fn(new StoreTransaction(store)));
    } else {
      const tx = new StoreTransaction(config);
      this.tx = fn => fn(tx);
    }
  }
}
