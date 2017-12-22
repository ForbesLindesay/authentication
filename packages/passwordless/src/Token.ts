export default interface Token<State = void> {
  userID: string;
  /**
   * Un-hashed pass-code used to prevent denail of service. We'll check
   * this before rate limiting
   */
  dos: string;
  /**
   * Hash of the pass code, that gets sent in the e-mail and entered by
   * the user (or appears as the `code` parameter in "magic" link)
   */
  passCodeHash: string;
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
   * The user agent string of the original request to create the token.
   */
  userAgent: string;
  /**
   * Some arbirary state of your choice. This is a good place to store a
   * redirect URI for after the authentication is complete.
   */
  state: State;
};
