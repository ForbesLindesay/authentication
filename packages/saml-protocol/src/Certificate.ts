import {KEY_TYPE, XMLNS} from './constants';

/**
 * Converts a pem certificate to a KeyInfo object for use with XML.
 */
export function certificateToKeyInfo(
  use: 'signing' | 'encryption',
  certificate: string,
) {
  return {
    '@use': use,
    'ds:KeyInfo': {
      '@xmlns:ds': XMLNS.DS,
      'ds:X509Data': {
        'ds:X509Certificate': extractCertificateData(certificate),
      },
    },
  };
}

/**
 * Returns the raw certificate data with all extraneous characters removed.
 */
function extractCertificateData(certificate: string): string {
  const match =
    /-----BEGIN CERTIFICATE-----([^-]*)-----END CERTIFICATE-----/g.exec(
      certificate,
    );
  const cert_data = match ? match[1] : certificate;
  if (!cert_data) {
    throw new Error('Invalid Certificate');
  }
  return cert_data.replace(/[\r\n]/g, '');
}

/**
 * Takes a base64 encoded @key and returns it formatted with newlines and
 * a PEM header according to @type. If it already has a PEM header, it will
 * just return the original key.
 */
export function formatPem(key: string, type: keyof typeof KEY_TYPE) {
  if (/^-----BEGIN [0-9A-Z ]+-----[^-]*-----END [0-9A-Z ]+-----$/g.test(key)) {
    return key;
  }
  return (
    `-----BEGIN ${KEY_TYPE[type]}-----\n` +
    key.match(/.{1,64}/g)!.join('\n') +
    `\n-----END ${KEY_TYPE[type]}-----`
  );
}
