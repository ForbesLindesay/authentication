import React from 'react';
import {Link, useLocation, Switch, Route} from 'react-router-dom';

import {
  isValidPrivateKey,
  JsonWebKeyPrivate,
  generatePrivateKey,
  jwtSign,
  getPublicKey,
  isValidPublicKey,
  JsonWebKeyPublic,
  jwtVerify,
} from '@authentication/jwt/lib/web';

function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="inline-flex rounded-md shadow">
      <button
        type="button"
        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-indigo-700 bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}

function NavBarLink({to, children}: {to: string; children: React.ReactNode}) {
  const location = useLocation();
  return (
    <Link className="flex justify-center items-center pt-16 pb-3 px-6" to={to}>
      <div
        className={`${
          location.pathname.startsWith(to)
            ? `border-indigo-600`
            : `border-transparent`
        } flex border-b-4 p-2`}
      >
        {children}
      </div>
    </Link>
  );
}

function tryParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch (ex) {
    return undefined;
  }
}
function TextArea({
  value,
  placeholder,
  small,
  onChange,
}: {
  value: string;
  placeholder: string;
  small?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex-grow flex focus-within:shadow-outline border py-3 px-2 rounded-md">
      <textarea
        className={`outline-none flex-grow ${small ? 'h-32' : 'h-64'}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function JwtSign({privateKey}: {privateKey: JsonWebKeyPrivate}) {
  const [headers, setHeaders] = React.useState('{}');
  const [payload, setPayload] = React.useState('{}');
  const [jwt, setJWT] = React.useState('');
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    let cancelled = false;
    const h = tryParse(headers);
    const p = tryParse(payload);
    if (h && p) {
      jwtSign(privateKey, {headers: h as any, payload: p as any}).then(
        (jwt) => {
          if (!cancelled) {
            setJWT(jwt);
            setError('');
          }
        },
        (err) => {
          setJWT('');
          setError(err.message);
        },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [privateKey, headers, payload]);
  return (
    <div>
      <div className="flex mt-6">
        <div className="flex flex-col flex-grow w-0">
          <h2 className="flex items-center text-3xl mb-4">
            Headers
            <div className="flex items-center justify-center py-2 px-3 rounded-lg ml-2 bg-blue-200 text-blue-900 text-base">
              You can normally leave this empty
            </div>
          </h2>
          <TextArea
            small
            placeholder="headers"
            value={headers}
            onChange={(value) => setHeaders(value)}
          />
        </div>
        <div className="w-4" />
        <div className="flex flex-col flex-grow w-0">
          <h2 className="flex items-center text-3xl mb-4">
            Payload
            <div className="flex items-center justify-center py-2 px-3 rounded-lg ml-2 bg-teal-200 text-teal-900 text-base">
              This is the JSON you want to sign
            </div>
          </h2>
          <TextArea
            small
            placeholder="payload"
            value={payload}
            onChange={(value) => setPayload(value)}
          />
        </div>
      </div>
      {(jwt || error) && (
        <pre className="mt-4 flex-grow whitespace-pre-wrap break-all p-2 rounded bg-gray-200">
          {error ? (
            <span className="text-red-800">{error}</span>
          ) : (
            jwt.split('.').map((segment, i) => (
              <React.Fragment key={i}>
                {i === 0 ? '' : '.'}
                <span
                  className={
                    ['text-red-600', 'text-purple-600', 'text-blue-600'][i]
                  }
                >
                  {segment}
                </span>
              </React.Fragment>
            ))
          )}
        </pre>
      )}
    </div>
  );
}

function JwtVerify({publicKey}: {publicKey: JsonWebKeyPublic}) {
  const [jwt, setJWT] = React.useState('');
  const [result, setResult] = React.useState({});
  React.useEffect(() => {
    let cancelled = false;
    jwtVerify(publicKey, jwt).then((result) => {
      if (!cancelled) {
        setResult(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [publicKey, jwt]);
  return (
    <div>
      <h2 className="flex items-center text-3xl mt-6 mb-4">
        Payload
        <div className="flex items-center justify-center py-2 px-3 rounded-lg ml-2 bg-teal-200 text-teal-900 text-base">
          This is the JSON you want to sign
        </div>
      </h2>
      <TextArea
        small
        placeholder="Enter a JSON web token..."
        value={jwt}
        onChange={(value) => setJWT(value)}
      />
      {jwt && (
        <pre className="mt-4 flex-grow whitespace-pre-wrap break-all p-2 rounded bg-gray-200">
          {JSON.stringify(result, null, '  ')}
        </pre>
      )}
    </div>
  );
}

function NavBar() {
  return (
    <nav className="flex">
      <div className="container">
        <div className="flex -ml-6">
          <NavBarLink to="/sign">Signing</NavBarLink>
          <NavBarLink to="/verify">Verifying</NavBarLink>
        </div>
      </div>
    </nav>
  );
}
function App() {
  const [usingExistingPrivateKey, setUsingExistingPrivateKey] = React.useState(
    false,
  );
  const [usingExistingPublicKey, setUsingExistingPublicKey] = React.useState(
    false,
  );
  const [privateKeyString, setPrivateKeyString] = React.useState('');
  const [publicKeyString, setPublicKeyString] = React.useState('');
  const [privateKey, setPrivateKey] = React.useState<JsonWebKeyPrivate>();
  const [publicKey, setPublicKey] = React.useState<JsonWebKeyPublic>();
  return (
    <div className="mb-32">
      <h1 className="container mt-8 text-6xl text-gray-700">
        @authentication - JWT Tools
      </h1>
      <div className="container mt-10">
        <div className="flex">
          <Button
            onClick={async () => {
              setUsingExistingPrivateKey(false);
              setUsingExistingPublicKey(false);
              setPrivateKeyString('');
              setPublicKeyString('');

              const k = await generatePrivateKey();
              setPrivateKey(k);
              setPublicKey(getPublicKey(k));
            }}
          >
            Generate key
          </Button>
          <div className="w-4" />
          <Button
            onClick={() => {
              setUsingExistingPrivateKey(true);
              setUsingExistingPublicKey(false);
              setPrivateKey(undefined);
              setPublicKey(undefined);
              setPrivateKeyString('');
              setPublicKeyString('');
            }}
          >
            Use existing private key
          </Button>
          <div className="w-4" />
          <Button
            onClick={() => {
              setUsingExistingPrivateKey(false);
              setUsingExistingPublicKey(true);
              setPrivateKey(undefined);
              setPublicKey(undefined);
              setPrivateKeyString('');
              setPublicKeyString('');
            }}
          >
            Use existing public key
          </Button>
        </div>
        <div className="flex mt-6">
          <div className="flex flex-col flex-grow w-0">
            <h2 className="flex items-center text-3xl mb-4">
              Private Key
              <div className="flex items-center justify-center py-2 px-3 rounded-lg ml-2 bg-red-200 text-red-900 text-base">
                Keep this private
              </div>
            </h2>
            {usingExistingPrivateKey ? (
              <TextArea
                placeholder="Enter the private key"
                value={privateKeyString}
                onChange={(value) => {
                  setPrivateKeyString(value);
                  const result = tryParse(value);
                  if (isValidPrivateKey(result)) {
                    setPrivateKey(result);
                    setPublicKey(getPublicKey(result));
                  } else {
                    setPrivateKey(undefined);
                    setPublicKey(undefined);
                  }
                }}
              />
            ) : usingExistingPublicKey ? (
              <div className="flex items-center justify-center flex-grow bg-gray-200 h-64 rounded-md">
                <div className="text-lg text-gray-900">
                  No private key available
                </div>
              </div>
            ) : (
              privateKey && (
                <pre className="flex-grow whitespace-pre-wrap break-all p-2 rounded bg-gray-200">
                  {JSON.stringify(privateKey, null, '  ')}
                </pre>
              )
            )}
          </div>
          <div className="w-4" />
          <div className="flex flex-col flex-grow w-0">
            <h2 className="flex items-center text-3xl mb-4">
              Public Key
              <div className="flex items-center justify-center py-2 px-3 rounded-lg ml-2 bg-green-200 text-green-900 text-base">
                You can safely share this
              </div>
            </h2>
            {usingExistingPublicKey ? (
              <TextArea
                placeholder="Enter the public key"
                value={publicKeyString}
                onChange={(value) => {
                  setPublicKeyString(value);
                  const result = tryParse(value);
                  if (isValidPublicKey(result)) {
                    setPublicKey(result);
                  } else {
                    setPublicKey(undefined);
                  }
                }}
              />
            ) : usingExistingPrivateKey && !privateKey ? (
              <div className="flex items-center justify-center flex-grow bg-gray-200 h-64 rounded-md">
                <div className="text-lg text-gray-900">
                  Enter a valid private key
                </div>
              </div>
            ) : (
              privateKey && (
                <pre className="flex-grow whitespace-pre-wrap break-all p-2 rounded bg-gray-200">
                  {JSON.stringify(getPublicKey(privateKey), null, '  ')}
                </pre>
              )
            )}
          </div>
        </div>
      </div>
      <NavBar />
      <div className="container">
        <Switch>
          <Route path="/sign">
            {privateKey ? (
              <JwtSign privateKey={privateKey} />
            ) : (
              <div className="flex items-center justify-center flex-grow bg-gray-200 h-64 rounded-md">
                <div className="text-lg text-gray-900">
                  You need a private key to sign JSON Web Tokens
                </div>
              </div>
            )}
          </Route>
          <Route path="/verify">
            {publicKey ? (
              <JwtVerify publicKey={publicKey} />
            ) : (
              <div className="flex items-center justify-center flex-grow bg-gray-200 h-64 rounded-md">
                <div className="text-lg text-gray-900">
                  You need a public key to verify JSON Web Tokens
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;
