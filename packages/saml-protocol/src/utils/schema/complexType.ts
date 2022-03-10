import * as t from 'funtypes';
import element, {Element} from './element';

export type ComplexType<
  TAttributes = undefined | {[key: string]: unknown},
  TElements = undefined | unknown[],
> = <TName extends string>(
  name: TName,
) => t.Codec<Element<TName, TAttributes, TElements>>;
export default complexType;

function complexType<TAttributes>(options: {
  attributes: t.Runtype<TAttributes>;
}): ComplexType<TAttributes, undefined>;
function complexType<TElements>(options: {
  elements: t.Runtype<TElements>;
}): ComplexType<undefined, TElements>;
function complexType<TAttributes, TElements>(options: {
  attributes: t.Runtype<TAttributes>;
  elements: t.Runtype<TElements>;
}): ComplexType<TAttributes, TElements>;
function complexType<TAttributes = undefined, TElements = undefined>({
  attributes,
  elements,
}: {
  attributes?: t.Runtype<TAttributes>;
  elements?: t.Runtype<TElements>;
} = {}): ComplexType<TAttributes, TElements> {
  return <TName extends string>(name: TName) =>
    (element as any)(name, {attributes, elements});
}
