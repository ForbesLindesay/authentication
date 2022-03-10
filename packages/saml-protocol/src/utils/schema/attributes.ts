import * as t from 'funtypes';

type RecordFields = {
  readonly [_: string]: t.Runtype<unknown>;
};
type RecordStaticType<O extends RecordFields> = {
  readonly [K in keyof O]: t.Static<O[K]>;
};
type PartialRecordStaticType<O extends RecordFields> = {
  readonly [K in keyof O]?: t.Static<O[K]>;
};

export default function attributes<TRequired extends RecordFields>(options: {
  required: TRequired;
  extensible?: boolean;
}): t.Codec<RecordStaticType<TRequired>>;
export default function attributes<TOptional extends RecordFields>(options: {
  optional: TOptional;
  extensible?: boolean;
}): t.Codec<PartialRecordStaticType<TOptional>>;
export default function attributes<
  TRequired extends RecordFields,
  TOptional extends RecordFields,
>(options: {
  required: TRequired;
  optional: TOptional;
  extensible?: boolean;
}): t.Codec<RecordStaticType<TRequired> & PartialRecordStaticType<TOptional>>;
export default function attributes({
  required = {},
  optional = {},
  extensible,
}: {
  required?: RecordFields;
  optional?: RecordFields;
  extensible?: boolean;
}): t.Codec<any> {
  const allowedAttributes = new Set([
    ...Object.keys(required),
    ...Object.keys(optional),
  ]);
  if (Object.keys(required).length === 0) {
    return t
      .Union(
        t.Undefined.withParser({
          parse() {
            return {success: true, value: {}};
          },
        }),
        t.Partial(optional),
      )
      .withConstraint((attributes) => {
        if (!extensible) {
          for (const key of Object.keys(attributes)) {
            if (!allowedAttributes.has(key)) {
              return `Unexpected attribute "${key}". Allowed attributes are: ${[
                ...allowedAttributes,
              ].join(`, `)}`;
            }
          }
        }
        return true;
      }) as any;
  }
  return t
    .Intersect(t.Object(required), t.Partial(optional))
    .withConstraint((attributes) => {
      if (!extensible) {
        for (const key of Object.keys(attributes)) {
          if (!allowedAttributes.has(key)) {
            return `Unexpected attribute "${key}". Allowed attributes are: ${[
              ...allowedAttributes,
            ].join(`, `)}`;
          }
        }
      }
      return true;
    }) as any;
}
