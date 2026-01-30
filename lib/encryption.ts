import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Encrypted string in format: salt:iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY is not set in environment variables');
    }

    // Generate a random salt
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from encryption key and salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine salt + iv + authTag + encrypted data
    return [
        salt.toString('hex'),
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted
    ].join(':');
}

/**
 * Decrypts an encrypted string
 * @param encryptedData - The encrypted string in format: salt:iv:authTag:encryptedData
 * @returns Decrypted string
 */
export function decrypt(encryptedData: string): string {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY is not set in environment variables');
    }

    // Split the encrypted data
    const parts = encryptedData.split(':');

    if (parts.length !== 4) {
        throw new Error('Invalid encrypted data format');
    }

    const [saltHex, ivHex, authTagHex, encrypted] = parts;

    // Convert back to buffers
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Derive key from encryption key and salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
