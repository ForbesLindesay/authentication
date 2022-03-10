import * as t from 'funtypes';
import * as s from '../../utils/schema';
import SignaturePropertyElement from './SignatureProperty';

const SignaturePropertiesElement = s.element(`ds:SignatureProperties`, {
  attributes: s.attributes({
    optional: {Id: t.String},
  }),
  elements: s.requiredList(SignaturePropertyElement),
});
export default SignaturePropertiesElement;
