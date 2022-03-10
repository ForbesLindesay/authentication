import * as t from 'funtypes';

const textNode = t
  .Named(
    `TextNode`,
    t.Object({
      type: t.Literal(`text`),
      text: t.String,
    }),
  )
  .withParser<string>({
    test: t.String,
    parse(value) {
      return {success: true, value: value.text};
    },
    serialize(value) {
      return {success: true, value: {type: 'text', text: value}};
    },
  });

export default textNode;

export function textNodeOf<T>(schema: t.Codec<T>) {
  return t.ParsedValue<t.Codec<string>, T>(textNode, {
    name: `Node<${t.showType(schema)}>`,
    test: schema,
    parse(value) {
      return schema.safeParse(value);
    },
    serialize(value) {
      const result = schema.safeSerialize(value);
      if (!result.success) return result;
      return t.String.safeParse(result.value);
    },
  });
}
