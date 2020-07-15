// export interface VerifyResult {
//   INVALID_UNRECOGNIZED_HASH
// }
export default interface SecureHashImplementation {
  hash(password: string): Promise<string>;
  verify(
    password: string,
    passwordHash: string,
    onUpdate: (passwordHash: string) => Promise<{} | void | null>,
  ): Promise<boolean>;
}
