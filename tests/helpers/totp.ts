import { createHmac } from 'node:crypto';

/** Independently calculates a standard SHA-1 TOTP from an enrollment URI for local test accounts. */
export function totpFromUri(uri: string, now = Date.now()): string {
  const url = new URL(uri);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = [
    ...url.searchParams.get('secret')!.replace(/=+$/, '').toUpperCase(),
  ]
    .map((character) =>
      alphabet.indexOf(character).toString(2).padStart(5, '0'),
    )
    .join('');
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8)
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(
    BigInt(
      Math.floor(now / 1000 / Number(url.searchParams.get('period') || 30)),
    ),
  );
  const digest = createHmac('sha1', Buffer.from(bytes))
    .update(counter)
    .digest();
  const offset = digest[digest.length - 1] & 15;
  const digits = Number(url.searchParams.get('digits') || 6);
  return String(
    (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits,
  ).padStart(digits, '0');
}
