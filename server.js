const express = require('express');
const path = require('path');

// 加载本地环境变量（仅在本地开发时使用）
try {
    const localEnv = require('./config/env.local.js');
    process.env.WEATHER_API_KEY = process.env.WEATHER_API_KEY || localEnv.WEATHER_API_KEY;
} catch (e) {
    // 如果本地配置文件不存在，使用环境变量或默认值
    console.log('Local environment file not found, using system environment variables');
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
            console.error('❌ Error: WEATHER_API_KEY environment variable not configured');
        console.error('Please refer to SECURITY.md file to configure API key');
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
            return res.status(400).json({ error: 'Missing location parameter' });
        }

        console.log(`🌤️ Getting weather data: ${q}`);
        
        const response = await fetch(
            `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${q}&aqi=yes`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('WeatherAPI error:', response.status, errorData);
            throw new Error(`WeatherAPI error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log(`✅ Successfully retrieved weather data for ${data.location?.name}`);
        res.json(data);
    } catch (error) {
        console.error('API error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 获取天气预报
app.get('/api/forecast', async (req, res) => {
    try {
        const { q, days = 7 } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Missing location parameter' });
        }

        console.log(`📊 Getting forecast data: ${q}, ${days} days`);
        
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${q}&days=${days}&aqi=yes&alerts=yes`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Forecast API error:', response.status, errorData);
            throw new Error(`Forecast API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log(`✅ Successfully retrieved ${days}-day forecast for ${data.location?.name}`);
        res.json(data);
    } catch (error) {
        console.error('Forecast error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 获取天文数据
app.get('/api/astronomy', async (req, res) => {
    try {
        const { q, dt } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Missing location parameter' });
        }

        console.log(`🌙 Getting astronomy data: ${q}, date: ${dt || 'today'}`);
        
        const response = await fetch(
            `${WEATHER_API_BASE}/astronomy.json?key=${WEATHER_API_KEY}&q=${q}&dt=${dt || ''}`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Astronomy API error:', response.status, errorData);
            throw new Error(`Astronomy API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log(`✅ Successfully retrieved astronomy data for ${data.location?.name}`);
        res.json(data);
    } catch (error) {
        console.error('Astronomy data error:', error.message);
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
    console.log(`🌤️ Weather server started successfully!`);
    console.log(`📍 Access URL: http://localhost:${PORT}`);
    console.log(`🔒 API key securely stored on backend`);
}); 