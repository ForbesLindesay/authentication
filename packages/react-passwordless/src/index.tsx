import isEmail from '@authentication/is-email';
import {
  ExpiredTokenError,
  IncorrectPassCodeError,
  InvalidEmailError,
  RateLimitExceededError,
  CreateTokenStatus,
  PasswordlessResponseKind,
  VerifyPassCodeStatus,
  Encoding,
} from '@authentication/passwordless/types';
import {useState, useEffect} from 'react';
import getRegExForEncoding from './getRegExForEncoding';

export {
  ExpiredTokenError,
  IncorrectPassCodeError,
  InvalidEmailError,
  RateLimitExceededError,
  CreateTokenStatus,
  PasswordlessResponseKind,
  VerifyPassCodeStatus,
  Encoding,
  isEmail,
};
export function isPassCodeValid(
  passCode: string,
  props: {passCodeLength: number; passCodeEncoding: Encoding},
): boolean {
  if (passCode.length !== props.passCodeLength) {
    return false;
  }
  return getRegExForEncoding(props.passCodeEncoding).test(passCode);
}

export enum PasswordlessStage {
  EnteringEmail = 'entering_email',
  EnteringPassCode = 'entering_passcode',
  VerifiedPassCode = 'verified_passcode',
}

interface EnteringEmailState {
  stage: PasswordlessStage.EnteringEmail;
  email: string;
  emailTouched: boolean;
  submitting: boolean;
  error:
    | null
    | ExpiredTokenError
    | IncorrectPassCodeError
    | InvalidEmailError
    | RateLimitExceededError;
}

export interface EnteringEmail extends EnteringEmailState {
  isEmailValid: boolean;
  onBlur: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onSubmit: (e?: {preventDefault?: () => void}) => Promise<void>;
}

interface EnteringPassCodeState {
  stage: PasswordlessStage.EnteringPassCode;
  email: string;
  tokenID: string;
  passCode: string;
  passCodeTouched: boolean;
  submitting: boolean;
  error: null | IncorrectPassCodeError | RateLimitExceededError;
}

export interface EnteringPassCode extends EnteringPassCodeState {
  acceptedCharacters: RegExp;
  passCodeLength: number;
  passCodeEncoding: Encoding;
  isPassCodeValid: boolean;
  onBlur: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onSubmit: (e?: {preventDefault?: () => void}) => Promise<void>;
}

interface VerifiedPassCodeState {
  stage: PasswordlessStage.VerifiedPassCode;
  userID: string;
  error?: undefined;
}

export interface VerifiedPassCode extends VerifiedPassCodeState {}

type State = EnteringEmailState | EnteringPassCodeState | VerifiedPassCodeState;
const DEFAULT_STATE: EnteringEmailState = {
  stage: PasswordlessStage.EnteringEmail,
  email: '',
  emailTouched: false,
  submitting: false,
  error: null,
};

export interface PasswordlessProps {
  passCodeLength?: number;
  passCodeEncoding?: Encoding;
  createToken: (email: string) => Promise<CreateTokenStatus>;
  verifyPassCode: (params: {
    tokenID: string;
    passCode: string;
  }) => Promise<VerifyPassCodeStatus>;
}
export default function usePasswordless({
  createToken,
  verifyPassCode,
  passCodeLength = 6,
  passCodeEncoding = Encoding.decimal,
}: PasswordlessProps): EnteringEmail | EnteringPassCode | VerifiedPassCode {
  const [state, setState] = useState<State>(() => ({
    ...DEFAULT_STATE,
    error:
      typeof location !== 'undefined' &&
      typeof location.search === 'string' &&
      /err\=EXPIRED_TOKEN/.test(location.search)
        ? {
            kind: PasswordlessResponseKind.ExpiredToken,
            message:
              'This token has expired, please generate a new one and try again.',
          }
        : null,
  }));

  useEffect(() => {
    if (state.error?.kind === PasswordlessResponseKind.RateLimitExceeded) {
      const time = setTimeout(() => {
        setState(
          (s): State => {
            if (s.error) {
              return {...s, error: null};
            }
            return s;
          },
        );
      }, Math.max(100, state.error.nextTokenTimestamp - Date.now()));
      return () => {
        clearTimeout(time);
      };
    }
    return undefined;
  }, [state.error]);

  switch (state.stage) {
    case PasswordlessStage.EnteringEmail:
      return {
        ...state,
        isEmailValid: isEmail(state.email),
        onBlur: () =>
          setState((state) =>
            state.stage === PasswordlessStage.EnteringEmail
              ? {...state, emailTouched: true}
              : state,
          ),
        onChange: (e) => {
          const email = typeof e === 'string' ? e : e.target.value;
          setState((state) =>
            state.stage === PasswordlessStage.EnteringEmail
              ? {...state, email}
              : state,
          );
        },
        onSubmit: async (e): Promise<void> => {
          e?.preventDefault?.();
          if (
            state.stage !== PasswordlessStage.EnteringEmail ||
            state.submitting
          ) {
            return;
          }
          setState((st) =>
            st.stage === PasswordlessStage.EnteringEmail
              ? {...st, submitting: true}
              : st,
          );
          try {
            const result = await createToken(state.email);
            setState(
              (st): State => {
                if (st.stage !== PasswordlessStage.EnteringEmail) {
                  return st;
                }
                if (result.kind === PasswordlessResponseKind.CreatedToken) {
                  return {
                    stage: PasswordlessStage.EnteringPassCode,
                    email: st.email,
                    tokenID: result.tokenID,
                    passCode: '',
                    passCodeTouched: false,
                    submitting: false,
                    error: null,
                  };
                } else {
                  return {
                    ...st,
                    error: result,
                  };
                }
              },
            );
          } finally {
            setState((st) =>
              st.stage === PasswordlessStage.EnteringEmail
                ? {...st, submitting: false}
                : st,
            );
          }
        },
      };
    case PasswordlessStage.EnteringPassCode:
      return {
        ...state,
        acceptedCharacters: getRegExForEncoding(passCodeEncoding),
        isPassCodeValid: isPassCodeValid(state.passCode, {
          passCodeLength,
          passCodeEncoding,
        }),
        passCodeEncoding,
        passCodeLength,
        onBlur: () =>
          setState((state) =>
            state.stage === PasswordlessStage.EnteringPassCode
              ? {...state, passCodeTouched: true}
              : state,
          ),
        onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => {
          const passCode = typeof e === 'string' ? e : e.target.value;
          setState((state) =>
            state.stage === PasswordlessStage.EnteringPassCode
              ? {...state, passCode}
              : state,
          );
        },
        onSubmit: async (e?: {preventDefault?: () => void}) => {
          e?.preventDefault?.();
          if (
            state.stage !== PasswordlessStage.EnteringPassCode ||
            state.submitting
          ) {
            return;
          }
          setState((st) =>
            st.stage === PasswordlessStage.EnteringPassCode
              ? {...st, submitting: true}
              : st,
          );
          try {
            const result = await verifyPassCode({
              tokenID: state.tokenID,
              passCode: state.passCode,
            });
            setState(
              (st): State => {
                if (st.stage !== PasswordlessStage.EnteringPassCode) {
                  return st;
                }
                if (result.kind === PasswordlessResponseKind.VerifiedToken) {
                  return {
                    stage: PasswordlessStage.VerifiedPassCode,
                    userID: result.userID,
                  };
                } else if (
                  result.kind === PasswordlessResponseKind.ExpiredToken ||
                  (result.kind === PasswordlessResponseKind.IncorrectPassCode &&
                    result.attemptsRemaining === 0)
                ) {
                  return {
                    ...DEFAULT_STATE,
                    error: result,
                  };
                } else {
                  return {
                    ...st,
                    error: result,
                  };
                }
              },
            );
          } finally {
            setState((st) =>
              st.stage === PasswordlessStage.EnteringEmail
                ? {...st, submitting: false}
                : st,
            );
          }
        },
      };
    case PasswordlessStage.VerifiedPassCode:
      return state;
  }
}

module.exports = Object.assign(usePasswordless, {
  default: usePasswordless,
  PasswordlessStage,
  PasswordlessResponseKind,
  Encoding,
  isEmail,
  isPassCodeValid,
});
