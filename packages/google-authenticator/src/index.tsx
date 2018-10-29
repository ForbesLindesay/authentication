import generatePassCode, {Encoding} from '@authentication/generate-passcode';
import {totp, otpauthURL} from 'speakeasy';
import QRCode = require('qrcode');
const svgToDataURL: (svg: string) => string = require('svg-to-dataurl');

/**
 * Generate a base32 encoded secret of 32 bytes
 */
export function generateSecret(): Promise<string> {
  return generatePassCode(32, Encoding.base32);
}

export interface GetQRCodeOptions {
  /**
   * base32 encoded secret
   */
  secret: string;
  /**
   * Used to identify the account with which the secret key is associated,
   * e.g. for an app called "MyApp" and a user with the email "user@example.com":
   *
   * "MyApp:user@example.com"
   */
  label: string;
  /**
   * The provider or service with which the secret key is associated.
   */
  issuer?: string;
}

export function getQRCodeSVG(options: GetQRCodeOptions): Promise<string> {
  const otpAuthURL = otpauthURL({
    encoding: 'base32',
    secret: options.secret,
    label: options.label,
    issuer: options.issuer,
  });

  return new Promise<string>((resolve, reject) => {
    QRCode.toString(otpAuthURL, {type: 'svg'}, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export async function getQRCodeURI(options: GetQRCodeOptions): Promise<string> {
  const svg = await getQRCodeSVG(options);
  return svgToDataURL(svg);
}

export interface VerifyOptions {
  /**
   * base32 encoded secret
   */
  secret: string;
  /**
   * The token to verify
   */
  token: string;
  /**
   * How old is a token allowed to be.
   *
   * This defaults to 1, which allows a token from the previous
   * or next 30 second window. You can set it to 0 to only allow
   * the current window, or to a higher number to be more tollerant
   * of old tokens.
   */
  window?: number;
}

export function verifyToken(options: VerifyOptions) {
  return totp.verify({
    encoding: 'base32',
    window: 1,
    ...options,
  });
}

export interface GenerateTokenOptions {
  /**
   * base32 encoded secret
   */
  secret: string;
}
export function generateToken(options: GenerateTokenOptions) {
  return totp({
    encoding: 'base32',
    ...options,
  });
}
