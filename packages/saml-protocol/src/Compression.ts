import * as zlib from 'zlib';

export async function deflateRaw(input: zlib.InputType): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    zlib.deflateRaw(input, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
