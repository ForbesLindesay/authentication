import * as React from 'react';

export default interface PassCodeFormPropsEmailFormProps {
  error: null | Error;
  email: string;
  expiredToken: boolean;
  isEmailValid: boolean;
  touched: boolean;
  creatingToken: boolean;
  rateLimitUntil: null | number;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};
