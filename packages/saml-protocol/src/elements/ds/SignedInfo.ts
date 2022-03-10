import * as t from 'funtypes';
import * as s from '../../utils/schema';
import CanonicalizationMethodElement from './CanonicalizationMethod';
import ReferenceElement from './Reference';
import SignatureMethodElement from './SignatureMethod';

const SignedInfoElement = s.element(`ds:SignedInfo`, {
  attributes: s.attributes({
    optional: {Id: t.String},
  }),
  elements: s
    .sequence()
    .required(`canonicalizationMethod`, CanonicalizationMethodElement)
    .required(`signatureMethod`, SignatureMethodElement)
    .requiredList(`references`, ReferenceElement)
    .end(),
});
export default SignedInfoElement;
