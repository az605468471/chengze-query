//+------------------------------------------------------------------+
//|                                               strategy.mqh      |
//|                                    XAUUSD 策略模块               |
//|                                          Author: MasterD        |
//+------------------------------------------------------------------+
#ifndef STRATEGY_MQH
#define STRATEGY_MQH

#include "config.mqh"

//+------------------------------------------------------------------+
//| 策略类                                                            |
//+------------------------------------------------------------------+
class CStrategy
{
private:
   string   m_symbol;
   ENUM_TIMEFRAMES m_timeframe;

   // 指标句柄
   int      m_emaFast;
   int      m_emaMedium;
   int      m_emaSlow;
   int      m_rsi;
   int      m_macd;
   int      m_atr;

   // 策略状态
   int      m_lastSignal;
   datetime m_lastSignalTime;

public:
   CStrategy();
   ~CStrategy();

   bool Init(string symbol, ENUM_TIMEFRAMES timeframe);
   int  GetSignal();
   void UpdateIndicators();

private:
   bool IsUptrend();
   bool IsDowntrend();
   bool IsOverbought();
   bool IsOversold();
   bool IsMACDBullish();
   bool IsMACDBearish();
   double GetATR();
   bool IsKeyLevelBreakout(int direction);
};

//+------------------------------------------------------------------+
//| 构造函数                                                          |
//+------------------------------------------------------------------+
CStrategy::CStrategy()
{
   m_symbol = "";
   m_timeframe = PERIOD_H1;
   m_emaFast = 0;
   m_emaMedium = 0;
   m_emaSlow = 0;
   m_rsi = 0;
   m_macd = 0;
   m_atr = 0;
   m_lastSignal = 0;
   m_lastSignalTime = 0;
}

//+------------------------------------------------------------------+
//| 析构函数                                                          |
//+------------------------------------------------------------------+
CStrategy::~CStrategy()
{
   // 释放指标句柄
   if (m_emaFast > 0) IndicatorRelease(m_emaFast);
   if (m_emaMedium > 0) IndicatorRelease(m_emaMedium);
   if (m_emaSlow > 0) IndicatorRelease(m_emaSlow);
   if (m_rsi > 0) IndicatorRelease(m_rsi);
   if (m_macd > 0) IndicatorRelease(m_macd);
   if (m_atr > 0) IndicatorRelease(m_atr);
}

//+------------------------------------------------------------------+
//| 初始化策略                                                        |
//+------------------------------------------------------------------+
bool CStrategy::Init(string symbol, ENUM_TIMEFRAMES timeframe)
{
   m_symbol = symbol;
   m_timeframe = timeframe;

   // 初始化指标
   m_emaFast = iMA(symbol, timeframe, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE);
   m_emaMedium = iMA(symbol, timeframe, EMA_Medium, 0, MODE_EMA, PRICE_CLOSE);
   m_emaSlow = iMA(symbol, timeframe, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE);
   m_rsi = iRSI(symbol, timeframe, RSI_Period, PRICE_CLOSE);
   m_macd = iMACD(symbol, timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE);
   m_atr = iATR(symbol, timeframe, ATR_Period);

   // 检查指标是否初始化成功
   if (m_emaFast == INVALID_HANDLE || m_emaMedium == INVALID_HANDLE ||
       m_emaSlow == INVALID_HANDLE || m_rsi == INVALID_HANDLE ||
       m_macd == INVALID_HANDLE || m_atr == INVALID_HANDLE)
   {
      Print("❌ 指标初始化失败");
      return false;
   }

   Print("✅ 策略初始化成功");
   return true;
}

//+------------------------------------------------------------------+
//| 获取交易信号                                                      |
//+------------------------------------------------------------------+
int CStrategy::GetSignal()
{
   int signal = 0;

   // 更新指标
   UpdateIndicators();

   // 多头信号条件
   bool buySignal = false;
   bool sellSignal = false;

   // ===== 多头信号 =====
   // 1. 趋势向上
   bool trendUp = IsUptrend();

   // 2. RSI超卖后反弹（更好的入场点）
   bool rsiBullish = IsOversold() || (iRSI(m_symbol, m_timeframe, RSI_Period, PRICE_CLOSE, 1) < 40);

   // 3. MACD金叉或柱状图转正
   bool macdBullish = IsMACDBullish();

   // 4. 突破关键阻力位
   bool breakoutUp = IsKeyLevelBreakout(1);

   // 综合判断（至少满足2个条件）
   if (trendUp && (rsiBullish || macdBullish || breakoutUp))
   {
      buySignal = true;
   }

   // ===== 空头信号 =====
   // 1. 趋势向下
   bool trendDown = IsDowntrend();

   // 2. RSI超买后回落
   bool rsiBearish = IsOverbought() || (iRSI(m_symbol, m_timeframe, RSI_Period, PRICE_CLOSE, 1) > 60);

   // 3. MACD死叉或柱状图转负
   bool macdBearish = IsMACDBearish();

   // 4. 突破关键支撑位
   bool breakoutDown = IsKeyLevelBreakout(-1);

   // 综合判断
   if (trendDown && (rsiBearish || macdBearish || breakoutDown))
   {
      sellSignal = true;
   }

   // 生成信号
   if (buySignal)
   {
      signal = 1;
   }
   else if (sellSignal)
   {
      signal = -1;
   }

   // 避免重复信号
   if (signal != 0 && TimeCurrent() - m_lastSignalTime < PeriodSeconds(m_timeframe))
   {
      signal = 0;
   }

   m_lastSignal = signal;
   if (signal != 0) m_lastSignalTime = TimeCurrent();

   return signal;
}

//+------------------------------------------------------------------+
//| 更新指标                                                          |
//+------------------------------------------------------------------+
void CStrategy::UpdateIndicators()
{
   // 指标会自动更新，这里可以添加额外的处理逻辑
}

//+------------------------------------------------------------------+
//| 判断上涨趋势                                                      |
//+------------------------------------------------------------------+
bool CStrategy::IsUptrend()
{
   double emaFast = iMA(m_symbol, m_timeframe, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 1);
   double emaMedium = iMA(m_symbol, m_timeframe, EMA_Medium, 0, MODE_EMA, PRICE_CLOSE, 1);
   double emaSlow = iMA(m_symbol, m_timeframe, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, 1);

   // 快线>中线>慢线 = 上涨趋势
   return (emaFast > emaMedium && emaMedium > emaSlow);
}

//+------------------------------------------------------------------+
//| 判断下跌趋势                                                      |
//+------------------------------------------------------------------+
bool CStrategy::IsDowntrend()
{
   double emaFast = iMA(m_symbol, m_timeframe, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 1);
   double emaMedium = iMA(m_symbol, m_timeframe, EMA_Medium, 0, MODE_EMA, PRICE_CLOSE, 1);
   double emaSlow = iMA(m_symbol, m_timeframe, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, 1);

   // 快线<中线<慢线 = 下跌趋势
   return (emaFast < emaMedium && emaMedium < emaSlow);
}

//+------------------------------------------------------------------+
//| 判断超买                                                          |
//+------------------------------------------------------------------+
bool CStrategy::IsOverbought()
{
   double rsi = iRSI(m_symbol, m_timeframe, RSI_Period, PRICE_CLOSE, 1);
   return (rsi > RSI_Overbought);
}

//+------------------------------------------------------------------+
//| 判断超卖                                                          |
//+------------------------------------------------------------------+
bool CStrategy::IsOversold()
{
   double rsi = iRSI(m_symbol, m_timeframe, RSI_Period, PRICE_CLOSE, 1);
   return (rsi < RSI_Oversold);
}

//+------------------------------------------------------------------+
//| 判断MACD看涨                                                      |
//+------------------------------------------------------------------+
bool CStrategy::IsMACDBullish()
{
   double macdMain1 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 1);
   double macdSignal1 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 1);
   double macdMain2 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 2);
   double macdSignal2 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 2);

   // 金叉：主线从下往上穿过信号线
   bool goldenCross = (macdMain1 > macdSignal1 && macdMain2 <= macdSignal2);

   // 柱状图转正
   bool histogramPositive = (macdMain1 > 0 && macdMain2 <= 0);

   return (goldenCross || histogramPositive);
}

//+------------------------------------------------------------------+
//| 判断MACD看跌                                                      |
//+------------------------------------------------------------------+
bool CStrategy::IsMACDBearish()
{
   double macdMain1 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 1);
   double macdSignal1 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 1);
   double macdMain2 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 2);
   double macdSignal2 = iMACD(m_symbol, m_timeframe, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 2);

   // 死叉：主线从上往下穿过信号线
   bool deathCross = (macdMain1 < macdSignal1 && macdMain2 >= macdSignal2);

   // 柱状图转负
   bool histogramNegative = (macdMain1 < 0 && macdMain2 >= 0);

   return (deathCross || histogramNegative);
}

//+------------------------------------------------------------------+
//| 获取ATR值                                                         |
//+------------------------------------------------------------------+
double CStrategy::GetATR()
{
   return iATR(m_symbol, m_timeframe, ATR_Period, 1);
}

//+------------------------------------------------------------------+
//| 判断突破关键位                                                    |
//+------------------------------------------------------------------+
bool CStrategy::IsKeyLevelBreakout(int direction)
{
   // 获取最近的高低点
   double high1 = iHigh(m_symbol, m_timeframe, 1);
   double high2 = iHigh(m_symbol, m_timeframe, 2);
   double low1 = iLow(m_symbol, m_timeframe, 1);
   double low2 = iLow(m_symbol, m_timeframe, 2);

   double currentClose = iClose(m_symbol, m_timeframe, 0);

   if (direction == 1) // 向上突破
   {
      // 突破前一根K线高点
      return (currentClose > high1 && high1 > high2);
   }
   else if (direction == -1) // 向下突破
   {
      // 突破前一根K线低点
      return (currentClose < low1 && low1 < low2);
   }

   return false;
}

//+------------------------------------------------------------------+
#endif