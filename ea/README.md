# 交易EA (Expert Advisor)

## 📋 EA配置

### 基础配置
- **交易市场**：加密货币DEX (PancakeSwap BSC)
- **交易对**：ARK/USDT
- **收款钱包**：0x105071cFde8Fbf8D9b2f869409d6380A42037685
- **资金规模**：$100-$1000
- **风险偏好**：稳健型

### EA策略
- **策略类型**：网格交易 + 趋势跟踪
- **核心逻辑**：
  1. 网格交易：在价格区间内自动高抛低吸
  2. 趋势跟踪：突破区间时顺势加仓
  3. 风险控制：止损止盈 + 仓位管理

### 技术栈
- **语言**：Node.js
- **Web3库**：Ethers.js v6
- **链**：BNB Chain (BSC)
- **DEX**：PancakeSwap V2
- **数据源**：BSC RPC + Dexscreener API

## 📁 文件结构

```
ea/
├── README.md           # 说明文档
├── config.js           # 配置文件
├── strategy.js         # 策略逻辑
├── trader.js           # 交易执行
├── monitor.js          # 监控报警
├── backtest.js         # 回测系统
└── main.js             # 主程序入口
```

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置参数
cp config.example.js config.js
# 编辑 config.js 填入你的配置

# 3. 运行EA
node main.js

# 4. 回测策略
node backtest.js
```

## ⚠️ 风险提示

- 加密货币交易风险极高，可能损失全部本金
- EA不保证盈利，历史收益不代表未来表现
- 请用闲钱投资，不要借钱交易
- 建议先用小额资金测试

## 📞 联系方式

- **作者**：MasterD
- **邮箱**：masterd@arkie.ai
- **GitHub**：https://github.com/az605468471/chengze-query