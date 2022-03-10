import * as t from 'funtypes';
import * as s from '../../utils/schema';
import TransformElement from '../ds/Transform';

const CipherReferenceElement = s.element(`xenc:CipherReference`, {
  attributes: s.attributes({required: {URI: t.String}}),
  elements: t.Union(
    t.Undefined,
    s.oneElement(
      s.element(`xenc:Transforms`, {
        elements: s.optionalList(TransformElement),
      }),
    ),
  ),
});
export default CipherReferenceElement;
