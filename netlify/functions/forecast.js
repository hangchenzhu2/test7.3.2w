// Netlify Function - 获取天气预报
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

// 检查API密钥是否配置
if (!WEATHER_API_KEY) {
    console.error('❌ 错误：未配置 WEATHER_API_KEY 环境变量');
}

exports.handler = async (event, context) => {
    // 只允许GET请求
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: '方法不允许' })
        };
    }

    // 添加CORS头
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 处理预检请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // 检查API密钥
        if (!WEATHER_API_KEY) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: '服务器配置错误：未配置API密钥' })
            };
        }

        // 获取查询参数
        const { q, days = 7 } = event.queryStringParameters || {};
        
        if (!q) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '缺少位置参数' })
            };
        }

        console.log(`📊 获取预报数据: ${q}, ${days}天`);
        
        // 调用WeatherAPI
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${q}&days=${days}&aqi=yes&alerts=yes`
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('预报API错误:', response.status, errorData);
            
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ 
                    error: `预报API错误: ${response.status} - ${errorData.error?.message || '未知错误'}` 
                })
            };
        }
        
        const data = await response.json();
        console.log(`✅ 成功获取 ${data.location?.name} 的${days}天预报`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('预报错误:', error.message);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 