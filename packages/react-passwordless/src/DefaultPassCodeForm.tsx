import * as React from 'react';
import DigitInput, {InputAttributes} from 'react-digit-input';
import CountdownTimer from './CountdownTimer';
import PassCodeFormProps from './PassCodeFormProps';
import getRegExForEncoding from './getRegExForEncoding';

const inputStyle = {
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
      type="tel"
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
export default function DefaultPassCodeForm(props: PassCodeFormProps) {
  return (
    <form onSubmit={props.onSubmit}>
      <h1>Check your e-mail</h1>
      <label>
        Enter the 6-digit code:
        <DigitInput
          acceptedCharacters={getRegExForEncoding(props.passCodeEncoding)}
          length={props.passCodeLength}
          value={props.passCode}
          onChange={props.onChange}
        >
          {inputProps => {
            const inputs: React.ReactElement<{}>[] = [];
            const interval =
              inputProps.length % 3 === 0
                ? 3
                : inputProps.length % 4 === 0
                  ? 4
                  : inputProps.length % 2 === 0 ? 2 : 0;
            inputProps.forEach((p, i) => {
              if (interval !== 0 && i !== 0 && i % interval === 0) {
                inputs.push(<Hyphen key={i + '_hyphen'} />);
              }
              inputs.push(
                <CharacterInput
                  key={i}
                  disabled={props.validatingPassCode}
                  digitProps={p}
                />,
              );
            });

            return (
              <div
                style={{alignItems: 'center', display: 'flex', fontSize: '5em'}}
              >
                {inputs}
              </div>
            );
          }}
        </DigitInput>
      </label>
      <p style={{color: 'red'}}>
        {props.attemptsRemaining ? (
          'This pass code was incorrect, please check you have entred exacty the value in your e-mail. You have ' +
          props.attemptsRemaining +
          ' attempts remaining.'
        ) : props.touched && !props.isPassCodeValid ? (
          'This pass code is incorrect, please check you have entered exactly the value in your e-mail.'
        ) : props.rateLimitUntil ? (
          <span>
            You have exceeded the rate limit. You need to wait{' '}
            <CountdownTimer time={props.rateLimitUntil} /> before you can try
            again.
          </span>
        ) : props.error ? (
          props.error.message
        ) : null}
      </p>
      <p>Altenatively you can just click the "Magic" link in the e-mail</p>
      <button
        disabled={
          props.validatingPassCode ||
          !!props.rateLimitUntil ||
          (props.touched && !props.isPassCodeValid)
        }
        type="submit"
      >
        Login
      </button>
    </form>
  );
}
