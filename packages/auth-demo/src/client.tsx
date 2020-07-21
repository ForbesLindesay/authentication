import Passwordless from '@authentication/react-passwordless';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import request from 'then-request';

const root = document.getElementById('root')!;
ReactDOM.render(
  <div>
    <ul>
      <li>
        <a href="/__/auth/facebook">Facebook Login</a>
      </li>
      <li>
        <a href="/__/auth/github">GitHub Login</a>
      </li>
      <li>
        <a href="/__/auth/google">Google Login</a>
      </li>
      <li>
        <a href="/__/auth/twitter">Twitter Login</a>
      </li>
    </ul>
    <Passwordless
      createToken={(email) =>
        request('POST', '/__/auth/passwordless/create-token', {json: {email}})
          .getBody('utf8')
          .then(JSON.parse)
      }
      verifyPassCode={({tokenID, passCode}) =>
        request('POST', '/__/auth/passwordless/verify-pass-code', {
          json: {tokenID, passCode},
        })
          .getBody('utf8')
          .then(JSON.parse)
      }
      onPassCodeVerified={(userID) => alert('User ID: ' + userID)}
    />
  </div>,
  root,
);
