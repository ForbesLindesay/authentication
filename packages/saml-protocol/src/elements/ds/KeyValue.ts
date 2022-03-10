import * as t from 'funtypes';
import * as s from '../../utils/schema';
import DSAKeyValueElement from './DSAKeyValue';
import RSAKeyValueElement from './RSAKeyValue';

const KeyValueElement = s.element(`ds:KeyValue`, {
  elements: s.oneElement(
    t.Union(
      DSAKeyValueElement,
      RSAKeyValueElement,
      // TODO: <any namespace="##other" processContents="lax"/>
      s.unknownElement([`ds`]),
    ),
  ),
});
export default KeyValueElement;
