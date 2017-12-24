import * as React from 'react';

export default interface PassCodeFormPropsEmailFormProps {
  email: string;
  isEmailValid: boolean;
  touched: boolean;
  creatingToken: boolean;
  rateLimitUntil: null | number;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};
