import * as crypto from 'crypto';
import * as XmlCrypto from 'xml-crypto';
const thumbprint = require('@auth0/thumbprint');

// const DEFAULT_SIG_ALG = 'rsa-sha256';
// const DEFAULT_DIGEST_ALG = 'sha256';

const algorithms = {
  signature: {
    'rsa-sha256': 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    'rsa-sha1': 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
  },
  digest: {
    sha256: 'http://www.w3.org/2001/04/xmlenc#sha256',
    sha1: 'http://www.w3.org/2000/09/xmldsig#sha1',
  },
} as const;

export type SignatureAlgorithm = keyof typeof algorithms['signature'];
export type DigestAlgorithm = keyof typeof algorithms['digest'];

export function removeCertificateHeaders(cert: string) {
  const pem = /-----BEGIN (\w*)-----([^-]*)-----END (\w*)-----/g.exec(cert);
  if (pem && pem.length > 0) {
    return pem[2].replace(/[\n|\r\n]/g, '');
  }
  return null;
}

export function thumbprintCertificate(pem: string): string {
  const cert = removeCertificateHeaders(pem);
  return thumbprint.calculate(cert).toUpperCase();
}

export function signXml(
  xml: string,
  options: {
    signatureAlgorithm: SignatureAlgorithm;
    digestAlgorithm: DigestAlgorithm;
    key: string;
    cert: string;
    signatureLocationPath: string;
  },
): string {
  var sig = new XmlCrypto.SignedXml(null, {
    signatureAlgorithm: algorithms.signature[options.signatureAlgorithm],
  });

  sig.addReference(
    options.signatureLocationPath,
    [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    algorithms.digest[options.digestAlgorithm],
  );

  sig.signingKey = options.key;

  const pem = removeCertificateHeaders(options.cert);
  sig.keyInfoProvider = {
    getKeyInfo: function () {
      return (
        '<X509Data><X509Certificate>' + pem + '</X509Certificate></X509Data>'
      );
    },
  } as any;

  sig.computeSignature(xml, {
    location: {
      reference: "//*[local-name(.)='Issuer']",
      action: 'after',
    },
  });

  return sig.getSignedXml();
}

export function validateXmlEmbeddedSignature(
  xml: Node,
  options:
    | {
        readonly thumbprints: string[];
        readonly signingCert?: string;
      }
    | {
        readonly thumbprints?: string[];
        readonly signingCert: string;
      },
) {
  var calculatedThumbprint = '';
  // @ts-expect-error XmlCrypto.xpath may select other values
  const signature: string | Node = XmlCrypto.xpath(
    xml,
    "/*/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']",
  )[0];
  if (!signature) {
    return ['Signature is missing'];
  }

  var sig = new XmlCrypto.SignedXml();

  sig.keyInfoProvider = {
    getKeyInfo() {
      return '<X509Data></X509Data>';
    },
    // @ts-expect-error - getKey is actually passed Node[] but the types say it is passed Node | undefined
    getKey(keyInfo?: Node[]): Buffer {
      //If there's no embedded signing cert, use the configured cert through options
      if (!keyInfo?.length) {
        if (!options.signingCert)
          throw new Error(
            'options.signingCert must be specified for SAMLResponses with no embedded signing certificate',
          );
        return Buffer.from(certToPEM(options.signingCert));
      }

      //If there's an embedded signature and thumprints are provided check that
      if (options.thumbprints && options.thumbprints.length > 0) {
        // @ts-expect-error - getElementsByTagNameNS does not always exist?
        var embeddedSignature = keyInfo[0].getElementsByTagNameNS(
          'http://www.w3.org/2000/09/xmldsig#',
          'X509Certificate',
        );
        if (embeddedSignature.length > 0) {
          var base64cer = embeddedSignature[0].firstChild.toString();
          calculatedThumbprint = thumbprint.calculate(base64cer);

          // using embedded cert, so options.signingCert is not used anymore
          // delete options.signingCert;
          return Buffer.from(certToPEM(base64cer));
        }
      }

      // If there's an embedded signature, but no thumprints are supplied, use options.cert
      // either options.cert or options.thumbprints must be specified so at this point there
      // must be an options.cert
      return Buffer.from(certToPEM(options.signingCert!));
    },
  };

  var valid;

  try {
    sig.loadSignature(signature);
    valid = sig.checkSignature(xml.toString());
  } catch (e) {
    return [e];
  }

  if (!valid) {
    return sig.validationErrors;
  }

  if (options.signingCert) {
    return;
  }

  if (options.thumbprints) {
    var valid_thumbprint = options.thumbprints.some(function (thumbprint) {
      return calculatedThumbprint.toUpperCase() === thumbprint.toUpperCase();
    });

    if (!valid_thumbprint) {
      return [
        'Invalid thumbprint (configured: ' +
          options.thumbprints.join(', ').toUpperCase() +
          '. calculated: ' +
          calculatedThumbprint.toUpperCase() +
          ')',
      ];
    }

    return;
  }

  return;
}

export function sign(
  content: string,
  options: {signatureAlgorithm: SignatureAlgorithm; key: string},
) {
  const signer = crypto.createSign(options.signatureAlgorithm.toUpperCase());
  signer.update(content);
  return signer.sign(options.key, 'base64');
}

export function isValidContentAndSignature(
  content: string,
  signature: string,
  options: {signatureAlgorithm: SignatureAlgorithm; signingCert: string},
) {
  var verifier = crypto.createVerify(options.signatureAlgorithm.toUpperCase());
  verifier.update(content);
  return verifier.verify(certToPEM(options.signingCert), signature, 'base64');
}

function certToPEM(cert: string) {
  if (/-----BEGIN CERTIFICATE-----/.test(cert)) {
    return cert;
  }

  const matches = cert.match(/.{1,64}/g);
  if (!matches) throw new Error(`Invalid certificate`);

  return (
    '-----BEGIN CERTIFICATE-----\n' +
    matches.join('\n') +
    '\n-----END CERTIFICATE-----\n'
  );
}
