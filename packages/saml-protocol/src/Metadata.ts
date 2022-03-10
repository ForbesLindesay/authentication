import * as XmlBuilder from 'xmlbuilder2';
import {PROTOCOL_BINDING, XMLNS} from './constants';
import {certificateToKeyInfo} from './Certificate';

export interface SpMetadataOptions {
  entity_id: string;
  assert_endpoint: string;
  signing_certificates: string[];
  encryption_certificates: string[];
}

/**
 * Creates metadata and returns it as a string of XML. The metadata has one POST assertion endpoint.
 */
export function createSpMetadata({
  entity_id,
  assert_endpoint,
  signing_certificates,
  encryption_certificates,
}: SpMetadataOptions) {
  const signing_cert_descriptors = signing_certificates.map((c) =>
    certificateToKeyInfo('signing', c),
  );
  const encryption_cert_descriptors = encryption_certificates.map((c) =>
    certificateToKeyInfo('encryption', c),
  );
  XmlBuilder.create({
    'md:EntityDescriptor': {
      '@xmlns:md': XMLNS.MD,
      '@xmlns:ds': XMLNS.DS,
      '@entityID': entity_id,
      '@validUntil': new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      'md:SPSSODescriptor': {
        '@protocolSupportEnumeration': [XMLNS.SAMLP_LEGACY, XMLNS.SAMLP].join(
          ` `,
        ),
        'md:KeyDescriptor': [
          ...signing_cert_descriptors,
          ...encryption_cert_descriptors,
        ],
        'md:SingleLogoutService': {
          '@Binding': PROTOCOL_BINDING.REDIRECT,
          '@Location': assert_endpoint,
        },
        'md:AssertionConsumerService': {
          '@Binding': PROTOCOL_BINDING.POST,
          '@Location': assert_endpoint,
          '@index': '0',
        },
      },
    },
  }).end();
}
