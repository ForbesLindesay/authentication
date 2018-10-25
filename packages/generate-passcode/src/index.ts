import assert = require('assert');
import {randomBytes} from 'crypto';
import Encoding from './Encoding';
const base32 = require('base32.js');
const base91 = require('node-base91');

export {Encoding};

export interface CustomSettings {
  lowerCaseLetters: boolean;
  upperCaseLetters: boolean;
  numbers: boolean;
  symbols: boolean;
}

function isCustomEncoding(
  enc: Encoding | CustomSettings,
): enc is CustomSettings {
  return (
    enc &&
    typeof enc === 'object' &&
    typeof enc.lowerCaseLetters === 'boolean' &&
    typeof enc.upperCaseLetters === 'boolean' &&
    typeof enc.numbers === 'boolean' &&
    typeof enc.symbols === 'boolean'
  );
}

export default function generatePassword(
  length: number,
  encoding: Encoding | CustomSettings = Encoding.base64,
): Promise<string> {
  function withPrefix(prefix: string): Promise<string> {
    return new Promise<Buffer>((resolve, reject) => {
      randomBytes(length, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    })
      .then((buffer): string => {
        if (isCustomEncoding(encoding)) {
          let result = base91.encode(buffer);
          if (!encoding.lowerCaseLetters) {
            result = result.replace(/[a-z]/g, '');
          }
          if (!encoding.upperCaseLetters) {
            result = result.replace(/[A-Z]/g, '');
          }
          if (!encoding.numbers) {
            result = result.replace(/[0-9]/g, '');
          }
          if (!encoding.symbols) {
            result = result.replace(/[^a-zA-Z0-9]/g, '');
          }
          return result;
        }
        switch (encoding) {
          case Encoding.base91:
            return base91.encode(buffer);
          case Encoding.base64:
            return buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '');
          case Encoding.base32:
            return base32.encode(buffer);
          case Encoding.hex:
            return buffer.toString('hex');
          case Encoding.decimal:
            return buffer.toString('hex').replace(/[^0-9]/g, '');
        }
      })
      .then(str => {
        assert(typeof str === 'string');
        const result = prefix + str;
        if (result.length < length) {
          return withPrefix(result);
        } else {
          return result.substr(0, length);
        }
      });
  }
  if (
    typeof length !== 'number' ||
    length < 1 ||
    isNaN(length) ||
    length !== (length | 0)
  ) {
    return Promise.reject(
      new TypeError(
        'Expected length to be an integer greater than or equal to 1',
      ),
    );
  }

  if (
    encoding !== Encoding.base91 &&
    encoding !== Encoding.base64 &&
    encoding !== Encoding.base32 &&
    encoding !== Encoding.hex &&
    encoding !== Encoding.decimal &&
    !isCustomEncoding(encoding)
  ) {
    return Promise.reject(
      new TypeError(
        'Expected encoding to be one of: "base64", "base32", "hex", "decimal" or a custom encoding object',
      ),
    );
  }
  function attempt(): Promise<string> {
    return withPrefix('').then(result => {
      if (length > 8 && isCustomEncoding(encoding)) {
        if (encoding.lowerCaseLetters && !/[a-z]/.test(result)) {
          return attempt();
        }
        if (encoding.upperCaseLetters && !/[A-Z]/.test(result)) {
          return attempt();
        }
        if (encoding.numbers && !/[0-9]/.test(result)) {
          return attempt();
        }
        if (encoding.symbols && !/[^a-zA-Z0-9]/.test(result)) {
          return attempt();
        }
      }
      assert(result.length === length);
      return result;
    });
  }
  return attempt();
}

module.exports = generatePassword;
module.exports.default = generatePassword;
module.exports.Encoding = Encoding;
