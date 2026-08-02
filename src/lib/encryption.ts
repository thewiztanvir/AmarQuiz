import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a 32-byte key from the ENCRYPTION_KEY using a salt.
 */
function getKey(salt: Buffer): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY environment variable is not set.");
  }
  return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, "sha256");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64 encoded string containing the salt, iv, auth tag, and ciphertext.
 */
export function encryptKey(text: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: salt:iv:tag:encryptedText
  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}

/**
 * Decrypts a base64 encoded string that was encrypted with encryptKey.
 * Expects the string to contain the salt, iv, auth tag, and ciphertext.
 */
export function decryptKey(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, "base64");
  
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = getKey(salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  return decipher.update(encrypted) + decipher.final("utf8");
}
