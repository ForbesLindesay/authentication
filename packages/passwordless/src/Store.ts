import {RateLimitState} from '@authentication/rate-limit';
import Token from './Token';

export interface StoreAPI<State = void> {
  saveToken(token: Token<State>): Promise<string>;
  loadToken(tokenID: string): Promise<Token<State> | null>;
  updateToken(tokenID: string, token: Token<State>): Promise<null | void | {}>;
  removeToken(tokenID: string): Promise<null | void | {}>;
  saveRateLimit(id: string, state: RateLimitState): Promise<void | null | {}>;
  loadRateLimit(id: string): Promise<null | RateLimitState>;
  removeRateLimit(id: string): Promise<void | null | {}>;
}
export interface TransactionalStoreAPI<State = void> {
  tx<T>(fn: (store: StoreAPI<State>) => Promise<T>): Promise<T>;
}
export type Store<State = void> =
  | TransactionalStoreAPI<State>
  | StoreAPI<State>;
export default Store;
