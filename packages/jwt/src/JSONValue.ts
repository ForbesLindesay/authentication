export interface JsonObject {
  [key: string]: undefined | JsonValue;
}
type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export default JsonValue;
