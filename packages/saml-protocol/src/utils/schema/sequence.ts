import * as t from 'funtypes';

export interface Sequence<T> {
  optional<TName extends string, TElement>(
    name: TName,
    codec: t.Codec<TElement>,
  ): Sequence<T & {[k in TName]?: TElement}>;
  required<TName extends string, TElement>(
    name: TName,
    codec: t.Codec<TElement>,
  ): Sequence<T & {[k in TName]: TElement}>;
  optionalList<TName extends string, TElement>(
    name: TName,
    codec: t.Codec<TElement>,
  ): Sequence<T & {[k in TName]: TElement[]}>;
  requiredList<TName extends string, TElement>(
    name: TName,
    codec: t.Codec<TElement>,
  ): Sequence<T & {[k in TName]: TElement[]}>;
  end(): t.Codec<T>;
}
export default function sequence(): Sequence<{}> {
  return innerSequence([]);
}
type SequenceElement =
  | {kind: 'optional'; name: string; codec: t.Codec<any>}
  | {kind: 'required'; name: string; codec: t.Codec<any>}
  | {kind: 'optional_list'; name: string; codec: t.Codec<any>}
  | {kind: 'required_list'; name: string; codec: t.Codec<any>};
function innerSequence(sequenceElements: SequenceElement[]): Sequence<any> {
  return {
    optional(name, codec) {
      return innerSequence([
        ...sequenceElements,
        {kind: 'optional', name, codec},
      ]);
    },
    required(name, codec) {
      return innerSequence([
        ...sequenceElements,
        {kind: 'required', name, codec},
      ]);
    },
    optionalList(name, codec) {
      return innerSequence([
        ...sequenceElements,
        {kind: 'optional_list', name, codec},
      ]);
    },
    requiredList(name, codec) {
      return innerSequence([
        ...sequenceElements,
        {kind: 'required_list', name, codec},
      ]);
    },
    end() {
      t.ParsedValue(t.Union(t.Undefined, t.Array(t.Unknown)), {
        test: t.Intersect(
          t.Object(
            Object.fromEntries(
              sequenceElements
                .filter((e) => e.kind !== 'optional')
                .map((e) => [
                  e.name,
                  e.kind === 'required_list' || e.kind === 'optional_list'
                    ? t.Array(e.codec)
                    : e.codec,
                ]),
            ),
          ),
          t.Partial(
            Object.fromEntries(
              sequenceElements
                .filter((e) => e.kind === 'optional')
                .map((e) => [e.name, e.codec]),
            ),
          ),
        ),
        parse(value = []) {
          const result: any = {};
          for (const e of sequenceElements) {
            if (e.kind === 'optional_list' || e.kind === 'required_list') {
              result[e.name] = [];
            }
          }
          return parseValue(0, 0);
          function parseValue(
            valueIndex: number,
            sequenceIndex: number,
            {
              alternatives = [],
              consumedOne = false,
            }: {
              alternatives?: t.Codec<any>[];
              consumedOne?: boolean;
            } = {},
          ): t.Result<any> {
            if (valueIndex === value.length) {
              for (let i = sequenceIndex; i < sequenceElements.length; i++) {
                if (
                  sequenceElements[i].kind === `required` ||
                  (sequenceElements[i].kind === `required_list` &&
                    !(sequenceIndex === i && consumedOne))
                ) {
                  return {
                    success: false,
                    message: `Missing ${t.showType(sequenceElements[i].codec)}`,
                  };
                }
              }
              return {success: true, value: result};
            }
            if (sequenceIndex === sequenceElements.length) {
              return t
                .Union(...(alternatives as any))
                .safeParse(value[valueIndex]);
            }
            const element = sequenceElements[sequenceIndex];
            const parsedValue = element.codec.safeParse(value[valueIndex]);
            if (parsedValue.success) {
              switch (element.kind) {
                case 'optional':
                case 'required':
                  result[element.name] = parsedValue.value;
                  return parseValue(valueIndex + 1, sequenceIndex + 1);
                case 'optional_list':
                case 'required_list':
                  result[element.name].push(parsedValue.value);
                  return parseValue(valueIndex + 1, sequenceIndex, {
                    consumedOne: true,
                  });
              }
            } else {
              switch (element.kind) {
                case 'optional':
                case 'optional_list':
                  return parseValue(valueIndex, sequenceIndex + 1, {
                    alternatives: [...alternatives, element.codec],
                  });
                case 'required':
                case 'required_list':
                  if (consumedOne && element.kind === 'required_list') {
                    return parseValue(valueIndex, sequenceIndex + 1, {
                      alternatives: [...alternatives, element.codec],
                    });
                  } else {
                    return t
                      .Union(...(alternatives as any))
                      .safeParse(value[valueIndex]);
                  }
              }
            }
          }
        },
        serialize(value) {
          const result = [];
          for (const element of sequenceElements) {
            switch (element.kind) {
              case 'optional':
              case 'required':
                if (value[element.name] !== undefined) {
                  result.push(value[element.name]);
                }
                break;
              case 'optional_list':
              case 'required_list':
                result.push(...value[element.name]);
                break;
            }
          }
          return {success: true, value: result};
        },
      });
      return null as any;
    },
  };
}
