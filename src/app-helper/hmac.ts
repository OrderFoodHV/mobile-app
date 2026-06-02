/**
 * Pure JavaScript implementation of SHA-256
 */
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = "length";
  let i: number, j: number;
  let result = "";

  const words: number[] = [];
  const asciiLength = ascii[lengthProperty] * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isPrime[i] = 1;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80";
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ""; // Only support ASCII
    words[i >> 2] |= j << (24 - (i % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiLength | 0;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
              (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
              w[i - 7] +
              (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    const a = hash[i];
    result +=
      ((a >>> 24) & 0xff).toString(16).padStart(2, "0") +
      ((a >>> 16) & 0xff).toString(16).padStart(2, "0") +
      ((a >>> 8) & 0xff).toString(16).padStart(2, "0") +
      (a & 0xff).toString(16).padStart(2, "0");
  }
  return result;
}

/**
 * Pure JavaScript HMAC-SHA256 signature generator
 * @param message request body string
 * @param key HMAC Secret Key
 */
export function generateHmacSha256(message: string, key: string): string {
  const blocksize = 64;

  function stringToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }

  function bytesToString(bytes: number[]): string {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return str;
  }

  let keyBytes = stringToBytes(key);

  if (keyBytes.length > blocksize) {
    const keyHex = sha256(bytesToString(keyBytes));
    keyBytes = [];
    for (let i = 0; i < keyHex.length; i += 2) {
      keyBytes.push(parseInt(keyHex.substring(i, i + 2), 16));
    }
  }

  while (keyBytes.length < blocksize) {
    keyBytes.push(0);
  }

  const ipad: number[] = [];
  const opad: number[] = [];
  for (let i = 0; i < blocksize; i++) {
    ipad.push(keyBytes[i] ^ 0x36);
    opad.push(keyBytes[i] ^ 0x5c);
  }

  const innerMessage = bytesToString(ipad) + message;
  const innerHashHex = sha256(innerMessage);

  const innerHashBytes: number[] = [];
  for (let i = 0; i < innerHashHex.length; i += 2) {
    innerHashBytes.push(parseInt(innerHashHex.substring(i, i + 2), 16));
  }

  const outerMessage = bytesToString(opad) + bytesToString(innerHashBytes);
  return sha256(outerMessage);
}
