// Netlify Function - 健康检查
exports.handler = async (event, context) => {
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

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            status: 'ok', 
            message: 'Weather API backend is running on Netlify Functions',
            timestamp: new Date().toISOString()
        })
    };
}; 