#!/usr/bin/env node
/**
 * Script to verify Prisma binary is generated
 * This is run after prisma generate to verify the binary exists
 */

const fs = require('fs');
const path = require('path');

const prismaOutputPath = path.join(__dirname, '../node_modules/.prisma/client');
const binaryNames = [
  'libquery_engine-rhel-openssl-3.0.x.so.node',
  'libquery_engine-debian-openssl-3.0.x.so.node',
  'query-engine-rhel-openssl-3.0.x',
];

let foundBinary = null;
for (const binaryName of binaryNames) {
  const binaryPath = path.join(prismaOutputPath, binaryName);
  if (fs.existsSync(binaryPath)) {
    foundBinary = { name: binaryName, path: binaryPath };
    break;
  }
}

if (foundBinary) {
  const size = fs.statSync(foundBinary.path).size;
  console.log(`✅ Prisma binary found: ${foundBinary.name}`);
  console.log(`   Path: ${foundBinary.path}`);
  console.log(`   Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.warn(`⚠️  Prisma binary not found in ${prismaOutputPath}`);
  console.warn('   This may cause issues on Vercel. Checking if binaries exist...');
  if (fs.existsSync(prismaOutputPath)) {
    const files = fs.readdirSync(prismaOutputPath).filter(f => f.includes('query_engine') || f.includes('.node'));
    if (files.length > 0) {
      console.warn(`   Found these files: ${files.join(', ')}`);
    }
  }
  // Don't exit with error - let the build continue and see if it works
}

