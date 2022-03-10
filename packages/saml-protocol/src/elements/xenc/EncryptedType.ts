import * as t from 'funtypes';
import * as s from '../../utils/schema';
import KeyInfoElement from '../ds/KeyInfo';
import CipherDataElement from './CipherData';
import EncryptionMethodElement from './EncryptionMethod';

export const EncryptedTypeElements = s
  .sequence()
  .optional(`encryptionMethod`, EncryptionMethodElement)
  .optional(`keyInfo`, KeyInfoElement)
  .required(`cipherData`, CipherDataElement)
  .optional(`encryptionProperties`, EncryptionPropertiesElement);

export const EncryptedTypeAttributes = {
  Id: t.String,
  Type: t.String,
  MimeType: t.String,
  Encoding: t.String,
};
