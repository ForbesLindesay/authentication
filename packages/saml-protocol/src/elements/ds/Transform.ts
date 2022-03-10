import * as t from 'funtypes';
import * as s from '../../utils/schema';

const TransformElement = s.element(`ds:Transform`, {
  attributes: s.attributes({
    required: {
      Algorithm: t.String,
    },
  }),
  // <choice minOccurs="0" maxOccurs="unbounded">
  //   <any namespace="##other" processContents="lax"/>
  //   <!-- (1,1) elements from (0,unbounded) namespaces -->
  //   <element name="XPath" type="string"/>
  // </choice>
  elements: s.optionalList(
    t.Union(
      s.element(`ds:XPath`, {elements: s.oneElement(s.textNode)}),
      s.unknownElement([`ds`]),
    ),
  ),
});
export default TransformElement;
