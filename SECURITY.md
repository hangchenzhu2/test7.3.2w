# 🔒 安全配置指南

## API密钥安全存储

### 本地开发环境
1. 复制 `config/env.example.js` 为 `config/env.local.js`
2. 在 `config/env.local.js` 中填入真实的API密钥
3. 确保 `config/env.local.js` 在 `.gitignore` 中（已配置）

### Netlify部署环境
1. 登录Netlify Dashboard
2. 进入 Site Settings → Environment Variables
3. 添加环境变量：
   - Key: `WEATHER_API_KEY`
   - Value: `74c4522dda244d96aee90759252306`

### 安全检查清单
- [ ] `.gitignore` 文件包含敏感文件规则
- [ ] 代码中不包含硬编码的API密钥
- [ ] Netlify环境变量已正确配置
- [ ] 本地环境变量文件未提交到Git

## WeatherAPI.com API密钥管理

当前使用的API密钥：`74c4522dda244d96aee90759252306`

### 获取新的API密钥
1. 访问 https://www.weatherapi.com/
2. 免费注册账号
3. 在Dashboard中获取API密钥
4. 更新环境变量配置

### API使用限制
- 免费版：每月100万次请求
- 如需更多请求，请升级到付费计划 