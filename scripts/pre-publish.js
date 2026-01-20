#!/usr/bin/env node
// scripts/pre-publish.js
// Pre-publish checks for oh-my-novel

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const checks = [];
let hasErrors = false;

function check(name, fn) {
  checks.push({ name, fn });
}

function error(msg) {
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
}

// Check 1: package.json validation
check('package.json validation', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  
  if (!pkg.name) error('Missing package name');
  else success(`Package name: ${pkg.name}`);
  
  if (!pkg.version) error('Missing version');
  else success(`Version: ${pkg.version}`);
  
  if (!pkg.description) warn('Missing description');
  else success(`Description: ${pkg.description}`);
  
  if (!pkg.license) warn('Missing license');
  else success(`License: ${pkg.license}`);
  
  if (!pkg.repository) warn('Missing repository');
  else success(`Repository: ${pkg.repository.url}`);
  
  if (!pkg.keywords || pkg.keywords.length === 0) warn('Missing keywords');
  else success(`Keywords: ${pkg.keywords.length} keywords`);
});

// Check 2: Required files
check('Required files', () => {
  const required = ['README.md', 'LICENSE', 'package.json'];
  required.forEach(file => {
    if (existsSync(file)) success(`Found ${file}`);
    else error(`Missing ${file}`);
  });
});

// Check 3: Build output
check('Build output', () => {
  if (!existsSync('dist')) {
    error('dist/ directory not found. Run: bun run build');
    return;
  }
  
  const required = ['dist/index.js', 'dist/agents/index.js', 'dist/tools/index.js'];
  required.forEach(file => {
    if (existsSync(file)) success(`Found ${file}`);
    else error(`Missing ${file}`);
  });
});

// Check 4: bin files
check('Binary files', () => {
  if (!existsSync('bin')) {
    error('bin/ directory not found');
    return;
  }
  
  const binFiles = ['bin/oh-my-novel.js'];
  binFiles.forEach(file => {
    if (existsSync(file)) success(`Found ${file}`);
    else error(`Missing ${file}`);
  });
});

// Check 5: Documentation
check('Documentation', () => {
  const docs = ['README.md', 'AGENTS.md', 'INSTALLATION.md', 'USER_GUIDE.md'];
  docs.forEach(doc => {
    if (existsSync(doc)) success(`Found ${doc}`);
    else warn(`Missing ${doc}`);
  });
});

// Run all checks
console.log('\n🔍 Running pre-publish checks...\n');

for (const { name, fn } of checks) {
  console.log(`\n📋 ${name}`);
  console.log('─'.repeat(50));
  try {
    fn();
  } catch (err) {
    error(`Check failed: ${err.message}`);
  }
}

console.log('\n' + '═'.repeat(50));
if (hasErrors) {
  console.error('\n❌ Pre-publish checks failed! Please fix the errors above.\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! Ready to publish.\n');
  process.exit(0);
}
