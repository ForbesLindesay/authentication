import assert = require('assert');
import {randomBytes} from 'crypto';
import Encoding from './Encoding';
const base32 = require('base32');

export {Encoding};

export default function generatePassword(
  length: number,
  encoding: Encoding = Encoding.base64,
): Promise<string> {
  function withPrefix(prefix: string): Promise<string> {
    return new Promise<Buffer>((resolve, reject) => {
      randomBytes(length, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    })
      .then((buffer): string => {
        switch (encoding) {
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
    encoding !== Encoding.base64 &&
    encoding !== Encoding.base32 &&
    encoding !== Encoding.hex &&
    encoding !== Encoding.decimal
  ) {
    return Promise.reject(
      new TypeError(
        'Expected encoding to be one of: "base64", "base32", "hex" or "decimal"',
      ),
    );
  }
  return withPrefix('').then(result => {
    assert(result.length === length);
    return result;
  });
}

module.exports = generatePassword;
module.exports.default = generatePassword;
module.exports.Encoding = Encoding;
