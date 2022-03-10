import * as t from 'funtypes';

export {default as attributes} from './attributes';
export {default as base64Binary} from './base64Binary';
export {default as complexType} from './complexType';
export {
  default as element,
  choice,
  sequence,
  repeatedElement,
  optionalElement,
  Element,
} from './element';
export {default as integerNode} from './integerNode';
export {default as optionalList} from './optionalList';
export {default as oneElement} from './oneElement';
export {default as requiredList} from './requiredList';
// export {default as sequence} from './sequence';
export {default as textNode, textNodeOf} from './textNode';
export {default as unknownElement} from './unknownElement';

export const anyURISchema = t.Named(`AnyURI`, t.String);
export type anyURI = t.Static<typeof anyURISchema>;

export const IDSchema = t.Named(`ID`, t.String);
export type ID = t.Static<typeof IDSchema>;

export const NCNameSchema = t.Named(`NCName`, t.String);
export type NCName = t.Static<typeof NCNameSchema>;

export const dateTimeSchema = t.String.withParser<Date>({
  name: `DateTime`,
  test: t.Unknown.withConstraint<Date>((value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return `Expected a valid date time`;
    }
    return true;
  }),
  parse(value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return {success: true, value: date};
    } else {
      return {success: false, message: `Expected a valid date time`};
    }
  },
  serialize(date) {
    return {success: true, value: date.toISOString()};
  },
});
export type dateTime = t.Static<typeof dateTimeSchema>;

export const nonNegativeIntegerSchema = t.String.withParser<number>({
  name: `NonNegativeInteger`,
  test: t.Number.withConstraint((value) => {
    if (value === (value | 0) && value >= 0) {
      return `Expected a non negative integer`;
    }
    return true;
  }),
  parse(value) {
    if (/^\d+$/.test(value)) {
      return {success: true, value: parseInt(value, 10)};
    } else {
      return {success: false, message: `Expected a non negative integer`};
    }
  },
  serialize(value) {
    return {success: true, value: value.toString(10)};
  },
});
export type nonNegativeInteger = t.Static<typeof nonNegativeIntegerSchema>;

export const integerSchema = t.String.withParser<number>({
  name: `integer`,
  test: t.Number.withConstraint((value) => {
    if (value === (value | 0)) {
      return `Expected a non negative integer`;
    }
    return true;
  }),
  parse(value) {
    if (/^-?\d+$/.test(value)) {
      return {success: true, value: parseInt(value, 10)};
    } else {
      return {success: false, message: `Expected a non negative integer`};
    }
  },
  serialize(value) {
    return {success: true, value: value.toString(10)};
  },
});
export type integer = t.Static<typeof integerSchema>;

export const booleanSchema = t
  .Union(t.Literal(`true`), t.Literal(`false`))
  .withParser<boolean>({
    name: `Boolean`,
    test: t.Boolean,
    parse(value) {
      return {success: true, value: value === 'true'};
    },
    serialize(value) {
      return {success: true, value: value ? `true` : `false`};
    },
  });
