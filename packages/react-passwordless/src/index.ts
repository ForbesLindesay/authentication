import * as React from 'react';
import isEmail from '@authentication/is-email';
import {
  Encoding,
  CreateTokenStatus,
  CreateTokenStatusKind,
} from '@authentication/passwordless/types';
import EmailFormProps from './EmailFormProps';
import PassCodeFormProps from './PassCodeFormProps';
import CountdownTimer from './CountdownTimer';

export {CountdownTimer, EmailFormProps, Encoding};

function isPassCodeValid(
  passCode: string,
  props: {passCodeLength?: number; passCodeEncoding?: Encoding},
): boolean {
  if (
    passCode.length !==
    (props.passCodeLength === undefined ? 6 : props.passCodeLength)
  ) {
    return false;
  }
  switch (props.passCodeEncoding === undefined
    ? Encoding.decimal
    : props.passCodeEncoding) {
    case Encoding.base64:
    case Encoding.base32:
      return /^[A-Za-z0-9]+$/.test(passCode);
    case Encoding.hex:
      return /^[A-Fa-f0-9]+$/.test(passCode);
    case Encoding.decimal:
      return /^[0-9]+$/.test(passCode);
  }
}
export interface Props {
  passCodeLength?: number;
  passCodeEncoding?: Encoding;
  renderEmailForm: (props: EmailFormProps) => React.ReactNode;
  renderPassCodeForm: (props: PassCodeFormProps) => React.ReactNode;
  createToken: (email: string) => Promise<CreateTokenStatus>;
}
export interface State {
  email: string;
  emailTouched: boolean;
  creatingToken: boolean;
  createdToken: boolean;
  passCode: string;
  passCodeTouched: boolean;
  validatingPassCode: boolean;
  rateLimitUntil: null | number;
  attemptsRemaining: null | number;
}
export default class Passwordless extends React.Component<Props, State> {
  state: State = {
    email: '',
    emailTouched: false,
    passCode: '',
    passCodeTouched: false,
    creatingToken: false,
    createdToken: false,
    validatingPassCode: false,
    rateLimitUntil: null,
    attemptsRemaining: null,
  };
  _onEmailBlur = () => {
    this.setState({emailTouched: true});
  };
  _onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({email: e.target.value});
  };
  _onEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEmail(this.state.email)) {
      this.setState({emailTouched: true});
      return;
    }
    if (
      this.state.rateLimitUntil !== null &&
      this.state.rateLimitUntil > Date.now()
    ) {
      return;
    }
    this.setState({emailTouched: true, creatingToken: true});
    this.props.createToken(this.state.email).then((status): true => {
      switch (status.kind) {
        case CreateTokenStatusKind.CreatedToken:
          this.setState({createdToken: true, creatingToken: false});
          return true;
        case CreateTokenStatusKind.InvalidEmail:
          this.setState({createdToken: false, creatingToken: false});
          return true;
        case CreateTokenStatusKind.RateLimitExceeded:
          this.setState({
            createdToken: false,
            creatingToken: false,
            rateLimitUntil: status.nextTokenTimestamp,
          });
          setTimeout(() => {
            this.setState({rateLimitUntil: null});
          }, status.nextTokenTimestamp - Date.now());
          return true;
      }
    });
  };
  _onPassCodeBlur = () => {
    this.setState({passCodeTouched: true});
  };
  _onPassCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({passCode: e.target.value});
  };
  _onPassCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  render() {
    if (!this.state.createdToken) {
      return this.props.renderEmailForm({
        email: this.state.email,
        touched: this.state.emailTouched,
        isEmailValid: isEmail(this.state.email),
        creatingToken: this.state.creatingToken,
        rateLimitUntil: this.state.rateLimitUntil,
        onBlur: this._onEmailBlur,
        onChange: this._onEmailChange,
        onSubmit: this._onEmailSubmit,
      });
    }
    return this.props.renderPassCodeForm({
      passCode: this.state.passCode,
      isPassCodeValid: isPassCodeValid(this.state.passCode, this.props),
      touched: this.state.passCodeTouched,
      validatingPassCode: this.state.validatingPassCode,
      rateLimitUntil: this.state.rateLimitUntil,
      attemptsRemaining: this.state.attemptsRemaining,
      onBlur: this._onPassCodeBlur,
      onChange: this._onPassCodeChange,
      onSubmit: this._onPassCodeSubmit,
    });
  }
}

module.exports = Passwordless;
module.exports.default = Passwordless;
module.exports.CountdownTimer = CountdownTimer;
