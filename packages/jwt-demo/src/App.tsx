import React from 'react';

import {
  JsonWebKeyPrivate,
  generatePrivateKey,
  jwtSign,
  getPublicKey,
} from '@authentication/jwt/lib/web';

function App() {
  const [key, setKey] = React.useState<JsonWebKeyPrivate>();
  const [headers, setHeaders] = React.useState('{}');
  const [payload, setPayload] = React.useState('{}');
  const [jwt, setJWT] = React.useState('');
  return (
    <div className="App">
      <h1>Private Key</h1>
      <button
        onClick={async () => {
          setKey(await generatePrivateKey());
        }}
      >
        Generate Key
      </button>
      <pre>
        <code>{JSON.stringify(key)}</code>
      </pre>
      <h1>Public Key</h1>
      <pre>
        <code>{JSON.stringify(key && getPublicKey(key))}</code>
      </pre>

      <h1>Create JWT</h1>
      <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} />
      <textarea value={payload} onChange={(e) => setPayload(e.target.value)} />
      <button
        disabled={!key}
        onClick={async () => {
          if (!key) {
            throw new Error('You need a key before you can do that');
          }
          setJWT(await jwtSign(key, JSON.parse(headers), JSON.parse(payload)));
        }}
      >
        Generate JWT
      </button>
      <pre>
        <code>{jwt}</code>
      </pre>
    </div>
  );
}

export default App;
