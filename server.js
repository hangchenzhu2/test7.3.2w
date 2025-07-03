const express = require('express');
const path = require('path');

// 加载本地环境变量（仅在本地开发时使用）
try {
    const localEnv = require('./config/env.local.js');
    process.env.WEATHER_API_KEY = process.env.WEATHER_API_KEY || localEnv.WEATHER_API_KEY;
} catch (e) {
    // 如果本地配置文件不存在，使用环境变量或默认值
    console.log('本地环境变量文件不存在，使用系统环境变量');
}

// 使用Node.js内置fetch (Node 18+) 或 node-fetch
let fetch;
try {
    fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
    // 如果node-fetch版本不兼容，使用https模块作为备用
    const https = require('https');
    const http = require('http');
    
    fetch = (url, options = {}) => {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.request(url, {
                method: options.method || 'GET',
                headers: options.headers || {}
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                });
            });
            
            req.on('error', reject);
            req.end();
        });
    };
}

const app = express();
const PORT = 3000;

// API配置 - 密钥存储在后端
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

// 检查API密钥是否配置
if (!WEATHER_API_KEY) {
    console.error('❌ 错误：未配置 WEATHER_API_KEY 环境变量');
    console.error('请参考 SECURITY.md 文件配置API密钥');
    process.exit(1);
}

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname))); // 提供静态文件

// 后端API路由 - 代理天气请求

// 获取当前天气
app.get('/api/current', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: '缺少位置参数' });
        }

        console.log(`🌤️ 获取天气数据: ${q}`);
        
        const response = await fetch(
            `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${q}&aqi=yes`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('WeatherAPI错误:', response.status, errorData);
            throw new Error(`WeatherAPI错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
        }
        
        const data = await response.json();
        console.log(`✅ 成功获取 ${data.location?.name} 的天气数据`);
        res.json(data);
    } catch (error) {
        console.error('API错误:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 获取天气预报
app.get('/api/forecast', async (req, res) => {
    try {
        const { q, days = 7 } = req.query;
        if (!q) {
            return res.status(400).json({ error: '缺少位置参数' });
        }

        console.log(`📊 获取预报数据: ${q}, ${days}天`);
        
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${q}&days=${days}&aqi=yes&alerts=yes`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('预报API错误:', response.status, errorData);
            throw new Error(`预报API错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
        }
        
        const data = await response.json();
        console.log(`✅ 成功获取 ${data.location?.name} 的${days}天预报`);
        res.json(data);
    } catch (error) {
        console.error('预报错误:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 获取天文数据
app.get('/api/astronomy', async (req, res) => {
    try {
        const { q, dt } = req.query;
        if (!q) {
            return res.status(400).json({ error: '缺少位置参数' });
        }

        console.log(`🌙 获取天文数据: ${q}, 日期: ${dt || '今天'}`);
        
        const response = await fetch(
            `${WEATHER_API_BASE}/astronomy.json?key=${WEATHER_API_KEY}&q=${q}&dt=${dt || ''}`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('天文API错误:', response.status, errorData);
            throw new Error(`天文API错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
        }
        
        const data = await response.json();
        console.log(`✅ 成功获取 ${data.location?.name} 的天文数据`);
        res.json(data);
    } catch (error) {
        console.error('天文数据错误:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Weather API backend is running',
        timestamp: new Date().toISOString()
    });
});

// 提供前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌤️ 天气服务器启动成功！`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`🔒 API密钥安全存储在后端`);
}); 