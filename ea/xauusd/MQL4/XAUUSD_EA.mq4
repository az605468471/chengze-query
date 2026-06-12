//+------------------------------------------------------------------+
//|                                               XAUUSD_EA.mq4     |
//|                                    XAUUSD 超级交易EA            |
//|                                          Author: MasterD        |
//+------------------------------------------------------------------+
#property copyright "MasterD"
#property link      "https://github.com/az605468471/chengze-query"
#property version   "2.00"
#property strict

//+------------------------------------------------------------------+
//| 基础配置                                                          |
//+------------------------------------------------------------------+
extern string   Symbol_Trade    = "XAUUSD";        // 交易品种
extern int      Timeframe       = PERIOD_M15;      // 时间周期（15分钟）

//+------------------------------------------------------------------+
//| 资金管理                                                          |
//+------------------------------------------------------------------+
extern double   LotSize         = 0.01;            // 基础手数
extern double   RiskPercent     = 2.0;             // 单笔风险(%)
extern double   MaxDrawdown     = 10.0;            // 最大回撤(%)
extern double   MinLots         = 0.01;            // 最小手数
extern double   MaxLots         = 1.0;             // 最大手数

//+------------------------------------------------------------------+
//| 止损止盈                                                          |
//+------------------------------------------------------------------+
extern int      TakeProfit      = 100;             // 止盈点数
extern int      StopLoss        = 50;              // 止损点数
extern int      TrailingStop    = 30;              // 移动止损点数
extern int      TrailingStep    = 10;              // 移动止损步长
extern bool     UseTrailingStop = true;            // 启用移动止损

//+------------------------------------------------------------------+
//| 保本止损                                                          |
//+------------------------------------------------------------------+
extern bool     UseBreakeven    = true;            // 启用保本止损
extern int      BreakevenStart  = 5;               // 保本启动点数（盈利5点后保本）
extern int      BreakevenProfit = 0;               // 保本点数（0表示移到开仓价）
extern double   BreakevenBuffer = 0.5;             // 保本缓冲（扣除点差）

//+------------------------------------------------------------------+
//| 顺势加仓                                                          |
//+------------------------------------------------------------------+
extern bool     UseAddPosition  = true;            // 启用顺势加仓
extern int      AddPositionPoints = 10;            // 加仓点数（盈利10点后加仓）
extern double   LotMultiplier   = 0.5;             // 手数乘数（原始手数的一半）

//+------------------------------------------------------------------+
//| 反转信号出场                                                      |
//+------------------------------------------------------------------+
extern bool     CloseOnReverse  = true;            // 反转信号平仓
extern bool     AlertClose      = true;            // 平仓提醒

//+------------------------------------------------------------------+
//| 策略参数                                                          |
//+------------------------------------------------------------------+
extern int      EMA_Fast        = 20;              // 快速EMA周期
extern int      EMA_Medium      = 50;              // 中速EMA周期
extern int      EMA_Slow        = 200;             // 慢速EMA周期

extern int      RSI_Period      = 14;              // RSI周期
extern double   RSI_Overbought  = 70;              // RSI超买
extern double   RSI_Oversold    = 30;              // RSI超卖

extern int      MACD_Fast       = 12;              // MACD快线
extern int      MACD_Slow       = 26;              // MACD慢线
extern int      MACD_Signal     = 9;               // MACD信号线

extern int      ATR_Period      = 14;              // ATR周期
extern double   ATR_Multiplier  = 2.0;             // ATR乘数

//+------------------------------------------------------------------+
//| 交易设置                                                          |
//+------------------------------------------------------------------+
extern int      MagicNumber     = 12345678;        // 魔术号码
extern int      Slippage        = 3;               // 滑点
// 交易时间已移除，全天24小时运行

//+------------------------------------------------------------------+
//| 自动优化目标                                                      |
//+------------------------------------------------------------------+
extern int      OptimizationCycle = 24;            // 优化周期（小时）
extern double   TargetWinRate     = 0.6;           // 目标胜率（60%）
extern double   TargetProfitFactor = 1.5;          // 目标盈亏比
extern double   TargetMaxDrawdown  = 0.15;         // 目标最大回撤（15%）

//+------------------------------------------------------------------+
//| 全局变量                                                          |
//+------------------------------------------------------------------+
bool            g_isInitialized = false;
datetime        g_lastBarTime = 0;
int             g_tradeCount = 0;
double          g_initialBalance = 0;
double          g_totalProfit = 0;
double          g_maxDrawdown = 0;
int             g_winCount = 0;
int             g_lossCount = 0;
double          g_baseLot = 0;
int             g_addCount = 0;
datetime        g_lastTradeTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                    |
//+------------------------------------------------------------------+
int OnInit()
{
   g_initialBalance = AccountBalance();
   g_baseLot = LotSize;
   
   g_isInitialized = true;
   Print("✅ XAUUSD EA 初始化成功");
   Print("💰 初始资金：$", DoubleToStr(g_initialBalance, 2));
   
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                  |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("📊 EA已停止，总交易次数：", g_tradeCount);
}

//+------------------------------------------------------------------+
//| Expert tick function                                              |
//+------------------------------------------------------------------+
void OnTick()
{
   if (!g_isInitialized) return;
   
   datetime currentBarTime = iTime(Symbol_Trade, Timeframe, 0);
   if (currentBarTime == g_lastBarTime) return;
   g_lastBarTime = currentBarTime;
   
   if (!IsTradeTime()) return;
   
   if (CountOrders() > 0)
   {
      ManagePositions();
   }
   else
   {
      CheckOpenSignal();
   }
}

//+------------------------------------------------------------------+
//| 检查开仓信号                                                      |
//+------------------------------------------------------------------+
void CheckOpenSignal()
{
   double emaFast = iMA(Symbol_Trade, Timeframe, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 0);
   double emaMedium = iMA(Symbol_Trade, Timeframe, EMA_Medium, 0, MODE_EMA, PRICE_CLOSE, 0);
   double emaSlow = iMA(Symbol_Trade, Timeframe, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, 0);
   double rsi = iRSI(Symbol_Trade, Timeframe, RSI_Period, PRICE_CLOSE, 0);
   double macdMain = iMACD(Symbol_Trade, Timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 0);
   double macdSignal = iMACD(Symbol_Trade, Timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 0);
   double atr = iATR(Symbol_Trade, Timeframe, ATR_Period, 0);
   
   double closePrice = iClose(Symbol_Trade, Timeframe, 0);
   double highPrice = iHigh(Symbol_Trade, Timeframe, 0);
   double lowPrice = iLow(Symbol_Trade, Timeframe, 0);
   
   bool isBreakoutUp = false;
   bool isBreakoutDown = false;
   
   if (closePrice > highPrice && emaFast > emaMedium && emaMedium > emaSlow && rsi > 50 && rsi < RSI_Overbought && macdMain > macdSignal)
   {
      isBreakoutUp = true;
   }
   
   if (closePrice < lowPrice && emaFast < emaMedium && emaMedium < emaSlow && rsi < 50 && rsi > RSI_Oversold && macdMain < macdSignal)
   {
      isBreakoutDown = true;
   }
   
   if (isBreakoutUp) OpenBuy(atr);
   else if (isBreakoutDown) OpenSell(atr);
}

//+------------------------------------------------------------------+
//| 开多仓                                                            |
//+------------------------------------------------------------------+
void OpenBuy(double atr)
{
   double price = Ask;
   double sl = price - atr * ATR_Multiplier;
   double tp = price + TakeProfit * Point;
   
   int ticket = OrderSend(Symbol_Trade, OP_BUY, g_baseLot, price, Slippage, sl, tp, "XAUUSD_BUY", MagicNumber, 0, clrGreen);
   
   if (ticket > 0)
   {
      Print("✅ 开多仓成功：", DoubleToStr(price, Digits));
      g_tradeCount++;
      g_lastTradeTime = TimeCurrent();
      g_addCount = 0;
   }
   else
   {
      Print("❌ 开多仓失败：", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| 开空仓                                                            |
//+------------------------------------------------------------------+
void OpenSell(double atr)
{
   double price = Bid;
   double sl = price + atr * ATR_Multiplier;
   double tp = price - TakeProfit * Point;
   
   int ticket = OrderSend(Symbol_Trade, OP_SELL, g_baseLot, price, Slippage, sl, tp, "XAUUSD_SELL", MagicNumber, 0, clrRed);
   
   if (ticket > 0)
   {
      Print("✅ 开空仓成功：", DoubleToStr(price, Digits));
      g_tradeCount++;
      g_lastTradeTime = TimeCurrent();
      g_addCount = 0;
   }
   else
   {
      Print("❌ 开空仓失败：", GetLastError());
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
         if (OrderSymbol() == Symbol_Trade && OrderMagicNumber() == MagicNumber)
         {
            if (UseBreakeven) ApplyBreakeven();
            if (UseTrailingStop) ApplyTrailingStop();
            if (UseAddPosition) CheckAddPosition();
            if (CloseOnReverse) CheckReverseClose();
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 保本止损                                                          |
//+------------------------------------------------------------------+
void ApplyBreakeven()
{
   double openPrice = OrderOpenPrice();
   double currentSL = OrderStopLoss();
   double currentPrice = OrderType() == OP_BUY ? Bid : Ask;
   
   double profitPoints = 0;
   if (OrderType() == OP_BUY)
      profitPoints = (currentPrice - openPrice) / Point;
   else
      profitPoints = (openPrice - currentPrice) / Point;
   
   if (profitPoints >= BreakevenStart)
   {
      double newSL = 0;
      if (OrderType() == OP_BUY)
      {
         newSL = openPrice + BreakevenBuffer * Point;
         if (currentSL < newSL)
         {
            OrderModify(OrderTicket(), openPrice, newSL, OrderTakeProfit(), 0, clrYellow);
         }
      }
      else
      {
         newSL = openPrice - BreakevenBuffer * Point;
         if (currentSL > newSL || currentSL == 0)
         {
            OrderModify(OrderTicket(), openPrice, newSL, OrderTakeProfit(), 0, clrYellow);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 移动止损                                                          |
//+------------------------------------------------------------------+
void ApplyTrailingStop()
{
   double openPrice = OrderOpenPrice();
   double currentSL = OrderStopLoss();
   double currentPrice = OrderType() == OP_BUY ? Bid : Ask;
   
   double profitPoints = 0;
   if (OrderType() == OP_BUY)
      profitPoints = (currentPrice - openPrice) / Point;
   else
      profitPoints = (openPrice - currentPrice) / Point;
   
   int dynamicTrailingStop = TrailingStop;
   
   if (profitPoints >= 50)
      dynamicTrailingStop = 10;
   else if (profitPoints >= 20)
      dynamicTrailingStop = 10;
   else if (profitPoints >= 10)
      dynamicTrailingStop = 5;
   
   if (profitPoints >= 10)
   {
      double newSL = 0;
      if (OrderType() == OP_BUY)
      {
         newSL = currentPrice - dynamicTrailingStop * Point;
         if (newSL > currentSL + TrailingStep * Point)
         {
            OrderModify(OrderTicket(), openPrice, newSL, OrderTakeProfit(), 0, clrBlue);
         }
      }
      else
      {
         newSL = currentPrice + dynamicTrailingStop * Point;
         if (newSL < currentSL - TrailingStep * Point || currentSL == 0)
         {
            OrderModify(OrderTicket(), openPrice, newSL, OrderTakeProfit(), 0, clrBlue);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 顺势加仓                                                          |
//+------------------------------------------------------------------+
void CheckAddPosition()
{
   if (g_addCount >= 3) return;
   if (TimeCurrent() - g_lastTradeTime < 300) return;
   
   double openPrice = OrderOpenPrice();
   double currentPrice = OrderType() == OP_BUY ? Bid : Ask;
   
   double profitPoints = 0;
   if (OrderType() == OP_BUY)
      profitPoints = (currentPrice - openPrice) / Point;
   else
      profitPoints = (openPrice - currentPrice) / Point;
   
   if (profitPoints >= AddPositionPoints)
   {
      double emaFast = iMA(Symbol_Trade, Timeframe, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 0);
      double emaMedium = iMA(Symbol_Trade, Timeframe, EMA_Medium, 0, MODE_EMA, PRICE_CLOSE, 0);
      
      bool isTrend = false;
      if (OrderType() == OP_BUY && emaFast > emaMedium) isTrend = true;
      else if (OrderType() == OP_SELL && emaFast < emaMedium) isTrend = true;
      
      if (isTrend)
      {
         double addLot = NormalizeDouble(g_baseLot * LotMultiplier, 2);
         int ticket = -1;
         
         if (OrderType() == OP_BUY)
            ticket = OrderSend(Symbol_Trade, OP_BUY, addLot, Ask, Slippage, 0, 0, "XAUUSD_ADD", MagicNumber, 0, clrGreen);
         else
            ticket = OrderSend(Symbol_Trade, OP_SELL, addLot, Bid, Slippage, 0, 0, "XAUUSD_ADD", MagicNumber, 0, clrRed);
         
         if (ticket > 0)
         {
            Print("✅ 加仓成功：", DoubleToStr(addLot, 2), "手");
            g_addCount++;
            g_lastTradeTime = TimeCurrent();
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 反转信号出场                                                      |
//+------------------------------------------------------------------+
void CheckReverseClose()
{
   double emaFast = iMA(Symbol_Trade, Timeframe, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 0);
   double emaMedium = iMA(Symbol_Trade, Timeframe, EMA_Medium, 0, MODE_EMA, PRICE_CLOSE, 0);
   double rsi = iRSI(Symbol_Trade, Timeframe, RSI_Period, PRICE_CLOSE, 0);
   double macdMain = iMACD(Symbol_Trade, Timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 0);
   double macdSignal = iMACD(Symbol_Trade, Timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 0);
   
   bool shouldClose = false;
   
   if (OrderType() == OP_BUY)
   {
      if (emaFast < emaMedium && rsi > RSI_Overbought && macdMain < macdSignal)
         shouldClose = true;
   }
   else if (OrderType() == OP_SELL)
   {
      if (emaFast > emaMedium && rsi < RSI_Oversold && macdMain > macdSignal)
         shouldClose = true;
   }
   
   if (shouldClose)
   {
      if (OrderType() == OP_BUY)
         OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrRed);
      else
         OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrGreen);
   }
}

//+------------------------------------------------------------------+
//| 统计订单数量                                                      |
//+------------------------------------------------------------------+
int CountOrders()
{
   int count = 0;
   for (int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if (OrderSymbol() == Symbol_Trade && OrderMagicNumber() == MagicNumber)
            count++;
      }
   }
   return count;
}

//+------------------------------------------------------------------+
//| 检查交易时间                                                      |
//+------------------------------------------------------------------+
bool IsTradeTime()
{
   return true; // 全天24小时运行，无时间限制
}
