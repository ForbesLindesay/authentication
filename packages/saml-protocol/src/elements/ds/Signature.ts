import * as t from 'funtypes';
import * as s from '../../utils/schema';
import KeyInfoElement from './KeyInfo';
import ObjectElement from './Object';
import SignatureValueElement from './SignatureValue';
import SignedInfoElement from './SignedInfo';

const SignatureElement = s.element(`ds:Signature`, {
  attributes: s.attributes({
    optional: {Id: t.String},
  }),
  elements: s
    .sequence()
    .required(`signedInfo`, SignedInfoElement)
    .required(`signatureValue`, SignatureValueElement)
    .optional(`keyInfo`, KeyInfoElement)
    .optional(`object`, ObjectElement)
    .end(),
});
export default SignatureElement;
