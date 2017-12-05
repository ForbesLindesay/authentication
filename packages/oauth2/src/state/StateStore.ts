import {IncomingMessage} from 'http';
import {URL} from 'url';

export type State = string | void;
export interface MetaData {
  authorizationURL: URL;
  tokenURL: URL;
  clientID: string;
}

export default interface StateStore {
  store(req: IncomingMessage, meta: MetaData): Promise<State>;
  verify(
    req: IncomingMessage,
    state: State,
    meta: MetaData,
  ): Promise<true | {ok: boolean; info?: any}>;
};
