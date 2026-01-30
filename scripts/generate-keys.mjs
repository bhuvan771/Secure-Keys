/**
 * Helper script to generate encryption keys
 * Run with: node scripts/generate-keys.mjs
 */

import crypto from 'crypto';

console.log('\n🔑 Secer Keys - Secret Key Generator\n');
console.log('Copy these values to your .env file:\n');
console.log('─'.repeat(80));

const encryptionKey = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('\nENCRYPTION_KEY="' + encryptionKey + '"');
console.log('\nSESSION_SECRET="' + sessionSecret + '"');

console.log('\n' + '─'.repeat(80));
console.log('\n⚠️  IMPORTANT: Keep these secrets safe and NEVER commit them to Git!\n');
