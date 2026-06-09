//+------------------------------------------------------------------+
//|                                               XAUUSD_EA.mq4     |
//|                                    XAUUSD 超级交易EA            |
//|                                          Author: MasterD        |
//|                                          Target: 月化20%+       |
//|                                          Features: 自动优化     |
//+------------------------------------------------------------------+
#property copyright "MasterD"
#property link      "https://github.com/az605468471/chengze-query"
#property version   "2.00"
#property strict

//+------------------------------------------------------------------+
//| 包含文件                                                          |
//+------------------------------------------------------------------+
#include "config.mqh"
#include "strategy.mqh"
#include "risk.mqh"
#include "optimizer.mqh"
#include "utils.mqh"

//+------------------------------------------------------------------+
//| 全局变量                                                          |
//+------------------------------------------------------------------+

// 策略实例
CStrategy*      g_strategy;
CRiskManager*   g_riskManager;
COptimizer*     g_optimizer;
CUtils*         g_utils;

// 状态变量
bool            g_isInitialized = false;
datetime        g_lastBarTime = 0;
int             g_tradeCount = 0;
double          g_initialBalance = 0;

// 性能统计
double          g_totalProfit = 0;
double          g_maxDrawdown = 0;
int             g_winCount = 0;
int             g_lossCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                    |
//+------------------------------------------------------------------+
int OnInit()
{
   // 初始化组件
   g_strategy = new CStrategy();
   g_riskManager = new CRiskManager();
   g_optimizer = new COptimizer();
   g_utils = new CUtils();

   // 初始化策略
   if (!g_strategy.Init(Symbol_Trade, Timeframe))
   {
      Print("❌ 策略初始化失败");
      return INIT_FAILED;
   }

   // 初始化风险管理
   if (!g_riskManager.Init(AccountBalance(), RiskPercent, MaxDrawdown))
   {
      Print("❌ 风险管理初始化失败");
      return INIT_FAILED;
   }

   // 初始化优化器
   if (!g_optimizer.Init(Symbol_Trade, Timeframe))
   {
      Print("❌ 优化器初始化失败");
      return INIT_FAILED;
   }

   // 记录初始资金
   g_initialBalance = AccountBalance();

   g_isInitialized = true;
   Print("✅ XAUUSD EA 初始化成功");
   Print("📊 目标月化收益：20%+");
   Print("🔧 自动优化：已启用");
   Print("💰 初始资金：$", g_initialBalance);

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                  |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // 清理资源
   if (g_strategy != NULL) delete g_strategy;
   if (g_riskManager != NULL) delete g_riskManager;
   if (g_optimizer != NULL) delete g_optimizer;
   if (g_utils != NULL) delete g_utils;

   Print("📊 EA已停止，总交易次数：", g_tradeCount);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick()
{
   if (!g_isInitialized) return;

   // 检查是否新K线
   bool isNewBar = IsNewBar();

   // 更新风险管理器状态
   g_riskManager.Update(AccountEquity(), AccountBalance());

   // 检查是否需要自动优化
   if (g_optimizer.ShouldOptimize())
   {
      Print("🔧 启动自动优化...");
      g_optimizer.Optimize();
      Print("✅ 优化完成");
   }

   // 检查交易时间
   if (!IsTradeTime()) return;

   // 检查点差
   if (MarketInfo(Symbol_Trade, MODE_SPREAD) > MaxSpread) return;

   // 仅在新K线开仓（避免重复信号）
   if (TradeOnNewBar && !isNewBar) return;

   // 获取交易信号
   int signal = g_strategy.GetSignal();

   // 处理信号
   if (signal != 0)
   {
      ProcessSignal(signal);
   }

   // 管理持仓
   ManagePositions();
}

//+------------------------------------------------------------------+
//| 处理交易信号                                                      |
//+------------------------------------------------------------------+
void ProcessSignal(int signal)
{
   // 检查最大持仓数
   if (CountPositions() >= MaxPositions) return;

   // 检查风险管理
   if (!g_riskManager.CanTrade()) return;

   // 计算手数
   double lots = CalculateLots();

   // 计算止损止盈
   double sl, tp;
   CalculateSLTP(signal, sl, tp);

   // 执行交易
   if (signal == 1) // 买入
   {
      if (AlertOpen) Alert("📈 XAUUSD 买入信号");
      OpenBuy(lots, sl, tp);
   }
   else if (signal == -1) // 卖出
   {
      if (AlertOpen) Alert("📉 XAUUSD 卖出信号");
      OpenSell(lots, sl, tp);
   }
}

//+------------------------------------------------------------------+
//| 开多单                                                            |
//+------------------------------------------------------------------+
void OpenBuy(double lots, double sl, double tp)
{
   int ticket = OrderSend(
      Symbol_Trade,
      OP_BUY,
      lots,
      Ask,
      Slippage,
      sl,
      tp,
      "XAUUSD EA Buy",
      MagicNumber,
      0,
      clrGreen
   );

   if (ticket > 0)
   {
      g_tradeCount++;
      Print("✅ 开多成功：Ticket=", ticket, " 手数=", lots);
   }
   else
   {
      Print("❌ 开多失败：", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| 开空单                                                            |
//+------------------------------------------------------------------+
void OpenSell(double lots, double sl, double tp)
{
   int ticket = OrderSend(
      Symbol_Trade,
      OP_SELL,
      lots,
      Bid,
      Slippage,
      sl,
      tp,
      "XAUUSD EA Sell",
      MagicNumber,
      0,
      clrRed
   );

   if (ticket > 0)
   {
      g_tradeCount++;
      Print("✅ 开空成功：Ticket=", ticket, " 手数=", lots);
   }
   else
   {
      Print("❌ 开空失败：", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| 管理持仓                                                          |
//+------------------------------------------------------------------+
void ManagePositions()
{
   for (int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if (OrderMagicNumber() == MagicNumber)
         {
            // 移动止损
            if (UseTrailingStop)
            {
               ApplyTrailingStop();
            }

            // 保本止损
            if (UseBreakeven)
            {
               ApplyBreakeven();
            }

            // 检查反向信号平仓
            if (CloseOnReverse)
            {
               CheckReverseClose();
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 移动止损                                                          |
//+------------------------------------------------------------------+
void ApplyTrailingStop()
{
   if (OrderType() == OP_BUY)
   {
      double newSL = Bid - TrailingStop * Point;
      if (Bid - OrderOpenPrice() > TrailingStop * Point)
      {
         if (OrderStopLoss() < newSL || OrderStopLoss() == 0)
         {
            bool result = OrderModify(OrderTicket(), OrderOpenPrice(), newSL, OrderTakeProfit(), 0, clrGreen);
            if (result) Print("✅ 移动止损更新：", newSL);
         }
      }
   }
   else if (OrderType() == OP_SELL)
   {
      double newSL = Ask + TrailingStop * Point;
      if (OrderOpenPrice() - Ask > TrailingStop * Point)
      {
         if (OrderStopLoss() > newSL || OrderStopLoss() == 0)
         {
            bool result = OrderModify(OrderTicket(), OrderOpenPrice(), newSL, OrderTakeProfit(), 0, clrRed);
            if (result) Print("✅ 移动止损更新：", newSL);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 保本止损                                                          |
//+------------------------------------------------------------------+
void ApplyBreakeven()
{
   if (OrderType() == OP_BUY)
   {
      if (Bid - OrderOpenPrice() > BreakevenStart * Point)
      {
         double newSL = OrderOpenPrice() + BreakevenProfit * Point;
         if (OrderStopLoss() < newSL)
         {
            bool result = OrderModify(OrderTicket(), OrderOpenPrice(), newSL, OrderTakeProfit(), 0, clrGreen);
            if (result) Print("✅ 保本止损设置：", newSL);
         }
      }
   }
   else if (OrderType() == OP_SELL)
   {
      if (OrderOpenPrice() - Ask > BreakevenStart * Point)
      {
         double newSL = OrderOpenPrice() - BreakevenProfit * Point;
         if (OrderStopLoss() > newSL || OrderStopLoss() == 0)
         {
            bool result = OrderModify(OrderTicket(), OrderOpenPrice(), newSL, OrderTakeProfit(), 0, clrRed);
            if (result) Print("✅ 保本止损设置：", newSL);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 检查反向信号平仓                                                  |
//+------------------------------------------------------------------+
void CheckReverseClose()
{
   int signal = g_strategy.GetSignal();

   if (OrderType() == OP_BUY && signal == -1)
   {
      ClosePosition();
      if (AlertClose) Alert("🔄 反向信号平多");
   }
   else if (OrderType() == OP_SELL && signal == 1)
   {
      ClosePosition();
      if (AlertClose) Alert("🔄 反向信号平空");
   }
}

//+------------------------------------------------------------------+
//| 平仓                                                              |
//+------------------------------------------------------------------+
void ClosePosition()
{
   if (OrderType() == OP_BUY)
   {
      bool result = OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrYellow);
      if (result)
      {
         double profit = OrderProfit() + OrderSwap() + OrderCommission();
         g_totalProfit += profit;
         if (profit > 0) g_winCount++; else g_lossCount++;
         Print("✅ 平多成功：盈亏=", profit);
      }
   }
   else if (OrderType() == OP_SELL)
   {
      bool result = OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrYellow);
      if (result)
      {
         double profit = OrderProfit() + OrderSwap() + OrderCommission();
         g_totalProfit += profit;
         if (profit > 0) g_winCount++; else g_lossCount++;
         Print("✅ 平空成功：盈亏=", profit);
      }
   }
}

//+------------------------------------------------------------------+
//| 计算手数                                                          |
//+------------------------------------------------------------------+
double CalculateLots()
{
   double lots = g_riskManager.CalculateLotSize(
      Symbol_Trade,
      StopLoss,
      LotSize,
      MinLots,
      MaxLots
   );

   return lots;
}

//+------------------------------------------------------------------+
//| 计算止损止盈                                                      |
//+------------------------------------------------------------------+
void CalculateSLTP(int signal, double &sl, double &tp)
{
   double atr = iATR(Symbol_Trade, Timeframe, ATR_Period, 0);

   if (signal == 1) // 买入
   {
      sl = Ask - atr * ATR_Multiplier;
      tp = Ask + atr * ATR_Multiplier * 2; // 盈亏比1:2
   }
   else if (signal == -1) // 卖出
   {
      sl = Bid + atr * ATR_Multiplier;
      tp = Bid - atr * ATR_Multiplier * 2; // 盈亏比1:2
   }
}

//+------------------------------------------------------------------+
//| 统计持仓数                                                        |
//+------------------------------------------------------------------+
int CountPositions()
{
   int count = 0;
   for (int i = 0; i < OrdersTotal(); i++)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if (OrderMagicNumber() == MagicNumber)
         {
            count++;
         }
      }
   }
   return count;
}

//+------------------------------------------------------------------+
//| 检查新K线                                                         |
//+------------------------------------------------------------------+
bool IsNewBar()
{
   datetime currentBarTime = iTime(Symbol_Trade, Timeframe, 0);
   if (currentBarTime != g_lastBarTime)
   {
      g_lastBarTime = currentBarTime;
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| 检查交易时间                                                      |
//+------------------------------------------------------------------+
bool IsTradeTime()
{
   int hour = Hour();

   // 转换为北京时间（GMT+8）
   int beijingHour = (hour + 8) % 24;

   // 检查是否在交易时间范围内
   if (beijingHour < TradeStartHour || beijingHour >= TradeEndHour)
   {
      return false;
   }

   // 检查周一周五
   if (DayOfWeek() == 1 && !TradeMonday) return false;
   if (DayOfWeek() == 5 && !TradeFriday) return false;

   return true;
}

//+------------------------------------------------------------------+
//| 自定义函数                                                        |
//+------------------------------------------------------------------+

// 获取EA状态
string GetEAStatus()
{
   string status = "";
   status += "📊 XAUUSD EA 状态\n";
   status += "==================\n";
   status += "💰 账户余额：$" + DoubleToString(AccountBalance(), 2) + "\n";
   status += "📈 净值：$" + DoubleToString(AccountEquity(), 2) + "\n";
   status += "📊 总盈亏：$" + DoubleToString(g_totalProfit, 2) + "\n";
   status += "🎯 胜率：";
   if (g_winCount + g_lossCount > 0)
   {
      double winRate = (double)g_winCount / (g_winCount + g_lossCount) * 100;
      status += DoubleToString(winRate, 1) + "%\n";
   }
   else
   {
      status += "N/A\n";
   }
   status += "📝 总交易次数：" + IntegerToString(g_tradeCount) + "\n";
   status += "🔧 自动优化：" + (g_optimizer.IsOptimizing() ? "进行中" : "已完成") + "\n";

   return status;
}

// 打印状态
void PrintStatus()
{
   Print(GetEAStatus());
}

//+------------------------------------------------------------------+