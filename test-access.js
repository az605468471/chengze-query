#!/usr/bin/env node
// 承泽查询系统 - 本地访问测试脚本
// 请在您的电脑终端运行此脚本

const http = require('http');
const { exec } = require('child_process');

console.log('========================================');
console.log('承泽查询系统 - 本地访问测试');
console.log('========================================');
console.log('');

// 测试本地连接
function testLocalConnection() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:10002', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    success: true,
                    statusCode: res.statusCode,
                    data: data.substring(0, 100)
                });
            });
        });
        
        req.on('error', (err) => {
            resolve({
                success: false,
                error: err.message
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                success: false,
                error: '连接超时'
            });
        });
    });
}

// 主测试函数
async function main() {
    console.log('🔍 正在测试本地连接...');
    console.log('');
    
    const result = await testLocalConnection();
    
    if (result.success) {
        console.log('✅ 本地连接成功！');
        console.log('');
        console.log('📊 服务器状态：');
        console.log(`   - 状态码: ${result.statusCode}`);
        console.log(`   - 响应长度: ${result.data.length} 字符`);
        console.log('');
        console.log('🌐 访问地址：');
        console.log('   http://localhost:10002');
        console.log('');
        console.log('📋 使用说明：');
        console.log('   1. 打开您的电脑浏览器（Chrome/Firefox/Safari）');
        console.log('   2. 在地址栏输入：http://localhost:10002');
        console.log('   3. 按回车键访问');
        console.log('');
        console.log('💡 功能说明：');
        console.log('   - 输入合约地址（如 USDT: 0x55d398326f99059fF775485246999027B3197955）');
        console.log('   - 点击"分析"按钮');
        console.log('   - 查看合约信息、持仓分布、流动性数据');
        console.log('');
        console.log('🔧 故障排除：');
        console.log('   - 如果打不开，请检查防火墙设置');
        console.log('   - 如果页面空白，请清除浏览器缓存');
        console.log('   - 如果连接被拒绝，请重启服务器');
        console.log('');
    } else {
        console.log('❌ 本地连接失败！');
        console.log('');
        console.log('错误信息：', result.error);
        console.log('');
        console.log('🔧 解决方案：');
        console.log('   1. 检查服务器是否运行：');
        console.log('      ps aux | grep node');
        console.log('');
        console.log('   2. 检查端口是否占用：');
        console.log('      netstat -tlnp | grep 10002');
        console.log('');
        console.log('   3. 重启服务器：');
        console.log('      cd /app/workspace/defi-shield/frontend');
        console.log('      kill $(lsof -ti:10002) 2>/dev/null');
        console.log('      node server.cjs');
        console.log('');
        console.log('   4. 检查防火墙设置');
        console.log('');
    }
}

main().catch(console.error);