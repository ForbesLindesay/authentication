import * as React from 'react';
import CountdownTimer from './CountdownTimer';
import {EnteringEmail, PasswordlessResponseKind} from '.';

export default function DefaultEmailForm(props: EnteringEmail) {
  return (
    <form onSubmit={props.onSubmit}>
      <h1>Please enter your e-mail address to login</h1>
      <label>
        Email:
        <input
          disabled={props.submitting}
          type="email"
          name="email"
          value={props.email}
          onBlur={props.onBlur}
          onChange={props.onChange}
        />
      </label>
      <p style={{color: 'red'}}>
        {props.emailTouched && !props.isEmailValid ? (
          'Please enter a valid e-mail address'
        ) : props.error?.kind === PasswordlessResponseKind.RateLimitExceeded ? (
          <span>
            It looks like you've tried to log in too many times. You need to
            wait <CountdownTimer time={props.error.nextTokenTimestamp} /> before
            you can try again.
          </span>
        ) : props.error?.kind === PasswordlessResponseKind.ExpiredToken ? (
          'Your token expired, please enter your e-mail and click "login" again to get a new pass code.'
        ) : props.error?.kind === PasswordlessResponseKind.IncorrectPassCode ? (
          'You\'ve entered the wrong password too many times, please enter your e-mail and click "login" to get a new pass code.'
        ) : props.error ? (
          props.error.message
        ) : null}
      </p>
      <button
        disabled={
          props.submitting ||
          props.error?.kind === PasswordlessResponseKind.RateLimitExceeded ||
          (props.emailTouched && !props.isEmailValid)
        }
        type="submit"
      >
        Login
      </button>
    </form>
  );
}

module.exports = Object.assign(DefaultEmailForm, {
  default: DefaultEmailForm,
});
