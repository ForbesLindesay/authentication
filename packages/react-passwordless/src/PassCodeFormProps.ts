import * as React from 'react';
import {Encoding} from '@authentication/passwordless/types';

export default interface EmailFormProps {
  email: string;
  error: null | Error;
  passCode: string;
  passCodeEncoding: Encoding;
  passCodeLength: number;
  isPassCodeValid: boolean;
  touched: boolean;
  validatingPassCode: boolean;
  rateLimitUntil: null | number;
  attemptsRemaining: null | number;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};
