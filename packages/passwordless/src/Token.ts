export default interface Token<State = void> {
  userID: string;
  /**
   * An incrementing integer used for optimistic concurency
   */
  version: number;
  /**
   * The pass code, that gets sent in the e-mail and entered by
   * the user (or appears as the `code` parameter in "magic" link)
   */
  passCode: string;
  /**
   * The number of attempts remaining before the token is disposed of.
   */
  attemptsRemaining: number;
  /**
   * The time this token was created, represented as milliseconds since
   * the unix epoch.
   */
  created: number;
  /**
   * The time this token expires, represented as milliseconds since the
   * unix epoch.
   */
  expiry: number;
  /**
   * Some arbirary state of your choice. This is a good place to store a
   * redirect URI for after the authentication is complete.
   */
  state: State;
}
