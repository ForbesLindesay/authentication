import {Encoding} from '@authentication/passwordless/types';

export default function getRegExForEncoding(
  passCodeEncoding: Encoding,
): RegExp {
  switch (passCodeEncoding) {
    case Encoding.base91:
      return /^.+$/;
    case Encoding.base64:
    case Encoding.base32:
      return /^[A-Za-z0-9]+$/;
    case Encoding.hex:
      return /^[A-Fa-f0-9]+$/;
    case Encoding.decimal:
      return /^[0-9]+$/;
  }
}
