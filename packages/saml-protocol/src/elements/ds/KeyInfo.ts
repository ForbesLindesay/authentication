import * as t from 'funtypes';
import * as s from '../../utils/schema';
import KeyValueElement from './KeyValue';
import PGPDataElement from './PGPData';
import RetrievalMethodElement from './RetrievalMethod';
import SPKIDataElement from './SPKIData';
import X509DataElement from './X509Data';

const KeyInfoElement = s.element(`ds:KeyInfo`, {
  attributes: s.attributes({
    optional: {
      Id: t.String,
    },
  }),
  elements: s.requiredList(
    t.Union(
      s.element(`ds:KeyName`, {elements: s.oneElement(s.textNode)}),
      KeyValueElement,
      RetrievalMethodElement,
      X509DataElement,
      PGPDataElement,
      SPKIDataElement,
      s.element(`ds:MgmtData`, {elements: s.oneElement(s.textNode)}),
      // <any processContents="lax" namespace="##other"/>
      s.unknownElement([`ds`]),
    ),
  ),
});
export default KeyInfoElement;
