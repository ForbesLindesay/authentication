// @public

import * as React from 'react';
import useDigitInput, {InputAttributes} from 'react-digit-input';
import CountdownTimer from './CountdownTimer';
import {EnteringPassCode, PasswordlessResponseKind} from '.';

const inputStyle: React.CSSProperties = {
  width: '1em',
  height: '1em',
  font: 'inherit',
  textAlign: 'center',
  margin: '0.1em',
};
function CharacterInput(props: {
  disabled: boolean;
  digitProps: InputAttributes;
}) {
  return (
    <input
      inputMode="decimal"
      style={inputStyle}
      disabled={props.disabled}
      {...props.digitProps}
    />
  );
}
function Hyphen() {
  return (
    <span
      style={{
        background: 'black',
        height: '0.1em',
        width: '0.5em',
        display: 'inline-block',
      }}
    />
  );
}
export default function DefaultPassCodeForm(props: EnteringPassCode) {
  const digits = useDigitInput({
    acceptedCharacters: props.acceptedCharacters,
    length: props.passCodeLength,
    value: props.passCode,
    onChange: props.onChange,
  });
  const inputs: React.ReactElement<{}>[] = [];
  const interval =
    digits.length % 3 === 0
      ? 3
      : digits.length % 4 === 0
      ? 4
      : digits.length % 2 === 0
      ? 2
      : 0;
  digits.forEach((p, i) => {
    if (interval !== 0 && i !== 0 && i % interval === 0) {
      inputs.push(<Hyphen key={i + '_hyphen'} />);
    }
    inputs.push(
      <CharacterInput key={i} disabled={props.submitting} digitProps={p} />,
    );
  });
  return (
    <form onSubmit={props.onSubmit}>
      <h1>Check your e-mail</h1>
      <label>
        Enter the {digits.length}-digit code:
        <div style={{alignItems: 'center', display: 'flex', fontSize: '5em'}}>
          {inputs}
        </div>
      </label>
      <p style={{color: 'red'}}>
        {props.error?.kind === PasswordlessResponseKind.IncorrectPassCode ? (
          'This pass code was incorrect, please check you have entred exacty the value in your e-mail. You have ' +
          props.error.attemptsRemaining +
          ' attempts remaining.'
        ) : props.passCodeTouched && !props.isPassCodeValid ? (
          'This pass code is incorrect, please check you have entered exactly the value in your e-mail.'
        ) : props.error?.kind === PasswordlessResponseKind.RateLimitExceeded ? (
          <span>
            You have exceeded the rate limit. You need to wait{' '}
            <CountdownTimer time={props.error.nextTokenTimestamp} /> before you
            can try again.
          </span>
        ) : props.error ? (
          props.error.message
        ) : null}
      </p>
      <p>Altenatively you can just click the "Magic" link in the e-mail</p>
      <button
        disabled={
          props.submitting ||
          props.error?.kind === PasswordlessResponseKind.RateLimitExceeded ||
          (props.passCodeTouched && !props.isPassCodeValid)
        }
        type="submit"
      >
        Login
      </button>
    </form>
  );
}

module.exports = Object.assign(DefaultPassCodeForm, {
  default: DefaultPassCodeForm,
});
