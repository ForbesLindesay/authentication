import * as t from 'funtypes';
import * as s from '../../utils/schema';
import DigestMethodElement from './DigestMethod';
import DigestValueElement from './DigestValue';
import TransformsElement from './Transforms';

const ReferenceElement = s.element(`ds:Reference`, {
  attributes: s.attributes({
    optional: {
      Id: t.String,
      URI: t.String,
      Type: t.String,
    },
  }),
  elements: s
    .sequence()
    .optional(`transforms`, TransformsElement)
    .required(`digestMethod`, DigestMethodElement)
    .required(`digestValue`, DigestValueElement)
    .end(),
});
export default ReferenceElement;
