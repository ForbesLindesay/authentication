import * as React from 'react';
import usePasswordless, {
  PasswordlessStage,
  PasswordlessProps,
  EnteringEmail,
  EnteringPassCode,
  VerifiedPassCode,
  PasswordlessResponseKind,
} from '.';
import DefaultEmailForm from './DefaultEmailForm';
import DefaultPassCodeForm from './DefaultPassCodeForm';

export {
  EnteringEmail,
  EnteringPassCode,
  VerifiedPassCode,
  PasswordlessResponseKind,
};
export interface DefaultFormProps extends PasswordlessProps {
  renderEmailForm?: (
    props: EnteringEmail,
  ) => React.ReactElement<any, any> | null;
  renderPassCodeForm?: (
    props: EnteringPassCode,
  ) => React.ReactElement<any, any> | null;
  renderVerified?: (
    props: VerifiedPassCode,
  ) => React.ReactElement<any, any> | null;
  onPassCodeVerified?: (userID: string) => void;
}
export default function DefaultForm({
  renderEmailForm,
  renderPassCodeForm,
  renderVerified,
  onPassCodeVerified,
  ...passwordlessProps
}: DefaultFormProps) {
  const passwordless = usePasswordless(passwordlessProps);
  React.useEffect(() => {
    if (
      passwordless.stage === PasswordlessStage.VerifiedPassCode &&
      onPassCodeVerified
    ) {
      onPassCodeVerified(passwordless.userID);
    }
  }, [passwordless]);
  switch (passwordless.stage) {
    case PasswordlessStage.EnteringEmail:
      return renderEmailForm ? (
        renderEmailForm(passwordless)
      ) : (
        <DefaultEmailForm {...passwordless} />
      );
    case PasswordlessStage.EnteringPassCode:
      return renderPassCodeForm ? (
        renderPassCodeForm(passwordless)
      ) : (
        <DefaultPassCodeForm {...passwordless} />
      );
    case PasswordlessStage.VerifiedPassCode:
      return renderVerified ? (
        renderVerified(passwordless)
      ) : (
        <p>Authenticated {passwordless.userID}</p>
      );
  }
}

module.exports = Object.assign(DefaultForm, {
  default: DefaultForm,
});
