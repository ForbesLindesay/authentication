import {randomBytes} from 'crypto';

export default function getUID(count: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    randomBytes(count, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString('base64').replace(/[^a-zA-Z0-9]/g, ''));
      }
    });
  }).then(str => {
    if (str.length >= count) {
      return str.substr(0, count);
    } else {
      return getUID(count - str.length).then(extra => str + extra);
    }
  });
}
