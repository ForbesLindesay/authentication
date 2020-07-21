import * as React from 'react';
import isEmail from '@authentication/is-email';
import {
  Encoding,
  CreateTokenStatus,
  VerifyPassCodeStatus,
  PasswordlessResponseKind,
} from '@authentication/passwordless/types';
import DigitInput, {InputAttributes} from 'react-digit-input';
import DefaultEmailForm from './DefaultEmailForm';
import DefaultPassCodeForm from './DefaultPassCodeForm';
import EmailFormProps from './EmailFormProps';
import PassCodeFormProps from './PassCodeFormProps';
import CountdownTimer from './CountdownTimer';
import getRegExForEncoding from './getRegExForEncoding';

export {
  CountdownTimer,
  DigitInput,
  DefaultEmailForm,
  DefaultPassCodeForm,
  EmailFormProps,
  PassCodeFormProps,
  Encoding,
  getRegExForEncoding,
  InputAttributes,
};

function timeout(fn: () => void, end: number) {
  if (end - Date.now() > 60 * 60 * 1000) {
    setTimeout(() => timeout(fn, end), 60 * 60 * 1000);
  } else {
    setTimeout(fn, end - Date.now());
  }
}

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
  return getRegExForEncoding(props.passCodeEncoding).test(passCode);
}
export interface Props {
  passCodeLength?: number;
  passCodeEncoding?: Encoding;
  renderEmailForm?: (props: EmailFormProps) => React.ReactNode;
  renderPassCodeForm?: (props: PassCodeFormProps) => React.ReactNode;
  createToken: (email: string) => Promise<CreateTokenStatus>;
  verifyPassCode: (opts: {
    tokenID: string;
    passCode: string;
  }) => Promise<VerifyPassCodeStatus>;
  onPassCodeVerified: (userID: string) => void | null | {};
}
export interface State {
  error: null | Error;
  email: string;
  emailTouched: boolean;
  creatingToken: boolean;

  tokenID: string | null;
  passCode: string;
  passCodeTouched: boolean;
  verifyingPassCode: boolean;
  rateLimitUntil: null | number;
  attemptsRemaining: null | number;
  expiredToken: boolean;
}
export default class Passwordless extends React.Component<Props, State> {
  state: State = {
    error: null,
    email: '',
    emailTouched: false,
    tokenID: null,
    passCode: '',
    passCodeTouched: false,
    creatingToken: false,
    verifyingPassCode: false,
    rateLimitUntil: null,
    attemptsRemaining: null,
    expiredToken:
      typeof location !== 'undefined' && typeof location.search === 'string'
        ? /err\=EXPIRED_TOKEN/.test(location.search)
        : false,
  };
  _onEmailBlur = () => {
    this.setState({emailTouched: true});
  };
  _onEmailChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    this.setState({email: typeof e === 'string' ? e : e.target.value});
  };
  _onEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (this.state.creatingToken || this.state.tokenID) {
      return;
    }
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
    this.setState({emailTouched: true, creatingToken: true, error: null});
    this.props.createToken(this.state.email).then(
      (status): true => {
        switch (status.kind) {
          case PasswordlessResponseKind.CreatedToken:
            this.setState({tokenID: status.tokenID, creatingToken: false});
            return true;
          case PasswordlessResponseKind.InvalidEmail:
            this.setState({creatingToken: false});
            return true;
          case PasswordlessResponseKind.RateLimitExceeded:
            this.setState({
              creatingToken: false,
              rateLimitUntil: status.nextTokenTimestamp,
            });

            timeout(() => {
              this.setState({rateLimitUntil: null});
            }, status.nextTokenTimestamp);
            return true;
        }
      },
      (error) => {
        this.setState({creatingToken: false, error});
        setTimeout(() => {
          throw error;
        }, 0);
      },
    );
  };
  _onPassCodeBlur = () => {
    this.setState({passCodeTouched: true});
  };
  _onPassCodeChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const passCode = typeof e === 'string' ? e : e.target.value;
    if (isPassCodeValid(passCode, this.props)) {
      this._verifyPassCode(passCode);
    } else {
      this.setState({passCode});
    }
  };
  _onPassCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPassCodeValid(this.state.passCode, this.props)) {
      this._verifyPassCode(this.state.passCode);
    } else {
      this.setState({passCodeTouched: true});
    }
  };
  _onPassCodeCancel = () => {
    this.setState({
      passCode: '',
      verifyingPassCode: false,
      tokenID: null,
      expiredToken: false,
      attemptsRemaining: null,
    });
  };
  _verifyPassCode(passCode: string) {
    if (this.state.verifyingPassCode || !this.state.tokenID) {
      return;
    }
    this.setState({
      verifyingPassCode: true,
      passCode,
      error: null,
    });
    this.props.verifyPassCode({tokenID: this.state.tokenID, passCode}).then(
      (status) => {
        switch (status.kind) {
          case PasswordlessResponseKind.VerifiedToken:
            this.props.onPassCodeVerified(status.userID);
            return true;
          case PasswordlessResponseKind.ExpiredToken:
            this.setState({
              passCode: '',
              verifyingPassCode: false,
              tokenID: null,
              expiredToken: true,
              attemptsRemaining: null,
            });
            return true;
          case PasswordlessResponseKind.IncorrectPassCode:
            this.setState({
              passCode: '',
              verifyingPassCode: false,
              attemptsRemaining: status.attemptsRemaining,
            });
            return true;
          case PasswordlessResponseKind.RateLimitExceeded:
            this.setState({
              verifyingPassCode: false,
              rateLimitUntil: status.nextTokenTimestamp,
            });
            return true;
        }
      },
      (error) => {
        this.setState({verifyingPassCode: false, error});
        setTimeout(() => {
          throw error;
        }, 0);
      },
    );
  }
  render() {
    if (!this.state.tokenID) {
      return (this.props.renderEmailForm || DefaultEmailForm)({
        error: this.state.error,
        email: this.state.email,
        expiredToken: this.state.expiredToken,
        touched: this.state.emailTouched,
        isEmailValid: isEmail(this.state.email),
        creatingToken: this.state.creatingToken,
        rateLimitUntil: this.state.rateLimitUntil,
        onBlur: this._onEmailBlur,
        onChange: this._onEmailChange,
        onSubmit: this._onEmailSubmit,
      });
    }
    return (this.props.renderPassCodeForm || DefaultPassCodeForm)({
      email: this.state.email,
      error: this.state.error,
      passCode: this.state.passCode,
      passCodeEncoding:
        this.props.passCodeEncoding === undefined
          ? Encoding.decimal
          : this.props.passCodeEncoding,
      passCodeLength: this.props.passCodeLength || 6,
      isPassCodeValid: isPassCodeValid(this.state.passCode, this.props),
      touched: this.state.passCodeTouched,
      validatingPassCode: this.state.verifyingPassCode,
      rateLimitUntil: this.state.rateLimitUntil,
      attemptsRemaining: this.state.attemptsRemaining,
      onBlur: this._onPassCodeBlur,
      onChange: this._onPassCodeChange,
      onSubmit: this._onPassCodeSubmit,
      onCancel: this._onPassCodeCancel,
    });
  }
}

module.exports = Passwordless;
module.exports.default = Passwordless;
module.exports.DefaultEmailForm = DefaultEmailForm;
module.exports.DefaultPassCodeForm = DefaultPassCodeForm;
module.exports.DigitInput = DigitInput;
module.exports.CountdownTimer = CountdownTimer;
module.exports.Encoding = Encoding;
module.exports.getRegExForEncoding = getRegExForEncoding;
