# npm 发布指南

本文档说明如何将 `oh-my-novel` 发布到 npm 注册表。

## 前置要求

1. **npm 账户**

   ```bash
   npm login
   ```

2. **检查包名是否可用**
   ```bash
   npm view oh-my-novel
   ```
   如果包已存在，需要更换名称或联系包所有者。

## 发布步骤

### 1. 构建项目

```bash
npm run build
```

这将编译 TypeScript 代码到 `dist/` 目录。

### 2. 测试包

```bash
npm pack
```

这会创建 `oh-my-novel-1.0.0.tgz` 文件，可以用来测试安装：

```bash
cd /tmp
mkdir test-npm
cd test-npm
npm install ../oh-my-novel-1.0.0.tgz
```

### 3. 发布到 npm

#### 发布公开包

```bash
npm publish
```

#### 发布私有包

```bash
npm publish --access restricted
```

## 发布检查清单

发布前请确认：

- [ ] `package.json` 版本号已更新（遵循语义化版本）
- [ ] `README.md` 已更新，包含清晰的安装和使用说明
- [ ] `LICENSE` 文件存在并正确
- [ ] 所有敏感信息已移除（API keys, tokens, etc.）
- [ ] `.npmignore` 配置正确，不包含不必要的文件
- [ ] 运行 `npm pack` 并检查打包内容
- [ ] 所有必需的文档文件已包含
- [ ] CLI 工具在 `bin` 字段中正确配置
- [ ] `engines` 字段指定了正确的 Node.js 版本

## 发布后验证

发布后，验证包是否可以正常安装：

```bash
npm install oh-my-novel
```

或者测试特定版本：

```bash
npm install oh-my-novel@1.0.0
```

## 版本管理

遵循语义化版本 (Semantic Versioning):

- `1.0.0` → 主版本（不兼容的 API 更改）
- `1.1.0` → 次版本（向后兼容的功能新增）
- `1.1.1` → 修订版本（向后兼容的问题修复）

更新版本号：

```bash
# 主版本
npm version major

# 次版本
npm version minor

# 修订版本
npm version patch

# 预发布版本
npm version prerelease
```

## 撤销发布

### 撤销 72 小时内的发布

```bash
npm unpublish oh-my-novel@1.0.0
```

### 撤销整个包（谨慎！）

```bash
npm unpublish oh-my-novel --force
```

**警告**：npm 只允许在发布后 72 小时内撤销发布。

## 常见问题

### Q: 发布失败，提示包名已存在怎么办？

A: 如果包名已被占用，可以选择：

1. 使用 scoped 包名：`@username/oh-my-novel`
2. 更改包名
3. 联系现有包的所有者

### Q: 如何发布到私有 npm registry？

A: 配置 `.npmrc`：

```ini
registry=https://your-private-registry.com
```

然后正常发布：

```bash
npm publish
```

### Q: 包大小太大怎么办？

A: 检查 `.npmignore` 文件，确保排除了：

- 源代码（`src/` 目录）
- 文档（`*.md` 文件，除了 README.md）
- 测试文件
- 配置文件
- 构建产物（除了 `dist/` 目录）

### Q: 如何更新文档而不发布新版本？

A: 文档随包一起发布。要更新文档：

1. 更新文档文件
2. 重新构建
3. 发布新版本（即使是 patch 版本）

## 相关资源

- [npm 文档](https://docs.npmjs.com/)
- [语义化版本](https://semver.org/)
- [npm 权限管理](https://docs.npmjs.com/cli/v8/using-npm/permissions)
