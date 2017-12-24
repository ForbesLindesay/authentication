import * as React from 'react';
import CountdownTimer from './CountdownTimer';
import EmailFormProps from './EmailFormProps';

export default function DefaultEmailForm(props: EmailFormProps) {
  return (
    <form onSubmit={props.onSubmit}>
      <h1>Please enter your e-mail address to login</h1>
      <label>
        Email:
        <input
          disabled={props.creatingToken}
          type="email"
          name="email"
          value={props.email}
          onBlur={props.onBlur}
          onChange={props.onChange}
        />
      </label>
      <p style={{color: 'red'}}>
        {props.touched && !props.isEmailValid ? (
          'Please enter a valid e-mail address'
        ) : props.rateLimitUntil ? (
          <p>
            You have exceeded the rate limit. You need to wait{' '}
            <CountdownTimer time={props.rateLimitUntil} /> before you can try
            again.
          </p>
        ) : null}
      </p>
      <button
        disabled={
          props.creatingToken ||
          !!props.rateLimitUntil ||
          (props.touched && !props.isEmailValid)
        }
        type="submit"
      >
        Login
      </button>
    </form>
  );
}
