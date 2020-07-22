// @public

import * as React from 'react';
import usePasswordless, {PasswordlessStage, PasswordlessProps} from '.';
import DefaultEmailForm from './DefaultEmailForm';
import DefaultPassCodeForm from './DefaultPassCodeForm';

export default function DefaultForm(props: PasswordlessProps) {
  const passwordless = usePasswordless(props);
  switch (passwordless.stage) {
    case PasswordlessStage.EnteringEmail:
      return <DefaultEmailForm {...passwordless} />;
    case PasswordlessStage.EnteringPassCode:
      return <DefaultPassCodeForm {...passwordless} />;
    case PasswordlessStage.VerifiedPassCode:
      return <p>Authenticated {passwordless.userID}</p>;
  }
}

module.exports = Object.assign(DefaultForm, {
  default: DefaultForm,
});
