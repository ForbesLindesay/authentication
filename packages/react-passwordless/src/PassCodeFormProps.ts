import * as React from 'react';

export default interface EmailFormProps {
  passCode: string;
  isPassCodeValid: boolean;
  touched: boolean;
  validatingPassCode: boolean;
  rateLimitUntil: null | number;
  attemptsRemaining: null | number;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};
