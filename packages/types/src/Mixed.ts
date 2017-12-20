export type MixedCore = null | void | undefined | MixedObject;
export interface MixedObject {
  [key: string]: Mixed;
}
export type Mixed = MixedCore | (MixedCore[] & MixedObject);
export default Mixed;
