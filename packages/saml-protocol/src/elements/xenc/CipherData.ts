import * as t from 'funtypes';
import * as s from '../../utils/schema';

const CipherDataElement = s.element(`xenc:CipherData`, {
  elements: s.oneElement(
    t.Union(
      s.element(`xenc:CipherValue`, {elements: s.oneElement(s.base64Binary)}),
      CipherReferenceElement,
    ),
  ),
});
export default CipherDataElement;
