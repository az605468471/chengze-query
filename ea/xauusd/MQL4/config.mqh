//+------------------------------------------------------------------+
//|                                               config.mqh |
//|                                    XAUUSD EA Configuration |
//|                                          Author: MasterD |
//+------------------------------------------------------------------+
#ifndef CONFIG_MQH
#define CONFIG_MQH

//+------------------------------------------------------------------+
//| 基础配置                                                          |
//+------------------------------------------------------------------+

// 交易品种
input string   Symbol_Trade    = "XAUUSD";        // 交易品种
input ENUM_TIMEFRAMES Timeframe = PERIOD_H1;       // 时间周期

//+------------------------------------------------------------------+
//| 资金管理                                                          |
//+------------------------------------------------------------------+

input double   LotSize         = 0.01;            // 基础手数
input double   RiskPercent     = 2.0;             // 单笔风险(%)
input double   MaxDrawdown     = 10.0;            // 最大回撤(%)
input double   MinLots         = 0.01;            // 最小手数
input double   MaxLots         = 1.0;             // 最大手数

//+------------------------------------------------------------------+
//| 止损止盈                                                          |
//+------------------------------------------------------------------+

input int      TakeProfit      = 100;             // 止盈点数
input int      StopLoss        = 50;              // 止损点数
input int      TrailingStop    = 30;              // 移动止损点数
input int      TrailingStep    = 10;              // 移动止损步长
input bool     UseTrailingStop = true;            // 启用移动止损

//+------------------------------------------------------------------+
//| 策略参数                                                          |
//+------------------------------------------------------------------+

// EMA均线参数
input int      EMA_Fast        = 20;              // 快速EMA周期
input int      EMA_Medium      = 50;              // 中速EMA周期
input int      EMA_Slow        = 200;             // 慢速EMA周期

// RSI参数
input int      RSI_Period      = 14;              // RSI周期
input double   RSI_Overbought  = 70;              // RSI超买
input double   RSI_Oversold    = 30;              // RSI超卖

// MACD参数
input int      MACD_Fast       = 12;              // MACD快线
input int      MACD_Slow       = 26;              // MACD慢线
input int      MACD_Signal     = 9;               // MACD信号线

// ATR参数
input int      ATR_Period      = 14;              // ATR周期
input double   ATR_Multiplier  = 1.5;             // ATR倍数

//+------------------------------------------------------------------+
//| 交易控制                                                          |
//+------------------------------------------------------------------+

input int      MaxPositions    = 2;               // 最大持仓数
input int      MagicNumber     = 20260609;        // EA魔术数字
input int      Slippage        = 30;              // 最大滑点
input int      MaxSpread       = 50;              // 最大点差

//+------------------------------------------------------------------+
//| 交易时间                                                          |
//+------------------------------------------------------------------+

input int      TradeStartHour  = 15;              // 开始时间(北京时间)
input int      TradeEndHour    = 24;              // 结束时间(北京时间)
input bool     AvoidNews       = true;            // 避开重大数据
input bool     TradeMonday     = true;            // 周一交易
input bool     TradeFriday     = true;            // 周五交易

//+------------------------------------------------------------------+
//| 报警设置                                                          |
//+------------------------------------------------------------------+

input bool     AlertOpen       = true;            // 开仓报警
input bool     AlertClose      = true;            // 平仓报警
input bool     AlertProfit     = true;            // 盈利报警
input bool     AlertLoss       = true;            // 亏损报警
input double   AlertAmount     = 100;             // 报警金额阈值

//+------------------------------------------------------------------+
//| 其他设置                                                          |
//+------------------------------------------------------------------+

input bool     TradeOnNewBar   = true;            // 仅新K线开仓
input bool     CloseOnReverse  = true;            // 反向信号平仓
input bool     UseBreakeven    = true;            // 启用保本止损
input int      BreakevenStart  = 30;              // 保本止损启动点数
input int      BreakevenProfit = 10;              // 保本止损盈利点数

//+------------------------------------------------------------------+
#endif