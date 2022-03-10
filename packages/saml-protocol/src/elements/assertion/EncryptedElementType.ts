import * as t from 'funtypes';
import {NameFormat} from '../../constants';
import * as s from '../../utils/schema';

export const EncryptedElementType = s.complexType({
  attributes: s.attributes({
    optional: {
      NameQualifier: t.String,
      SPNameQualifier: t.String,
      Format: t.Enum(`NameFormat`, NameFormat),
      SPProvidedID: t.String,
    },
  }),
  elements: s.oneElement(s.textNode),
});
export default EncryptedElementType;
