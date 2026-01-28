// server.js - DeepSeek API 后端服务器

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// DeepSeek API 配置
const API_KEY = '5f9f79b0-77af-428b-8593-89f09ead0b38';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';

// 总结文本的端点
app.post('/api/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: '请提供需要总结的文本内容' });
        }
        
        console.log('收到总结请求，文本长度:', text.length);
        
        // 构建 DeepSeek API 请求
        const response = await axios.post(
            API_URL,
            {
                model: 'deepseek-v3-2-251201',
                stream: true,
                temperature: 0.6,
                input: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'input_text',
                                text: `使用一个金句总结全文最核心的内容：\n\n${text}`
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000, // 60秒超时
                responseType: 'stream'
            }
        );
        
        // 处理流式响应
        res.setHeader('Content-Type', 'text/plain');
        
        let fullResponse = '';
        
        response.data.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            fullResponse += chunkStr;
            
            // 解析流式数据
            const lines = chunkStr.split('\n');
            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    const dataStr = line.substring(6);
                    if (dataStr === '[DONE]') {
                        return;
                    }
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices && data.choices[0] && data.choices[0].delta) {
                            const content = data.choices[0].delta.content;
                            if (content) {
                                res.write(content);
                            }
                        }
                    } catch (error) {
                        console.error('解析流式数据失败:', error);
                    }
                }
            });
        });
        
        response.data.on('end', () => {
            console.log('API 请求完成');
            res.end();
        });
        
        response.data.on('error', (error) => {
            console.error('流式响应错误:', error);
            res.status(500).json({ error: 'API 请求失败' });
        });
        
    } catch (error) {
        console.error('总结请求失败:', error);
        res.status(500).json({ 
            error: '总结请求失败',
            details: error.message 
        });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DeepSeek API 服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
    console.log(`总结端点: http://localhost:${PORT}/api/summarize`);
});

module.exports = app;