---
title: Generate PassCode
---

Generate PassCode is a utility to help you generate passwords/passcodes for use in authentication. It uses crypto.randomBytes and then excludes un-wanted characters, to ensure a uniform distribution.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/generate-passcode
```

## Usage

The API is simply `generatePassCode(length: number, encoding: Encoding): Promise<string>`. The encoding defaults to base64 if omitted.

> N.B. `length` is the length of the resulting string, not the number of bytes

```typescript
import generatePassCode, {Encoding} from '@authentication/generate-passcode';

async function run() {
  // a 10 character passcode using characters in a-z, A-Z,
  // 0-9 and some symbols
  console.log('base91: ' + (await generatePassCode(10, Encoding.base91)));
  // a 10 character passcode using characters in a-z, A-Z and 0-9
  console.log('base64: ' + (await generatePassCode(10, Encoding.base64)));
  // a 10 character passcode using characters in a-z, 0-9,
  // excluding i, o, l and s because they may look like numbers/each other
  console.log('base32: ' + (await generatePassCode(10, Encoding.base32)));
  // a 10 character passcode using charactesr in a-f, 0-9
  console.log('hex: ' + (await generatePassCode(10, Encoding.hex)));
  // a 10 character passcode using characters in 0-9
  console.log('decimal: ' + (await generatePassCode(10, Encoding.decimal)));
  // a 10 character passcode using lower case, upper case, numbers and symbols
  // this enforces that at least one of each is included for passcodes
  // over 8 characters. Any of these can be set to `false` to exclude that
  // character set. With all set to `true` it is approximately the same as
  // base91
  console.log(
    'password: ' +
      (await generatePassCode(10, {
        upperCaseLetters: true,
        lowerCaseLetters: true,
        numbers: true,
        symbols: true
      }))
  );
}
run();
```

```javascript
const generatePassCode = require('@authentication/generate-passcode');
const Encoding = generatePassCode.Encoding;

async function run() {
  // a 10 character passcode using characters in a-z, A-Z,
  // 0-9 and some symbols
  console.log('base91: ' + (await generatePassCode(10, Encoding.base91)));
  // a 10 character passcode using characters in a-z, A-Z and 0-9
  console.log('base64: ' + (await generatePassCode(10, Encoding.base64)));
  // a 10 character passcode using characters in a-z, 0-9,
  // excluding i, o, l and s because they may look like numbers/each other
  console.log('base32: ' + (await generatePassCode(10, Encoding.base32)));
  // a 10 character passcode using charactesr in a-f, 0-9
  console.log('hex: ' + (await generatePassCode(10, Encoding.hex)));
  // a 10 character passcode using characters in 0-9
  console.log('decimal: ' + (await generatePassCode(10, Encoding.decimal)));
  // a 10 character passcode using lower case, upper case, numbers and symbols
  // this enforces that at least one of each is included for passcodes
  // over 8 characters. Any of these can be set to `false` to exclude that
  // character set.
  console.log(
    'password: ' +
      (await generatePassCode(10, {
        upperCaseLetters: true,
        lowerCaseLetters: true,
        numbers: true,
        symbols: true
      }))
  );
}
run();
```
