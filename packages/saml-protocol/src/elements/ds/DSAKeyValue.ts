import * as t from 'funtypes';
import * as s from '../../utils/schema';

function cryptoBinaryElement<TName extends string>(
  name: TName,
): t.Codec<s.Element<`ds:${TName}`, undefined, Buffer>> {
  return s.element(`ds:${name}`, {elements: s.base64Binary});
}
const DSAKeyValueElement = s.element(`ds:DSAKeyValue`, {
  elements: s
    .sequence()
    .optional(`P`, cryptoBinaryElement(`P`))
    .optional(`Q`, cryptoBinaryElement(`Q`))
    .optional(`G`, cryptoBinaryElement(`G`))
    .required(`Y`, cryptoBinaryElement(`Y`))
    .optional(`J`, cryptoBinaryElement(`J`))
    .optional(`Seed`, cryptoBinaryElement(`Seed`))
    .optional(`PgenCounter`, cryptoBinaryElement(`PgenCounter`))
    .end(),
});
export default DSAKeyValueElement;
