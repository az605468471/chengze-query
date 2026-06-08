const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const PORT = 10002;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    // 调试日志
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // CORS headers - 允许所有来源
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 解析 URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 默认首页
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // 构建文件路径
    let filePath = path.join(DIST_DIR, pathname);
    
    // 检查文件是否存在
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // 文件不存在，返回 SPA 的 index.html
            filePath = path.join(DIST_DIR, 'index.html');
        }
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('承泽查询系统 - DeFi 安全分析平台');
    console.log('========================================');
    console.log('');
    console.log('✅ 服务器启动成功！');
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`📍 局域网: http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('📋 使用说明：');
    console.log('   1. 打开 Chrome 浏览器');
    console.log('   2. 在地址栏输入: http://localhost:10002');
    console.log('   3. 按回车键访问');
    console.log('');
    console.log('🔧 功能：');
    console.log('   - 输入合约地址');
    console.log('   - 点击"分析"按钮');
    console.log('   - 查看合约信息、持仓分布、流动性数据');
    console.log('');
    console.log('按 Ctrl+C 停止服务器');
    console.log('========================================');
});