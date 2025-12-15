#!/usr/bin/env node

/**
 * Generate a bcrypt password hash
 * 
 * Usage:
 *   node scripts/generate-password-hash.js [password]
 * 
 * If no password is provided, you'll be prompted to enter one.
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

async function generateHash(password) {
  if (!password) {
    console.error('❌ Password is required');
    process.exit(1);
  }

  console.log('\n🔐 Generating bcrypt hash...\n');
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('✅ Hash generated successfully!\n');
  console.log('Copy this hash and add it to your .env.local file:\n');
  console.log('CHAT_PASSWORD_HASH=' + hash);
  console.log('\n⚠️  Keep this hash secret! Never commit it to version control.\n');
}

// Check if password was provided as argument
const passwordArg = process.argv[2];

if (passwordArg) {
  generateHash(passwordArg).catch(console.error);
} else {
  // Prompt for password
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter password: ', (password) => {
    rl.close();
    generateHash(password).catch(console.error);
  });
}

