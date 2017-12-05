import StateStore from './StateStore';

export default class NullStore implements StateStore {
  async store() {}
  async verify(): Promise<true> {
    return true;
  }
}
