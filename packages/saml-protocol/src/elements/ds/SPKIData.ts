import * as t from 'funtypes';
import * as s from '../../utils/schema';

const SPKIDataElement = s.element(`ds:SPKIData`, {
  elements: s.requiredList(
    t.Union(
      s.element(`ds:SPKISexp`, {elements: s.oneElement(s.base64Binary)}),
      s.unknownElement([`ds`]),
    ),
  ),
});
export default SPKIDataElement;
