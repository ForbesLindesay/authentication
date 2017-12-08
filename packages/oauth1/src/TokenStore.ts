export default interface TokenStore<ID> {
  save(token: string): ID | Promise<ID>;
  retrieve(id: ID): null | string | Promise<null | string>;
  remove(id: number): void | Promise<void>;
};
