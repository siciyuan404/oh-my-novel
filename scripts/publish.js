#!/usr/bin/env node
// scripts/publish.js
// Interactive publish script for oh-my-novel

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`❌ Command failed: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
    return null;
  }
}

async function main() {
  console.log('\n🚀 Oh-My-Novel 发布助手\n');
  console.log('═'.repeat(50));
  
  // 1. 检查 npm 登录状态
  console.log('\n📋 步骤 1: 检查 npm 登录状态');
  const username = exec('npm whoami', { silent: true, ignoreError: true });
  if (!username) {
    console.error('❌ 未登录 npm，请先运行: npm login');
    process.exit(1);
  }
  console.log(`✅ 已登录为: ${username.trim()}`);
  
  // 2. 读取当前版本
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  console.log(`\n📦 当前版本: ${pkg.version}`);
  console.log(`📦 包名: ${pkg.name}`);
  
  // 3. 检查包是否已存在
  console.log('\n📋 步骤 2: 检查包是否已发布');
  const existingPkg = exec(`npm view ${pkg.name} version`, { silent: true, ignoreError: true });
  if (existingPkg) {
    console.log(`⚠️  包已存在，当前 npm 版本: ${existingPkg.trim()}`);
  } else {
    console.log('✅ 包名可用，这是首次发布');
  }
  
  // 4. 询问发布类型
  console.log('\n📋 步骤 3: 选择发布类型');
  console.log('1. 发布 beta 版本（推荐首次发布）');
  console.log('2. 发布正式版本');
  console.log('3. 取消发布');
  
  const choice = await question('\n请选择 (1/2/3): ');
  
  if (choice === '3') {
    console.log('\n❌ 已取消发布');
    rl.close();
    return;
  }
  
  // 5. 确认发布
  console.log('\n📋 步骤 4: 确认发布');
  if (choice === '1') {
    console.log('将发布 beta 版本: oh-my-novel@beta');
  } else {
    console.log('将发布正式版本: oh-my-novel@latest');
  }
  
  const confirm = await question('\n确认发布？(y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('\n❌ 已取消发布');
    rl.close();
    return;
  }
  
  // 6. 执行发布
  console.log('\n📋 步骤 5: 开始发布...\n');
  console.log('═'.repeat(50));
  
  try {
    if (choice === '1') {
      // 发布 beta
      console.log('\n📦 发布 beta 版本...');
      exec('npm publish --tag beta');
      console.log('\n✅ Beta 版本发布成功！');
      console.log('\n测试安装命令:');
      console.log(`  npm install -g ${pkg.name}@beta`);
      console.log(`  bunx ${pkg.name} doctor`);
    } else {
      // 发布正式版
      console.log('\n📦 发布正式版本...');
      exec('npm publish');
      console.log('\n✅ 正式版本发布成功！');
      console.log('\n安装命令:');
      console.log(`  npm install -g ${pkg.name}`);
      console.log(`  bunx ${pkg.name} doctor`);
    }
    
    console.log('\n📊 查看包信息:');
    console.log(`  npm view ${pkg.name}`);
    console.log(`  https://www.npmjs.com/package/${pkg.name}`);
    
    console.log('\n🎉 发布完成！');
    
  } catch (error) {
    console.error('\n❌ 发布失败:', error.message);
    process.exit(1);
  }
  
  rl.close();
}

main().catch(error => {
  console.error('❌ 错误:', error);
  process.exit(1);
});
