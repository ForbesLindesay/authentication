import * as t from 'funtypes';

export interface UnknownElement {
  type: 'unknown_element';
  name: string;
  attributes?: {[key: string]: unknown};
  elements?: unknown[];
}
export default function unknownElement(
  prefix: string,
  namespace: '##any' | '##other',
) {
  const blockedNamespacesSet = new Set(namespace === '##other' ? [prefix] : []);
  const ElementName = t.String.withConstraint(
    (name) => {
      if (!name.includes(`:`)) {
        if (blockedNamespacesSet.has(``)) {
          return `<${name}> is not allowed here because no namespace was specified`;
        } else {
          return true;
        }
      }
      const namespace = name.split(`:`)[0];
      if (blockedNamespacesSet.has(namespace)) {
        return `<${name}> is not allowed here because it is using the namespace ${namespace}`;
      }
      return true;
    },
    {name: `ElementName`},
  );
  return t
    .Object({
      type: t.Literal(`element`),
      name: ElementName,
      attributes: t.Union(t.Undefined, t.Record(t.String, t.Unknown)),
      elements: t.Union(t.Undefined, t.Array(t.Unknown)),
    })
    .withParser<UnknownElement>({
      name: `<AnyElement>`,
      test: t.Object({
        type: t.Literal(`unknown_element`),
        name: ElementName,
        attributes: t.Union(t.Undefined, t.Record(t.String, t.Unknown)),
        elements: t.Union(t.Undefined, t.Array(t.Unknown)),
      }),
      parse(value) {
        return {
          success: true,
          value: {
            type: `unknown_element`,
            name: value.name,
            attributes: value.attributes,
            elements: value.elements,
          },
        };
      },
      serialize(value) {
        return {
          success: true,
          value: {
            type: `element`,
            name: value.name,
            attributes: value.attributes,
            elements: value.elements,
          },
        };
      },
    });
}
