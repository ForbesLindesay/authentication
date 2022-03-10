import {randomBytes} from 'crypto';

export default function getRequestId() {
  return `_${randomBytes(21).toString(`hex`)}`;
}
