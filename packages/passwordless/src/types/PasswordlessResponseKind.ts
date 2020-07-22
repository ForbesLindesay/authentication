enum PasswordlessResponseKind {
  // create token
  CreatedToken = 'created_token',
  InvalidEmail = 'invalid_email',

  // verify token
  VerifiedToken = 'verified_token',
  ExpiredToken = 'expired_token',
  IncorrectPassCode = 'incorrect_pass_code',

  // shared
  RateLimitExceeded = 'rate_limit_exceeded',
}
export default PasswordlessResponseKind;
