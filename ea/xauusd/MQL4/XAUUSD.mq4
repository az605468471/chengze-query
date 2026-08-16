//+------------------------------------------------------------------+
//|                                       TrendAnalyzer_v20.mq4       |
//|                                       MasterD                      |
//+------------------------------------------------------------------+
#property copyright "MasterD"
#property link      ""
#property version   "2.37.5"
#property strict
#property indicator_chart_window
#property indicator_buffers 7
#property indicator_color1 clrRed
#property indicator_color2 clrGreen
#property indicator_color3 clrYellow
#property indicator_color4 clrCyan
#property indicator_color5 clrDodgerBlue
#property indicator_color6 clrDodgerBlue
#property indicator_color7 clrDodgerBlue

//--- 指标参数
input int EMA_Fast = 20;
input int EMA_Slow = 50;
input int EMA_H4_Slow = 200;
input int MACD_Fast = 12;
input int MACD_Slow = 26;
input int MACD_Signal = 9;
input int RSI_Period = 14;
input int ATR_Period = 14;
input double RiskPercent = 2.0;
input double MinRR = 1.2;                  // 盈亏比下限：从1.5放宽到1.2
input int MaxLossPerDay = 3;

//--- v27 新增参数：顶级EA特征（v37大幅放宽-只保留核心过滤）
input bool  EnableSessionFilter = false;   // 时段过滤：已关闭（测试用）
input bool  EnableNewsFilter = false;     // 新闻过滤：已关闭（测试用）
input bool  EnablePricePosFilter = false; // 价格位置过滤：已关闭（测试用）
input bool  EnablePatternFilter = false;  // K线形态过滤：已关闭（测试用）
input bool  EnableRRFilter = true;         // 盈亏比过滤：保留（核心）
input bool  EnableTrendConfirm = true;    // 趋势确认：保留（核心）

input double SR_ProximityATR = 0.8;      // 距离S/R多近算"到位"（ATR倍数）
input double PricePos_Threshold = 0.15;  // 价格位置阈值：0-0.15或0.85-1.0才算到位

//--- v37.3: 入场逻辑升级参数
input double ADX_StrongThreshold = 25.0;  // ADX>此值才算强趋势（4-5星必需）
input int    H1_ConfirmBars = 2;         // H1方向需要连续几根K线确认
input double ATR_MomThreshold = 1.05;   // ATR动能: 当今ATR/前根ATR要大于此值才算动能扩张

input bool  FilterAsiaSession = true;     // 过滤亚盘（低流动性）
input int   LondonStartHour = 7;          // 伦敦盘开始（GMT）
input int   LondonEndHour = 11;           // 伦敦盘结束
input int   NYStartHour = 13;             // 纽约盘开始（GMT）
input int   NYEndHour = 17;              // 纽约盘结束
input int   NewsBlockMinutes = 30;        // 重大新闻前后N分钟不交易
input int   MaxSpreadPoints = 50;         // 最大允许点差

//--- 新闻日历（简化版：手动设置重大数据时间）
input bool  UseManualNews = false;        // 启用手动新闻时间
input string NewsTime1 = "";              // 手动新闻时间1 (格式: YYYY.MM.DD HH:MM)
input string NewsTime2 = "";              // 手动新闻时间2
input string NewsTime3 = "";              // 手动新闻时间3

//--- 指标缓冲区
double Buffer1[];
double Buffer2[];
double Buffer3[];
double Buffer4[];
double BBUpper[];
double BBLower[];
double BBMiddle[];

//--- 全局变量
string indicatorPrefix = "MASTERD_V27_";
int PanelWidth = 340;
int PanelHeight = 780;
int panelX = 0;
int panelY = 20;
int g_lossCountToday = 0;
datetime g_lastDay = 0;

// v27: 过滤状态变量
string g_filterStatus = "";
color g_filterColor = clrWhite;
bool g_sessionOK = true;
bool g_newsOK = true;
bool g_pricePosOK = true;
bool g_patternOK = true;
bool g_rrOK = true;
bool g_trendOK = true;
bool g_spreadOK = true;

// 全局交易计划变量(替代多参数传递)
int g_direction = 0;
double g_entryPrice = 0;
double g_stopLoss = 0;
double g_takeProfit = 0;
double g_takeProfit2 = 0;   // 第二目标
double g_rrRatio = 0;
string g_planText = "";

// v37.2: 方向反转监测（核心安全功能）
int g_lastH4Trend = 0;      // 上一次H4趋势
int g_lastH1Trend = 0;     // 上一次H1趋势
int g_lastDirection = 0;   // 上一次进场方向
bool g_reverseAlert = false;  // 当前是否处于反转警告状态
string g_reverseText = "";   // 反转警告文字
int g_reverseBarTime = 0;   // 反转发生的K线时间（避免重复报警）

// v37.5: 进场信号锁定
int g_lockedDirection = 0;   // 锁定的方向
datetime g_lockTime = 0;          // 锁定时间
bool g_lockExpired = true;    // 锁定是否过期

// v37.5: MACD矛盾警告
bool g_macdConflict = false;
string g_macdConflictText = "";

// v37.5: 三级预警（增强版）
int g_alertLevel = 0;  // 0=正常 1=黄色(衰减) 2=橙色(H1反转) 3=红色(H4反转)
string g_alertText = "";

// v37.3: 入场逻辑升级 - H1连续确认 + 趋势强度 + 衰减警报
int g_h1Hist[3] = {0,0,0};  // H1最近3根K线的方向 (0=前, 1=中, 2=最近)
int g_h1HistIndex = 0;
int g_h1PrevTrend = 0;      // 上一根K线的H1方向
bool g_decayAlert = false;  // 趋势衰减警告
string g_decayText = "";    // 衰减警告文字
bool g_strongTrend = false; // 是否为强趋势（ADX>25 + 动能确认）
string g_trendQuality = ""; // 趋势质量评分文字

//+------------------------------------------------------------------+
//| 初始化                                                           |
//+------------------------------------------------------------------+
int init()
{
   ObjectsDeleteAll(0, "MASTERD_V27_");
   ObjectsDeleteAll(0, "MASTERD_V26_");
   ObjectsDeleteAll(0, "MASTERD_V25_");
   ObjectsDeleteAll(0, "MASTERD_V24_");
   ObjectsDeleteAll(0, "MASTERD_V23_");
   ObjectsDeleteAll(0, "MASTERD_V22_");
   ObjectsDeleteAll(0, "MASTERD_V21_");
   ObjectsDeleteAll(0, "MASTERD_V20_");
   ObjectsDeleteAll(0, "MASTERD_V19_");
   ObjectsDeleteAll(0, "MASTERD_V18_");
   ObjectsDeleteAll(0, "MASTERD_V17_");
   ObjectsDeleteAll(0, "MASTERD_PANEL_");
   ObjectsDeleteAll(0, "MASTERD_TREND_");
   ObjectsDeleteAll(0, "TA_V");
   
   for(int i = 0; i < (int)ObjectsTotal(0, -1, -1); i++)
   {
      string name = ObjectName(0, i, -1, -1);
      if(StringFind(name, "MASTERD") >= 0 || StringFind(name, "TA_V") >= 0)
      {
         ObjectDelete(0, name);
         i--;
      }
   }
   
   SetIndexBuffer(0, Buffer1);
   SetIndexBuffer(1, Buffer2);
   SetIndexBuffer(2, Buffer3);
   SetIndexBuffer(3, Buffer4);
   SetIndexBuffer(4, BBUpper);
   SetIndexBuffer(5, BBLower);
   SetIndexBuffer(6, BBMiddle);
   
   SetIndexStyle(0, DRAW_ARROW, STYLE_SOLID, 3);
   SetIndexStyle(1, DRAW_ARROW, STYLE_SOLID, 3);
   SetIndexStyle(2, DRAW_NONE);
   SetIndexStyle(3, DRAW_NONE);
   SetIndexStyle(4, DRAW_LINE, STYLE_SOLID, 1);
   SetIndexStyle(5, DRAW_LINE, STYLE_SOLID, 1);
   SetIndexStyle(6, DRAW_LINE, STYLE_DOT, 1);
   
   SetIndexArrow(0, 233);
   SetIndexArrow(1, 234);
   
   SetIndexLabel(4, "BB Upper");
   SetIndexLabel(5, "BB Lower");
   SetIndexLabel(6, "BB Middle");
   
   return(0);
}

//+------------------------------------------------------------------+
//| 反初始化                                                         |
//+------------------------------------------------------------------+
int deinit()
{
   ObjectsDeleteAll(0, indicatorPrefix);
   return(0);
}

//+------------------------------------------------------------------+
//| 计算面板X坐标（右上角）                                          |
//+------------------------------------------------------------------+
void CalcPanelPosition()
{
   long chartWidth = ChartGetInteger(0, CHART_WIDTH_IN_PIXELS);
   panelX = (int)chartWidth - PanelWidth - 20;
}

//+------------------------------------------------------------------+
//| 创建背景面板                                                     |
//+------------------------------------------------------------------+
void CreateBackgroundPanel()
{
   ObjectDelete(0, indicatorPrefix + "Bg");
   CalcPanelPosition();
   
   ObjectCreate(0, indicatorPrefix + "Bg", OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_XDISTANCE, panelX);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_YDISTANCE, panelY);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_XSIZE, PanelWidth);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_YSIZE, PanelHeight);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_BGCOLOR, C'20,20,20');
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_COLOR, clrGold);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_BACK, false);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_SELECTABLE, true);
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_HIDDEN, false);
}

//+------------------------------------------------------------------+
//| 创建标签                                                         |
//+------------------------------------------------------------------+
void CreateLabel(string name, int offsetX, int y, string text, color textColor, int fontSize = 11)
{
   ObjectDelete(0, indicatorPrefix + name);
   int labelX = panelX + offsetX;
   
   ObjectCreate(0, indicatorPrefix + name, OBJ_LABEL, 0, 0, 0);
   ObjectSetString(0, indicatorPrefix + name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_XDISTANCE, labelX);
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_YDISTANCE, panelY + y);
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_COLOR, textColor);
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_FONTSIZE, fontSize);
   ObjectSetString(0, indicatorPrefix + name, OBJPROP_FONT, "Microsoft YaHei");
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, indicatorPrefix + name, OBJPROP_HIDDEN, false);
}

//+------------------------------------------------------------------+
//| 获取小数位数                                                     |
//+------------------------------------------------------------------+
int GetDigits()
{
   return((int)SymbolInfoInteger(Symbol(), SYMBOL_DIGITS));
}

//+------------------------------------------------------------------+
//| 三层趋势分析                                                     |
//+------------------------------------------------------------------+
void GetTrendLevels(int &h4Trend, int &h1Trend, int &m5Trend, double &adxValue)
{
   // H4: EMA50 vs EMA200 (长期趋势锚定, 信号稳定)
   double h4Ema50 = iMA(Symbol(), PERIOD_H4, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, 0);
   double h4Ema200 = iMA(Symbol(), PERIOD_H4, EMA_H4_Slow, 0, MODE_EMA, PRICE_CLOSE, 0);
   h4Trend = 0;
   if(h4Ema50 > h4Ema200) h4Trend = 1;
   else if(h4Ema50 < h4Ema200) h4Trend = -1;
   
   // H1: EMA20/50 + MACD (中期趋势, 需要连续确认防假信号)
   double h1EmaFast = iMA(Symbol(), PERIOD_H1, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 0);
   double h1EmaSlow = iMA(Symbol(), PERIOD_H1, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, 0);
   double h1MacdMain = iMACD(Symbol(), PERIOD_H1, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 0);
   double h1MacdSig = iMACD(Symbol(), PERIOD_H1, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 0);
   
   // v37.3: H1原始方向（基于当前K线）
   int h1Raw = 0;
   if(h1EmaFast > h1EmaSlow) h1Raw += 1;
   else if(h1EmaFast < h1EmaSlow) h1Raw -= 1;
   if(h1MacdMain > h1MacdSig) h1Raw += 1;
   else if(h1MacdMain < h1MacdSig) h1Raw -= 1;
   if(h1Raw >= 1) h1Raw = 1;
   else if(h1Raw <= -1) h1Raw = -1;
   else h1Raw = 0;
   
   // v37.3: 检查最近N根K线H1方向是否一致（连续确认）
   // 只检查已完成的K线(从i=1开始, i=0是当前未完成的)
   int h1ConfirmCount = 0;
   int h1ConfirmDir = h1Raw;  // 以当前方向为基准
   if(h1ConfirmDir != 0) {
      for(int k = 1; k <= H1_ConfirmBars; k++) {
         double prevEmaFast = iMA(Symbol(), PERIOD_H1, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, k);
         double prevEmaSlow = iMA(Symbol(), PERIOD_H1, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, k);
         double prevMacdMain = iMACD(Symbol(), PERIOD_H1, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, k);
         double prevMacdSig = iMACD(Symbol(), PERIOD_H1, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, k);
         
         int prevH1 = 0;
         if(prevEmaFast > prevEmaSlow) prevH1 += 1;
         else if(prevEmaFast < prevEmaSlow) prevH1 -= 1;
         if(prevMacdMain > prevMacdSig) prevH1 += 1;
         else if(prevMacdMain < prevMacdSig) prevH1 -= 1;
         if(prevH1 >= 1) prevH1 = 1;
         else if(prevH1 <= -1) prevH1 = -1;
         else prevH1 = 0;
         
         if(prevH1 == h1ConfirmDir) h1ConfirmCount++;
      }
   }
   
   // H1方向判定:
   // - 当前K线有方向 + 前N根也是同方向 → 确认
   // - 当前有方向但前面不一致 → 不确认（震荡）
   if(h1Raw != 0 && h1ConfirmCount >= H1_ConfirmBars - 1)  // N-1是因为当前算1次确认
      h1Trend = h1Raw;
   else
      h1Trend = 0;  // 未确认, 当震荡
   
   // M5: RSI + EMA（短线择时, 条件严格避免噪音）
   double m5Rsi = iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, 0);
   double m5Rsi1 = iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, 1);
   double m5EmaFast = iMA(Symbol(), PERIOD_M15, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, 0);
   double m5EmaSlow = iMA(Symbol(), PERIOD_M15, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, 0);
   double m5EmaGap = MathAbs(m5EmaFast - m5EmaSlow);
   double m5Atr = iATR(Symbol(), PERIOD_M15, 14, 0);
   
   m5Trend = 0;
   // 做多: EMA20>EMA50 + 差距够大 + RSI>55 + 前一根RSI也>50
   if(m5EmaFast > m5EmaSlow && m5EmaGap > m5Atr * 0.3 && m5Rsi > 55 && m5Rsi1 > 50)
      m5Trend = 1;
   // 做空: EMA20<EMA50 + 差距够大 + RSI<45 + 前一根RSI也<50
   else if(m5EmaFast < m5EmaSlow && m5EmaGap > m5Atr * 0.3 && m5Rsi < 45 && m5Rsi1 < 50)
      m5Trend = -1;
   
   // ADX
   adxValue = iADX(Symbol(), PERIOD_H1, 14, PRICE_CLOSE, MODE_MAIN, 0);
}

//+------------------------------------------------------------------+
//| 趋势状态细分                                                     |
//+------------------------------------------------------------------+
string GetTrendState(int h4, int h1, int m5, double adx, int &signalStrength)
{
   signalStrength = 0;
   
   // v37.3: 信号强度重写 - 4星以上必须 ADX > 阈值
   // 旧逻辑: 只要H4+H1+M5同向就给4星 (弱趋势市场也冲)
   // 新逻辑: 4星必须 ADX > ADX_StrongThreshold(默认25), 5星必须 ADX > 30
   // 弱趋势(ADX < 25) 最多只能3星, 不给"强烈"信号
   
   bool adxStrong = (adx >= ADX_StrongThreshold);   // >=25 算强趋势
   bool adxVeryStrong = (adx >= 30.0);              // >=30 算超强趋势
   
   // === 多头信号 ===
   if(h4 == 1 && h1 == 1 && m5 == 1 && adxVeryStrong)
   {
      signalStrength = 5;
      return "多头顺势 - 超强趋势";
   }
   if(h4 == 1 && h1 == 1 && m5 == 1 && adxStrong)
   {
      signalStrength = 4;
      return "多头顺势 - 强趋势";
   }
   if(h4 == 1 && h1 == 1 && m5 == 1 && !adxStrong)
   {
      signalStrength = 3;  // v37.3: ADX不够, 降为3星
      return "多头共振 - 弱趋势(勿重仓)";
   }
   if(h4 == 1 && h1 == 1 && m5 == 0)
   {
      signalStrength = 3;
      return "多头趋势 - M15待确认";
   }
   if(h4 == 1 && h1 == 1 && m5 == -1)
   {
      signalStrength = 2;
      return "多头回调 - 等企稳做多";
   }
   if(h4 == 1 && h1 == -1)
   {
      signalStrength = 1;
      return "多头转弱 - 注意风险";
   }
   
   // === 空头信号 ===
   if(h4 == -1 && h1 == -1 && m5 == -1 && adxVeryStrong)
   {
      signalStrength = 5;
      return "空头顺势 - 超强趋势";
   }
   if(h4 == -1 && h1 == -1 && m5 == -1 && adxStrong)
   {
      signalStrength = 4;
      return "空头顺势 - 强趋势";
   }
   if(h4 == -1 && h1 == -1 && m5 == -1 && !adxStrong)
   {
      signalStrength = 3;  // v37.3: ADX不够, 降为3星
      return "空头共振 - 弱趋势(勿重仓)";
   }
   if(h4 == -1 && h1 == -1 && m5 == 0)
   {
      signalStrength = 3;
      return "空头趋势 - M15待确认";
   }
   if(h4 == -1 && h1 == -1 && m5 == 1)
   {
      signalStrength = 2;
      return "空头回调 - 等承压做空";
   }
   if(h4 == -1 && h1 == 1)
   {
      signalStrength = 1;
      return "空头转弱 - 注意风险";
   }
   
   // === 震荡 ===
   if(h1 == 1 && (m5 == 0 || m5 == 1))
   {
      signalStrength = 2;
      return "震荡偏多";
   }
   if(h1 == -1 && (m5 == 0 || m5 == -1))
   {
      signalStrength = 2;
      return "震荡偏空";
   }
   signalStrength = 1;
   return "纯震荡 - 不建议交易";
}

//+------------------------------------------------------------------+
//| 多空转换预警                                                     |
//+------------------------------------------------------------------+
string GetConversionAlert(int h4, int h1, int m5)
{
   if(h1 == 1 && m5 == -1)
      return ">> 警告: M15转空, 注意H1是否跟随";
   if(h1 == -1 && m5 == 1)
      return ">> 警告: M15转多, 注意H1是否跟随";
   return "";
}

//+------------------------------------------------------------------+
//| 支撑阻力位 - 波段高低点算法                                       |
//| 找明显的波段高点(阻力)和低点(支撑)                               |
//| 过滤掉太近的价位，确保间距实用                                    |
//+------------------------------------------------------------------+
void GetSupportResistance(double &resist1, double &resist2, double &support1, double &support2)
{
   resist1 = 0; resist2 = 0; support1 = 0; support2 = 0;
   double curPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   
   // 最小间距：ATR的2倍 或 200点，取较大值
   double atr = iATR(Symbol(), PERIOD_H1, 14, 0);
   double minGap = MathMax(atr * 2.0, 200 * Point);
   
   // 收集最近200根H1的所有波段高低点
   double resistLevels[];
   double supportLevels[];
   ArrayResize(resistLevels, 0);
   ArrayResize(supportLevels, 0);
   
   int lookback = 200;
   int swingPeriod = 5; // 左右各5根K线确认波段
   
   for(int i = swingPeriod; i <= lookback - swingPeriod; i++)
   {
      double h = iHigh(Symbol(), PERIOD_H1, i);
      double l = iLow(Symbol(), PERIOD_H1, i);
      
      // 检查是否是波段高点
      bool isSwingHigh = true;
      for(int j = 1; j <= swingPeriod; j++)
      {
         if(iHigh(Symbol(), PERIOD_H1, i+j) >= h || iHigh(Symbol(), PERIOD_H1, i-j) >= h)
         {
            isSwingHigh = false;
            break;
         }
      }
      if(isSwingHigh && h > curPrice)
      {
         int sz = ArraySize(resistLevels);
         ArrayResize(resistLevels, sz + 1);
         resistLevels[sz] = h;
      }
      
      // 检查是否是波段低点
      bool isSwingLow = true;
      for(int j = 1; j <= swingPeriod; j++)
      {
         if(iLow(Symbol(), PERIOD_H1, i+j) <= l || iLow(Symbol(), PERIOD_H1, i-j) <= l)
         {
            isSwingLow = false;
            break;
         }
      }
      if(isSwingLow && l < curPrice)
      {
         int sz = ArraySize(supportLevels);
         ArrayResize(supportLevels, sz + 1);
         supportLevels[sz] = l;
      }
   }
   
   // 阻力：从近到远排序（距当前价最近的在前）
   // 简单排序 - 冒泡
   int rSize = ArraySize(resistLevels);
   for(int i = 0; i < rSize - 1; i++)
   {
      for(int j = i + 1; j < rSize; j++)
      {
         if(resistLevels[j] < resistLevels[i])
         {
            double tmp = resistLevels[i];
            resistLevels[i] = resistLevels[j];
            resistLevels[j] = tmp;
         }
      }
   }
   
   int sSize = ArraySize(supportLevels);
   for(int i = 0; i < sSize - 1; i++)
   {
      for(int j = i + 1; j < sSize; j++)
      {
         if(supportLevels[j] > supportLevels[i])
         {
            double tmp = supportLevels[i];
            supportLevels[i] = supportLevels[j];
            supportLevels[j] = tmp;
         }
      }
   }
   
   // 选取阻力1和阻力2（确保间距 >= minGap）
   double r1 = 0, r2 = 0;
   for(int i = 0; i < rSize; i++)
   {
      if(r1 == 0)
      {
         r1 = resistLevels[i];
      }
      else if(MathAbs(resistLevels[i] - r1) >= minGap)
      {
         r2 = resistLevels[i];
         break;
      }
   }
   
   // 选取支撑1和支撑2（确保间距 >= minGap）
   double s1 = 0, s2 = 0;
   for(int i = 0; i < sSize; i++)
   {
      if(s1 == 0)
      {
         s1 = supportLevels[i];
      }
      else if(MathAbs(s1 - supportLevels[i]) >= minGap)
      {
         s2 = supportLevels[i];
         break;
      }
   }
   
   // 兜底
   if(r1 == 0) r1 = curPrice + minGap;
   if(r2 == 0) r2 = r1 + minGap;
   if(s1 == 0) s1 = curPrice - minGap;
   if(s2 == 0) s2 = s1 - minGap;
   
   resist1 = r1;
   resist2 = r2;
   support1 = s1;
   support2 = s2;
}

//+------------------------------------------------------------------+
//| K线形态识别                                                       |
//+------------------------------------------------------------------+
string GetCandlePattern()
{
   double h1O1 = iOpen(Symbol(), PERIOD_H1, 1);
   double h1C1 = iClose(Symbol(), PERIOD_H1, 1);
   double h1H1 = iHigh(Symbol(), PERIOD_H1, 1);
   double h1L1 = iLow(Symbol(), PERIOD_H1, 1);
   
   double body1 = MathAbs(h1C1 - h1O1);
   double range1 = h1H1 - h1L1;
   if(range1 == 0) return "无形态";
   
   double upperWick1 = h1H1 - MathMax(h1O1, h1C1);
   double lowerWick1 = MathMin(h1O1, h1C1) - h1L1;
   
   if(lowerWick1 > body1 * 2 && h1C1 > h1O1)
      return "锤子线(看涨)";
   
   if(upperWick1 > body1 * 2 && h1C1 < h1O1)
      return "射击之星(看跌)";
   
   if(body1 < range1 * 0.1)
      return "十字星";
   
   if(h1C1 > h1O1 && body1 > range1 * 0.6)
      return "大阳线";
   
   if(h1C1 < h1O1 && body1 > range1 * 0.6)
      return "大阴线";
   
   return "普通K线";
}

//+------------------------------------------------------------------+
//| v27: 时段过滤 - 只在活跃时段允许交易                           |
//+------------------------------------------------------------------+
bool IsSessionActive()
{
   int hourGMT = TimeHour(TimeGMT());
   
   if(!EnableSessionFilter) return(true);
   
   // 亚盘过滤
   if(FilterAsiaSession && hourGMT >= 0 && hourGMT < LondonStartHour)
      return(false);
   
   // 伦敦盘
   if(hourGMT >= LondonStartHour && hourGMT < LondonEndHour)
      return(true);
   
   // 纽约盘
   if(hourGMT >= NYStartHour && hourGMT < NYEndHour)
      return(true);
   
   // 休盘时段
   return(false);
}

//+------------------------------------------------------------------+
//| v27: 新闻过滤 - 重大数据前后不交易                               |
//+------------------------------------------------------------------+
bool IsNewsClear()
{
   if(!EnableNewsFilter) return(true);
   if(!UseManualNews) return(true);
   
   datetime now = TimeCurrent();
   datetime newsTimes[3];
   int newsCount = 0;
   
   string newsStrs[3];
   newsStrs[0] = NewsTime1;
   newsStrs[1] = NewsTime2;
   newsStrs[2] = NewsTime3;
   
   for(int i = 0; i < 3; i++)
   {
      if(newsStrs[i] != "")
      {
         datetime nt = StrToTime(newsStrs[i]);
         if(MathAbs(now - nt) <= NewsBlockMinutes * 60)
            return(false);
      }
   }
   
   return(true);
}

//+------------------------------------------------------------------+
//| v27: 点差检查                                                   |
//+------------------------------------------------------------------+
bool IsSpreadOK()
{
   double spread = (Ask - Bid) / Point;
   if(spread > MaxSpreadPoints) return(false);
   return(true);
}

//+------------------------------------------------------------------+
//| v27: K线形态确认 - 只接受特殊形态                                |
//+------------------------------------------------------------------+
bool IsPatternConfirmed(string pattern, int direction)
{
   if(!EnablePatternFilter) return(true);
   
   // 做多需要看涨形态
   if(direction == 1)
   {
      if(StringFind(pattern, "看涨") >= 0) return(true);
      if(StringFind(pattern, "锤子") >= 0) return(true);
      if(StringFind(pattern, "大阳线") >= 0) return(true);
   }
   // 做空需要看跌形态
   if(direction == -1)
   {
      if(StringFind(pattern, "看跌") >= 0) return(true);
      if(StringFind(pattern, "射击") >= 0) return(true);
      if(StringFind(pattern, "大阴线") >= 0) return(true);
   }
   // 十字星不交易
   return(false);
}

//+------------------------------------------------------------------+
//| v27: 价格位置检查 - 只在S/R附近进场                              |
//+------------------------------------------------------------------+
bool IsPriceAtSR(double curPrice, double resist1, double support1, double atrH1, int direction)
{
   if(!EnablePricePosFilter) return(true);
   
   double proxThreshold = atrH1 * SR_ProximityATR;
   
   // 做空：价格需要接近阻力
   if(direction == -1)
   {
      double distToR1 = MathAbs(resist1 - curPrice);
      if(distToR1 <= proxThreshold) return(true);
   }
   // 做多：价格需要接近支撑
   if(direction == 1)
   {
      double distToS1 = MathAbs(support1 - curPrice);
      if(distToS1 <= proxThreshold) return(true);
   }
   
   return(false);
}

//+------------------------------------------------------------------+
//| 交易时段                                                         |
//+------------------------------------------------------------------+
string GetTradingSession()
{
   int hour = TimeHour(TimeCurrent());
   int hourGMT = hour - (int)TimeGMTOffset();
   if(hourGMT < 0) hourGMT += 24;
   if(hourGMT >= 24) hourGMT -= 24;
   
   if(hourGMT >= 0 && hourGMT < 7)
      return "亚盘";
   if(hourGMT >= 7 && hourGMT < 14)
      return "欧盘";
   if(hourGMT >= 14 && hourGMT < 21)
      return "美盘";
   return "休盘";
}

//+------------------------------------------------------------------+
//| 交易计划(使用全局变量) - v27升级版                                |
//| 加入6项顶级EA过滤条件                                            |
//+------------------------------------------------------------------+
void GetTradePlan(int h4Trend, int h1Trend, int m5Trend, double atrM5, double rsi,
                  double resist1, double resist2, double support1, double support2,
                  int signalStrength, string trendState, string pattern)
{
   g_direction = 0;
   g_entryPrice = 0;
   g_stopLoss = 0;
   g_takeProfit = 0;
   g_takeProfit2 = 0;
   g_rrRatio = 0;
   g_planText = "";
   
   // v37.5: 进场信号锁定过期检查（2小时过期）
   if(!g_lockExpired && g_lockTime > 0)
   {
      if(TimeCurrent() - g_lockTime > 7200)  // 2小时=7200秒
      {
         g_lockExpired = true;
         g_lockedDirection = 0;
      }
   }
   
   // 重置过滤状态
   g_sessionOK = true;
   g_newsOK = true;
   g_pricePosOK = true;
   g_patternOK = true;
   g_rrOK = true;
   g_trendOK = true;
   g_spreadOK = true;
   
   // === 信号强度检查 ===
   if(signalStrength < 2)
   {
      if(signalStrength == 1)
         g_planText = "信号偏弱 - 继续观察";
      else
         g_planText = "信号不足 - 不建议交易";
      return;
   }
   
   // === v27过滤1: 趋势确认 - H4+H1必须同向 ===
   if(EnableTrendConfirm)
   {
      if(h4Trend != h1Trend || h1Trend == 0)
      {
         g_trendOK = false;
         g_direction = 0;
         g_planText = "趋势未确认: H4与H1不同向 - 等待";
         return;
      }
   }
   
   // === v27过滤2: 时段过滤 ===
   g_sessionOK = IsSessionActive();
   if(!g_sessionOK)
   {
      g_direction = 0;
      g_planText = "非活跃时段 - 等待伦敦/纽约盘";
      return;
   }
   
   // === v27过滤3: 新闻过滤 ===
   g_newsOK = IsNewsClear();
   if(!g_newsOK)
   {
      g_direction = 0;
      g_planText = "重大新闻前后 - 暂停交易";
      return;
   }
   
   // === v27过滤4: 点差检查 ===
   g_spreadOK = IsSpreadOK();
   if(!g_spreadOK)
   {
      g_direction = 0;
      g_planText = "点差过大 - 等待恢复正常";
      return;
   }
   
   double curPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   double atrH1 = iATR(Symbol(), PERIOD_H1, ATR_Period, 0);
   double slDistance = atrH1 * 1.5;
   double tpDistance1 = atrH1 * 2.0;
   double tpDistance2 = atrH1 * 3.5;
   
   // 计算价格位置
   int lookback = 50;
   double recentHigh = iHigh(Symbol(), PERIOD_H1, iHighest(Symbol(), PERIOD_H1, MODE_HIGH, lookback, 0));
   double recentLow = iLow(Symbol(), PERIOD_H1, iLowest(Symbol(), PERIOD_H1, MODE_LOW, lookback, 0));
   double range = recentHigh - recentLow;
   if(range == 0) range = atrH1 * 5;
   double pricePosition = (curPrice - recentLow) / range;
   
   double distToR1 = (resist1 > 0) ? MathAbs(resist1 - curPrice) : 999999;
   double distToS1 = (support1 > 0) ? MathAbs(support1 - curPrice) : 999999;
   
   string m5Confirm = "";
   if(m5Trend == -1) m5Confirm = " [M15确认空]";
   if(m5Trend == 1) m5Confirm = " [M15确认多]";
   if(m5Trend == 0) m5Confirm = " [M5震荡-注意]";
   
   // === 做空逻辑 ===
   if(h1Trend == -1 && h4Trend == -1)
   {
      // v37.5: 进场位置逻辑修正
      // 支撑位附近不做空（低位做空容易反弹被套）
      // 只有在阻力位附近或高位才做空
      bool atSR = IsPriceAtSR(curPrice, resist1, support1, atrH1, -1);
      g_pricePosOK = atSR;
      
      // 检查是否在支撑附近（距离支撑小于1倍ATR）
      bool nearSupport = (distToS1 < atrH1 * 1.0);
      
      if(nearSupport && !atSR)
      {
         // 在支撑位附近，不做空，等待反弹
         g_direction = 0;
         g_planText = "★ 价格在支撑位附近 - 不做空! 等反弹至 " + DoubleToString(resist1, GetDigits()) + " 再空";
         return;
      }
      
      if(pricePosition > 0.85 || distToR1 < atrH1 * SR_ProximityATR || atSR)
      {
         bool patternOK = IsPatternConfirmed(pattern, -1);
         g_patternOK = patternOK;
         
         if(!patternOK)
         {
            g_direction = 0;
            g_planText = "阻力位附近 - 等待看跌形态确认";
            return;
         }
         
         // v37.5: 进场信号锁定 - 不再每tick更新
         g_direction = -1;
         if(g_entryPrice == 0 || g_lockedDirection != -1 || g_lockExpired)
         {
            g_entryPrice = curPrice;
            g_stopLoss = curPrice + slDistance;
            g_takeProfit = curPrice - tpDistance1;
            g_takeProfit2 = curPrice - tpDistance2;
            g_rrRatio = tpDistance1 / slDistance;
            g_lockedDirection = -1;
            g_lockTime = TimeCurrent();
            g_lockExpired = false;
         }
         g_planText = "★ 阻力位做空(顺势)" + m5Confirm;
      }
      else if(pricePosition < (1.0 - PricePos_Threshold))
      {
         g_direction = 0;
         double waitPrice = curPrice + (recentHigh - curPrice) * 0.5;
         g_planText = "价格在低位 - 等反弹至 " + DoubleToString(waitPrice, GetDigits()) + " 附近做空";
         return;
      }
      else
      {
         g_direction = 0;
         g_planText = "价格在中间 - 等接近阻力 " + DoubleToString(resist1, GetDigits()) + " 再做空";
         return;
      }
   }
   // === 做多逻辑 ===
   else if(h1Trend == 1 && h4Trend == 1)
   {
      // v37.5: 进场位置逻辑修正
      // 阻力位附近不做多（高位做多容易回调被套）
      bool atSR = IsPriceAtSR(curPrice, resist1, support1, atrH1, 1);
      g_pricePosOK = atSR;
      
      // 检查是否在阻力附近
      bool nearResistance = (distToR1 < atrH1 * 1.0);
      
      if(nearResistance && !atSR)
      {
         // 在阻力位附近，不做多，等待回调
         g_direction = 0;
         g_planText = "★ 价格在阻力位附近 - 不做多! 等回调至 " + DoubleToString(support1, GetDigits()) + " 再多";
         return;
      }
      
      if(pricePosition < PricePos_Threshold || distToS1 < atrH1 * SR_ProximityATR || atSR)
      {
         bool patternOK = IsPatternConfirmed(pattern, 1);
         g_patternOK = patternOK;
         
         if(!patternOK)
         {
            g_direction = 0;
            g_planText = "支撑位附近 - 等待看涨形态确认";
            return;
         }
         
         // v37.5: 进场信号锁定
         g_direction = 1;
         if(g_entryPrice == 0 || g_lockedDirection != 1 || g_lockExpired)
         {
            g_entryPrice = curPrice;
            g_stopLoss = curPrice - slDistance;
            g_takeProfit = curPrice + tpDistance1;
            g_takeProfit2 = curPrice + tpDistance2;
            g_rrRatio = tpDistance1 / slDistance;
            g_lockedDirection = 1;
            g_lockTime = TimeCurrent();
            g_lockExpired = false;
         }
         g_planText = "★ 支撑位做多(顺势)" + m5Confirm;
      }
      else if(pricePosition > PricePos_Threshold)
      {
         g_direction = 0;
         double waitPrice = curPrice - (curPrice - recentLow) * 0.5;
         g_planText = "价格在高位 - 等回调至 " + DoubleToString(waitPrice, GetDigits()) + " 附近做多";
         return;
      }
      else
      {
         g_direction = 0;
         g_planText = "价格在中间 - 等接近支撑 " + DoubleToString(support1, GetDigits()) + " 再做多";
         return;
      }
   }
   
   // === v27过滤5: 盈亏比强制检查 ===
   if(g_direction != 0 && g_entryPrice != 0 && g_stopLoss != 0)
   {
      double slDist = MathAbs(g_entryPrice - g_stopLoss);
      if(slDist == 0) slDist = 0.01;
      double rr = MathAbs(g_takeProfit - g_entryPrice) / slDist;
      g_rrRatio = rr;
      g_rrOK = (rr >= MinRR);
      
      if(EnableRRFilter && rr < MinRR)
      {
         g_direction = 0;
         g_planText = "盈亏比不足1:" + DoubleToString(MinRR, 1) + " - 暂不交易";
         return;
      }
   }
   
   // === v27过滤6: 日内亏损检查 ===
   CheckDailyLoss();
   if(g_lossCountToday >= MaxLossPerDay && g_direction != 0)
   {
      g_direction = 0;
      g_planText = "今日亏损已达" + IntegerToString(MaxLossPerDay) + "单 - 停止交易";
      return;
   }
}

//+------------------------------------------------------------------+
//| 仓位计算                                                         |
//+------------------------------------------------------------------+
double CalculateLotSize(double stopLossPoints)
{
   double riskUSD = AccountBalance() * RiskPercent / 100.0;
   double tickValue = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_TICK_VALUE);
   double tickSize = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_TICK_SIZE);
   if(tickSize == 0) tickSize = Point;
   
   double lossPerLot = stopLossPoints * Point / tickSize * tickValue;
   if(lossPerLot == 0) return(0.01);
   
   double lot = riskUSD / lossPerLot;
   double minLot = SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_STEP);
   if(lotStep == 0) lotStep = 0.01;
   
   lot = MathFloor(lot / lotStep) * lotStep;
   if(lot < minLot) lot = minLot;
   if(lot > maxLot) lot = maxLot;
   
   return(lot);
}

//+------------------------------------------------------------------+
//| 日内亏损检查                                                     |
//+------------------------------------------------------------------+
void CheckDailyLoss()
{
   datetime today = iTime(Symbol(), PERIOD_D1, 0);
   if(today != g_lastDay)
   {
      g_lastDay = today;
      g_lossCountToday = 0;
   }
   
   for(int i = OrdersHistoryTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         if(StringFind(OrderSymbol(), Symbol()) < 0) continue;
         if(OrderCloseTime() < today) continue;
         if(OrderProfit() < 0) g_lossCountToday++;
      }
   }
}

//+------------------------------------------------------------------+
//| 星级显示                                                         |
//+------------------------------------------------------------------+
string GetStars(int count)
{
   string s = "";
   for(int i = 0; i < count; i++) s += "*";
   for(int i = count; i < 5; i++) s += ".";
   return(s);
}

//+------------------------------------------------------------------+
//| 绘制数据面板                                                     |
//+------------------------------------------------------------------+
void DrawDataPanel()
{
   int digits = GetDigits();
   int offsetX = 14;
   int y = 0;
   int lineH = 22;
   
   color cOrange = C'255,140,0';
   color cGray = C'160,160,160';
   
   ObjectsDeleteAll(0, indicatorPrefix);
   CreateBackgroundPanel();
   
   // === 获取数据 ===
   int h4Trend = 0, h1Trend = 0, m5Trend = 0;
   double adx = 0;
   GetTrendLevels(h4Trend, h1Trend, m5Trend, adx);
   
   int signalStrength = 0;
   string trendState = GetTrendState(h4Trend, h1Trend, m5Trend, adx, signalStrength);
   
   string convAlert = GetConversionAlert(h4Trend, h1Trend, m5Trend);
   
   // v37.2: 方向反转检测（核心安全功能）
   // 检测H4或H1趋势是否与上次记录的方向发生反转
   g_reverseAlert = false;
   g_reverseText = "";
   
   if(g_lastH4Trend != 0 || g_lastH1Trend != 0)
   {
      // 计算上次的总体方向（以H4为主）
      int lastDir = 0;
      if(g_lastH4Trend == 1 && g_lastH1Trend == 1) lastDir = 1;
      else if(g_lastH4Trend == -1 && g_lastH1Trend == -1) lastDir = -1;
      else if(g_lastH4Trend != 0) lastDir = g_lastH4Trend;  // H4优先
      
      // 计算现在的总体方向
      int curDir = 0;
      if(h4Trend == 1 && h1Trend == 1) curDir = 1;
      else if(h4Trend == -1 && h1Trend == -1) curDir = -1;
      else if(h4Trend != 0) curDir = h4Trend;
      
      // 反转条件: 上次有明确方向, 且现在方向与上次相反
      if(lastDir != 0 && curDir != 0 && lastDir != curDir)
      {
         g_reverseAlert = true;
         string lastDirText = (lastDir == 1) ? "多" : "空";
         string curDirText = (curDir == 1) ? "多" : "空";
         g_reverseText = "⚠ 方向反转: " + lastDirText + " → " + curDirText + " | 若持仓与原方向一致, 建议立即平仓!";
         
         // 弹窗报警（同一根K线只报一次）
         if(g_reverseBarTime != Time[0])
         {
            Alert("【MasterD 方向反转警报】\n",
                  Symbol(), " ", Period(), "分钟图\n",
                  "原方向: ", lastDirText, " → 现方向: ", curDirText, "\n",
                  "H4: ", (h4Trend==1?"多头":(h4Trend==-1?"空头":"震荡")),
                  " | H1: ", (h1Trend==1?"多头":(h1Trend==-1?"空头":"震荡")), "\n",
                  "若持仓与原方向一致, 建议立即平仓!");
            g_reverseBarTime = Time[0];
         }
      }
   }
   
   // 更新历史方向记录
   g_lastH4Trend = h4Trend;
   g_lastH1Trend = h1Trend;
   if(g_direction != 0) g_lastDirection = g_direction;
   
   // v37.3: 趋势衰减警报（比方向反转更早一步提醒）
   // 场景: 之前进场H1是空, 现在H1变震荡了 (进场依据减弱)
   // 不等于反转(反转是H1从空变多), 是趋势动能耗尽
   g_decayAlert = false;
   g_decayText = "";
   if(g_lastDirection != 0 && !g_reverseAlert)
   {
      // 检查进场的H1方向现在是否变成震荡
      bool h1Decayed = false;
      if(g_lastDirection == -1 && h1Trend == 0 && g_lastH1Trend == -1)  // 之前空现在震荡
         h1Decayed = true;
      if(g_lastDirection == 1 && h1Trend == 0 && g_lastH1Trend == 1)   // 之前多现在震荡
         h1Decayed = true;
      
      if(h1Decayed)
      {
         g_decayAlert = true;
         g_decayText = "⚠ 趋势衰减: H1从" + ((g_lastDirection==1)?"多":"空") + "变震荡 | 进场依据减弱, 建议减仓或平仓";
      }
   }
   
   // v37.3: ATR动能检查 (趋势是否还在扩张)
   double atrH1Prev = iATR(Symbol(), PERIOD_H1, ATR_Period, 1);
   double atrH1Cur = iATR(Symbol(), PERIOD_H1, ATR_Period, 0);
   bool atrExpanding = (atrH1Prev > 0 && (atrH1Cur / atrH1Prev) >= ATR_MomThreshold);
   
   // v37.3: 趋势质量评分（独立于信号星级）
   g_strongTrend = (adx >= ADX_StrongThreshold && atrExpanding);
   if(g_direction != 0 || (h4Trend == h1Trend && h4Trend != 0))
   {
      if(adx >= 30.0 && atrExpanding)
         g_trendQuality = "趋势质量: 超强(ADX=" + DoubleToString(adx,1) + " + 动能扩张)";
      else if(adx >= ADX_StrongThreshold && atrExpanding)
         g_trendQuality = "趋势质量: 强(ADX=" + DoubleToString(adx,1) + " + 动能扩张)";
      else if(adx >= ADX_StrongThreshold && !atrExpanding)
         g_trendQuality = "趋势质量: 中(ADX强但动能趋减)";
      else
         g_trendQuality = "趋势质量: 弱(ADX=" + DoubleToString(adx,1) + " < " + DoubleToString(ADX_StrongThreshold,1) + ", 勿重仓)";
   }
   else
   {
      g_trendQuality = "趋势质量: N/A (无明确方向)";
   }
   
   double rsi = iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, 0);
   double atrM5 = iATR(Symbol(), PERIOD_M15, ATR_Period, 0);
   double atrH1 = iATR(Symbol(), PERIOD_H1, ATR_Period, 0);  // 新增: H1 ATR
   double spread = (Ask - Bid) / Point;
   double curPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   
   double r1 = 0, r2 = 0, s1 = 0, s2 = 0;
   GetSupportResistance(r1, r2, s1, s2);
   
   string pattern = GetCandlePattern();
   string session = GetTradingSession();
   
   GetTradePlan(h4Trend, h1Trend, m5Trend, atrH1, rsi, r1, r2, s1, s2,
                signalStrength, trendState, pattern);
   
   CheckDailyLoss();
   
   // === 标题 ===
   CreateLabel("Title", offsetX, y, "===== 趋势分析 v2.37.5 =====", clrGold, 14);
   y += lineH + 6;
   
   // v37.2: 方向反转警告（面板顶部醒目位置）
   if(g_reverseAlert)
   {
      CreateLabel("ReverseAlert1", offsetX, y, "================================", clrRed, 12);
      y += lineH;
      CreateLabel("ReverseAlert2", offsetX, y, g_reverseText, clrRed, 13);
      y += lineH;
      CreateLabel("ReverseAlert3", offsetX, y, "================================", clrRed, 12);
      y += lineH + 4;
   }
   
   // v37.3: 趋势衰减警告 (比反转更早, 黄色提示)
   if(g_decayAlert && !g_reverseAlert)
   {
      CreateLabel("DecayAlert1", offsetX, y, "================================", clrYellow, 12);
      y += lineH;
      CreateLabel("DecayAlert2", offsetX, y, g_decayText, clrYellow, 13);
      y += lineH;
      CreateLabel("DecayAlert3", offsetX, y, "================================", clrYellow, 12);
      y += lineH + 4;
   }
   
   // === 三层趋势 ===
   CreateLabel("TrendTitle", offsetX, y, "-- 三层趋势 --", clrCyan, 12);
   y += lineH;
   
   string h4Text = (h4Trend == 1) ? "多头" : (h4Trend == -1) ? "空头" : "震荡";
   color h4Color = (h4Trend == 1) ? clrRed : (h4Trend == -1) ? clrGreen : clrYellow;
   CreateLabel("H4", offsetX + 5, y, "H4: " + h4Text + "  ADX:" + DoubleToString(adx, 1), h4Color, 11);
   y += lineH;
   
   string h1Text = (h1Trend == 1) ? "多头" : (h1Trend == -1) ? "空头" : "震荡";
   color h1Color = (h1Trend == 1) ? clrRed : (h1Trend == -1) ? clrGreen : clrYellow;
   CreateLabel("H1", offsetX + 5, y, "H1: " + h1Text, h1Color, 11);
   y += lineH;
   
   string m5Text = (m5Trend == 1) ? "多头" : (m5Trend == -1) ? "空头" : "震荡";
   color m5Color = (m5Trend == 1) ? clrRed : (m5Trend == -1) ? clrGreen : clrYellow;
   CreateLabel("M15", offsetX + 5, y, "M15: " + m5Text + "  RSI:" + DoubleToString(rsi, 1), m5Color, 11);
   y += lineH + 4;
   
   // === 趋势状态 + 信号强度 ===
   color stateColor = clrWhite;
   if(signalStrength >= 4) stateColor = clrRed;
   else if(signalStrength >= 3) stateColor = cOrange;
   else if(signalStrength >= 2) stateColor = clrYellow;
   else stateColor = cGray;
   
   CreateLabel("State", offsetX, y, "状态: " + trendState, stateColor, 12);
   y += lineH;
   CreateLabel("Stars", offsetX, y, "信号: [" + GetStars(signalStrength) + "]", stateColor, 12);
   y += lineH + 4;
   
   // === 多空转换预警 ===
   if(convAlert != "")
   {
      CreateLabel("Alert", offsetX, y, convAlert, cOrange, 11);
      y += lineH + 2;
   }
   
   // === 关键价位 ===
   CreateLabel("SRTitle", offsetX, y, "-- 关键价位 --", clrCyan, 12);
   y += lineH;
   
   CreateLabel("R2", offsetX + 5, y, "阻力2: " + DoubleToString(r2, digits) + " (" + DoubleToString((r2 - curPrice) / Point, 0) + "点)", clrGreen, 11);
   y += lineH;
   CreateLabel("R1", offsetX + 5, y, "阻力1: " + DoubleToString(r1, digits) + " (" + DoubleToString((r1 - curPrice) / Point, 0) + "点)", clrGreen, 11);
   y += lineH;
   CreateLabel("Cur", offsetX + 5, y, "当前价: " + DoubleToString(curPrice, digits), clrWhite, 11);
   y += lineH;
   CreateLabel("S1", offsetX + 5, y, "支撑1: " + DoubleToString(s1, digits) + " (" + DoubleToString((curPrice - s1) / Point, 0) + "点)", clrRed, 11);
   y += lineH;
   CreateLabel("S2", offsetX + 5, y, "支撑2: " + DoubleToString(s2, digits) + " (" + DoubleToString((curPrice - s2) / Point, 0) + "点)", clrRed, 11);
   y += lineH;
   
   // 交易参考建议
   double distR1 = MathAbs(r1 - curPrice) / Point;
   double distS1 = MathAbs(s1 - curPrice) / Point;
   string srAdvice = "";
   color srColor = cGray;
   if(distR1 < distS1 && distR1 < 200)
   {
      srAdvice = ">> 接近阻力: 可轻仓做空";
      srColor = clrGreen;
   }
   else if(distS1 < distR1 && distS1 < 200)
   {
      srAdvice = ">> 接近支撑: 可轻仓做多";
      srColor = clrRed;
   }
   else
   {
      srAdvice = ">> 价位中间: 等待接近支撑/阻力";
      srColor = cGray;
   }
   CreateLabel("SRAdvice", offsetX + 5, y, srAdvice, srColor, 11);
   y += lineH + 4;
   
   // === 交易计划（完整作战方案）===
   CreateLabel("PlanTitle", offsetX, y, "======== 交易计划 ========", clrGold, 12);
   y += lineH;
   
   if(g_direction != 0)
   {
      color planColor = (g_direction == 1) ? clrRed : clrGreen;
      string dirText = (g_direction == 1) ? "做多 BUY" : "做空 SELL";
      string dirIcon = (g_direction == 1) ? "▲" : "▼";
      
      // 第1行: 方向 + 计划类型
      CreateLabel("PlanDir", offsetX + 5, y, dirIcon + " " + dirText + " | " + g_planText, planColor, 12);
      y += lineH;
      
      // 第2行: 分隔线
      CreateLabel("PlanSep1", offsetX + 5, y, "--------------------", cGray, 10);
      y += lineH - 2;
      
      // 第3行: 进场价位
      CreateLabel("PlanEntry", offsetX + 5, y, "进场位: " + DoubleToString(g_entryPrice, digits), clrWhite, 12);
      y += lineH;
      
      // 第4行: 止损价位 + 点数 + 美元
      double slPoints = MathAbs(g_entryPrice - g_stopLoss) / Point;
      double slUSD = MathAbs(g_entryPrice - g_stopLoss);
      CreateLabel("PlanSL", offsetX + 5, y, "止损位: " + DoubleToString(g_stopLoss, digits) + " (" + DoubleToString(slPoints, 0) + "点 / $" + DoubleToString(slUSD, 2) + ")", cOrange, 12);
      y += lineH;
      
      // 第5行: 第一目标
      double tp1Points = MathAbs(g_takeProfit - g_entryPrice) / Point;
      double tp1USD = MathAbs(g_takeProfit - g_entryPrice);
      CreateLabel("PlanTP1", offsetX + 5, y, "目标1: " + DoubleToString(g_takeProfit, digits) + " (" + DoubleToString(tp1Points, 0) + "点 / $" + DoubleToString(tp1USD, 2) + ")", clrCyan, 12);
      y += lineH;
      
      // 第6行: 第二目标
      double tp2Points = MathAbs(g_takeProfit2 - g_entryPrice) / Point;
      double tp2USD = MathAbs(g_takeProfit2 - g_entryPrice);
      CreateLabel("PlanTP2", offsetX + 5, y, "目标2: " + DoubleToString(g_takeProfit2, digits) + " (" + DoubleToString(tp2Points, 0) + "点 / $" + DoubleToString(tp2USD, 2) + ")", clrAqua, 12);
      y += lineH;
      
      // 第7行: 分隔线
      CreateLabel("PlanSep2", offsetX + 5, y, "--------------------", cGray, 10);
      y += lineH - 2;
      
      // 第8行: 盈亏比
      double rr2 = (slUSD > 0) ? (tp2USD / slUSD) : 0;
      CreateLabel("PlanRR", offsetX + 5, y, "盈亏比: 1:" + DoubleToString(g_rrRatio, 1) + " (目标2: 1:" + DoubleToString(rr2, 1) + ")", clrYellow, 11);
      y += lineH;
      
      // 第9行: 仓位 + 风险
      double lot = CalculateLotSize(slPoints);
      double riskUSD = AccountBalance() * RiskPercent / 100.0;
      y += lineH;
      
      // 第10行: 操作建议
      string advice = "";
      if(g_direction == 1)
         advice = "→ 在支撑附近进多，止损设好，到目标1可平一半";
      else
         advice = "→ 在阻力附近进空，止损设好，到目标1可平一半";
      CreateLabel("PlanAdvice", offsetX + 5, y, advice, cGray, 10);
      y += lineH;
      
      // v37.2: 反转状态下追加红色紧急提示
      if(g_reverseAlert)
      {
         string exitAdvice = "⚠ 趋势已反转! 原方向(" + 
                             ((g_lastDirection==1)?"多":"空") + 
                             ")持仓建议立即平仓!";
         CreateLabel("PlanReverseExit", offsetX + 5, y, exitAdvice, clrRed, 12);
         y += lineH;
      }
   }
   else
   {
      // v37.1: 等待状态也必须明确多空方向, 避免用户判断错误
      // 方向由 H1+H4 趋势决定 (这是进场的前提)
      string waitDirText = "";
      color waitDirColor = cGray;
      color waitPlanColor = cGray;
      
      if(h1Trend == 1 && h4Trend == 1)
      {
         waitDirText = "▲ 准备做多 BUY  (等待条件满足)";
         waitDirColor = clrRed;
         waitPlanColor = clrYellow;
      }
      else if(h1Trend == -1 && h4Trend == -1)
      {
         waitDirText = "▼ 准备做空 SELL  (等待条件满足)";
         waitDirColor = clrGreen;
         waitPlanColor = clrYellow;
      }
      else
      {
         // H1与H4不同向, 确实没有方向
         waitDirText = "■ 方向未定 - H1与H4不同向, 暂不交易";
         waitDirColor = cGray;
         waitPlanColor = cGray;
      }
      
      // 第1行: 明确方向标识 (新增)
      CreateLabel("PlanWaitDir", offsetX + 5, y, waitDirText, waitDirColor, 12);
      y += lineH;
      
      // 第2行: 分隔线
      CreateLabel("PlanSepW0", offsetX + 5, y, "--------------------", cGray, 10);
      y += lineH - 2;
      
      // 第3行: 原计划文字
      CreateLabel("PlanWait", offsetX + 5, y, g_planText, waitPlanColor, 11);
      y += lineH;
      
      if(signalStrength >= 2 && g_direction == 0)
      {
         string waitText = "";
         if(h1Trend == 1 && m5Trend == -1)
            waitText = "等待: M5 RSI回升至40+ ▲做多";
         else if(h1Trend == -1 && m5Trend == 1)
            waitText = "等待: M5 RSI回落至60- ▼做空";
         else if(signalStrength >= 3)
            waitText = "等待: 盈亏比达到1:" + DoubleToString(MinRR, 1);
         
         if(waitText != "")
         {
            CreateLabel("PlanWait2", offsetX + 5, y, waitText, cOrange, 11);
            y += lineH;
         }
      }
      
      // 等待时显示支撑阻力作为参考目标
      CreateLabel("PlanSepW", offsetX + 5, y, "--------------------", cGray, 10);
      y += lineH - 2;
      CreateLabel("PlanRefS1", offsetX + 5, y, "参考支撑: " + DoubleToString(s1, digits) + " (▲可做多)", clrCyan, 11);
      y += lineH;
      CreateLabel("PlanRefR1", offsetX + 5, y, "参考阻力: " + DoubleToString(r1, digits) + " (▼可做空)", clrCyan, 11);
      y += lineH;
   }
   y += 2;
   
   // === 辅助信息 ===
   CreateLabel("InfoTitle", offsetX, y, "-- 辅助信息 --", clrCyan, 12);
   y += lineH;
   
   color sessionColor = clrWhite;
   y += lineH;
   
   color patternColor = clrWhite;
   if(StringFind(pattern, "看涨") >= 0 || StringFind(pattern, "锤子") >= 0) patternColor = clrRed;
   else if(StringFind(pattern, "看跌") >= 0 || StringFind(pattern, "射击") >= 0) patternColor = clrGreen;
   else if(StringFind(pattern, "十字") >= 0) patternColor = clrYellow;
   CreateLabel("Pattern", offsetX + 5, y, "形态: " + pattern, patternColor, 11);
   y += lineH;
   
   CreateLabel("ATR", offsetX + 5, y, "ATR(H1): " + DoubleToString(atrH1, 2) + "  ATR(M5): " + DoubleToString(atrM5, 2) + "  点差: " + DoubleToString(spread, 0) + "点", clrWhite, 11);
   y += lineH;
   
   // === v37.4: 布林带 ===
   double bbUpper = iBands(Symbol(), PERIOD_M15, 20, 2, 0, PRICE_CLOSE, MODE_UPPER, 0);
   double bbLower = iBands(Symbol(), PERIOD_M15, 20, 2, 0, PRICE_CLOSE, MODE_LOWER, 0);
   double bbMiddle = iBands(Symbol(), PERIOD_M15, 20, 2, 0, PRICE_CLOSE, MODE_MAIN, 0);
   double bbWidth = bbUpper - bbLower;
   double bbPos = (bbWidth > 0) ? (curPrice - bbLower) / bbWidth * 100.0 : 50.0;
   
   color bbColor = clrWhite;
   string bbState = "";
   if(bbPos > 80) { bbColor = clrRed; bbState = "接近上轨(超买)"; }
   else if(bbPos < 20) { bbColor = clrGreen; bbState = "接近下轨(超卖)"; }
   else if(bbPos > 50) { bbColor = clrYellow; bbState = "中轨上方"; }
   else { bbColor = clrYellow; bbState = "中轨下方"; }
   
   CreateLabel("BBTitle", offsetX, y, "-- 布林带 (M5) --", clrCyan, 12);
   y += lineH;
   CreateLabel("BBUpper", offsetX + 5, y, "上轨: " + DoubleToString(bbUpper, GetDigits()) + "  下轨: " + DoubleToString(bbLower, GetDigits()), clrWhite, 11);
   y += lineH;
   CreateLabel("BBPos", offsetX + 5, y, "位置: " + DoubleToString(bbPos, 1) + "% (" + bbState + ")", bbColor, 11);
   y += lineH;
   
   // === v37.4: MACD ===
   double macdMain = iMACD(Symbol(), PERIOD_M15, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 0);
   double macdSig = iMACD(Symbol(), PERIOD_M15, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, 0);
   double macdMain1 = iMACD(Symbol(), PERIOD_M15, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, 1);
   double macdHist = macdMain - macdSig;
   
   color macdColor = clrWhite;
   string macdState = "";
   if(macdMain > macdSig && macdMain > macdMain1) { macdColor = clrRed; macdState = "多头增强"; }
   else if(macdMain > macdSig && macdMain <= macdMain1) { macdColor = clrYellow; macdState = "多头减弱"; }
   else if(macdMain < macdSig && macdMain < macdMain1) { macdColor = clrGreen; macdState = "空头增强"; }
   else { macdColor = clrYellow; macdState = "空头减弱"; }
   
   CreateLabel("MACDTitle", offsetX, y, "-- MACD (M5) --", clrCyan, 12);
   y += lineH;
   CreateLabel("MACDVal", offsetX + 5, y, "MACD: " + DoubleToString(macdMain, 5) + "  信号: " + DoubleToString(macdSig, 5), clrWhite, 11);
   y += lineH;
   CreateLabel("MACDState", offsetX + 5, y, "柱状: " + DoubleToString(macdHist, 5) + " (" + macdState + ")", macdColor, 11);
   y += lineH;
   
   // v37.5: MACD与趋势矛盾警告
   g_macdConflict = false;
   g_macdConflictText = "";
   if(g_direction != 0)
   {
      // 方向空但MACD多头增强 = 矛盾
      if(g_direction == -1 && (macdState == "多头增强" || macdState == "多头减弱"))
      {
         g_macdConflict = true;
         g_macdConflictText = "⚠ MACD与做空矛盾! MACD" + macdState + " - 谨慎追空";
         CreateLabel("MACDConflict", offsetX + 5, y, g_macdConflictText, clrRed, 11);
         y += lineH;
      }
      // 方向多但MACD空头增强 = 矛盾
      else if(g_direction == 1 && (macdState == "空头增强" || macdState == "空头减弱"))
      {
         g_macdConflict = true;
         g_macdConflictText = "⚠ MACD与做多矛盾! MACD" + macdState + " - 谨慎追多";
         CreateLabel("MACDConflict", offsetX + 5, y, g_macdConflictText, clrRed, 11);
         y += lineH;
      }
   }
   
   // === v37.4: 成交量 ===
   double volNow = iVolume(Symbol(), PERIOD_M15, 0);
   double volAvg = 0;
   for(int vi = 1; vi <= 10; vi++) volAvg += iVolume(Symbol(), PERIOD_M15, vi);
   volAvg = volAvg / 10.0;
   double volRatio = (volAvg > 0) ? volNow / volAvg : 1.0;
   
   color volColor = clrWhite;
   string volState = "";
   if(volRatio > 1.5) { volColor = clrRed; volState = "放量"; }
   else if(volRatio > 1.0) { volColor = clrYellow; volState = "正常偏大"; }
   else if(volRatio > 0.7) { volColor = clrWhite; volState = "正常"; }
   else { volColor = cGray; volState = "缩量"; }
   
   CreateLabel("VolTitle", offsetX, y, "-- 成交量 (M5) --", clrCyan, 12);
   y += lineH;
   CreateLabel("VolVal", offsetX + 5, y, "当前: " + IntegerToString(volNow) + "  均值: " + IntegerToString(volAvg) + "  比值: " + DoubleToString(volRatio, 2) + "x (" + volState + ")", volColor, 11);
   y += lineH;
   
   // v37.3: 趋势质量评分 (独立于星级, 告诉你这个趋势的"成色")
   color qualityColor = cGray;
   if(g_trendQuality != "") {
      if(StringFind(g_trendQuality, "超强") >= 0) qualityColor = clrLime;
      else if(StringFind(g_trendQuality, "强(") >= 0) qualityColor = clrYellow;
      else if(StringFind(g_trendQuality, "中") >= 0) qualityColor = cOrange;
      else if(StringFind(g_trendQuality, "弱") >= 0) qualityColor = clrRed;
   }
   y += lineH;
   
   // === v27: 过滤状态显示 ===
   CreateLabel("FilterTitle", offsetX, y, "-- 过滤状态 (v27) --", clrCyan, 12);
   y += lineH;
   
   // 时段
   color fSession = g_sessionOK ? clrLime : clrRed;
   string fSessionTxt = g_sessionOK ? "OK" : "X";
   CreateLabel("FSession", offsetX + 5, y, "[" + fSessionTxt + "] 时段 " + session, fSession, 10);
   y += lineH - 4;
   
   // 新闻
   color fNews = g_newsOK ? clrLime : clrRed;
   string fNewsTxt = g_newsOK ? "OK" : "X";
   CreateLabel("FNews", offsetX + 5, y, "[" + fNewsTxt + "] 新闻过滤", fNews, 10);
   y += lineH - 4;
   
   // 趋势确认
   color fTrend = g_trendOK ? clrLime : clrRed;
   string fTrendTxt = g_trendOK ? "OK" : "X";
   CreateLabel("FTrend", offsetX + 5, y, "[" + fTrendTxt + "] H4+H1同向", fTrend, 10);
   y += lineH - 4;
   
   // 价格位置
   color fPrice = g_pricePosOK ? clrLime : clrRed;
   string fPriceTxt = g_pricePosOK ? "OK" : "X";
   CreateLabel("FPrice", offsetX + 5, y, "[" + fPriceTxt + "] 价格到位(S/R)", fPrice, 10);
   y += lineH - 4;
   
   // K线形态
   color fPattern = g_patternOK ? clrLime : clrRed;
   string fPatternTxt = g_patternOK ? "OK" : "X";
   CreateLabel("FPattern", offsetX + 5, y, "[" + fPatternTxt + "] 形态确认: " + pattern, fPattern, 10);
   y += lineH - 4;
   
   // 盈亏比
   color fRR = g_rrOK ? clrLime : clrRed;
   string fRRTxt = g_rrOK ? "OK" : "X";
   CreateLabel("FRR", offsetX + 5, y, "[" + fRRTxt + "] 盈亏比≥1:" + DoubleToString(MinRR, 1), fRR, 10);
   y += lineH - 4;
   
   // 点差
   color fSpread = g_spreadOK ? clrLime : clrRed;
   string fSpreadTxt = g_spreadOK ? "OK" : "X";
   CreateLabel("FSpread", offsetX + 5, y, "[" + fSpreadTxt + "] 点差≤" + IntegerToString(MaxSpreadPoints) + " (" + DoubleToString(spread, 0) + ")", fSpread, 10);
   y += lineH;
   
   // === 账户信息 ===
   double accBalance = AccountBalance();
   double accEquity = AccountEquity();
   double accProfit = accEquity - accBalance;
   color eqColor = (accProfit >= 0) ? clrRed : clrGreen;
   CreateLabel("AccInfo", offsetX + 5, y, "余额: $" + DoubleToString(accBalance, 2) + " | 净值: $" + DoubleToString(accEquity, 2), clrWhite, 11);
   y += lineH;
   
   string profitText = (accProfit >= 0) ? "浮盈: +$" : "浮亏: -$";
   CreateLabel("AccProfit", offsetX + 5, y, profitText + DoubleToString(MathAbs(accProfit), 2), eqColor, 11);
   y += lineH;
   
   // v26: 修复日内亏损显示, 确保只算今天的亏损单
   datetime todayLoss = iTime(Symbol(), PERIOD_D1, 0);
   int todayLossCount = 0;
   for(int hi = OrdersHistoryTotal() - 1; hi >= 0; hi--)
   {
      if(OrderSelect(hi, SELECT_BY_POS, MODE_HISTORY))
      {
         if(OrderSymbol() != Symbol()) continue;
         if(OrderCloseTime() < todayLoss) continue;
         if(OrderProfit() < 0) todayLossCount++;
      }
   }
   g_lossCountToday = todayLossCount;
   
   if(g_lossCountToday > 0)
   {
      color lossColor = (g_lossCountToday >= MaxLossPerDay) ? clrRed : cOrange;
      CreateLabel("DailyLoss", offsetX + 5, y, "日内亏损: " + IntegerToString(g_lossCountToday) + "/" + IntegerToString(MaxLossPerDay) + "单", lossColor, 11);
      y += lineH;
   }
   else
   {
      CreateLabel("DailyLoss", offsetX + 5, y, "日内亏损: 0/" + IntegerToString(MaxLossPerDay) + "单", cGray, 11);
      y += lineH;
   }
   
   PanelHeight = y + 30;
   ObjectSetInteger(0, indicatorPrefix + "Bg", OBJPROP_YSIZE, PanelHeight);
}

//+------------------------------------------------------------------+
//| 主函数                                                           |
//+------------------------------------------------------------------+
int start()
{
   int counted_bars = IndicatorCounted();
   if(counted_bars < 0) return(-1);
   if(counted_bars > 0) counted_bars--;
   
   int limit = Bars - counted_bars - 1;
   if(limit < 0) limit = 0;
   if(limit >= ArrayRange(Buffer1, 0)) limit = ArrayRange(Buffer1, 0) - 1;
   
   for(int i = limit; i >= 0; i--)
   {
      Buffer1[i] = EMPTY_VALUE;
      Buffer2[i] = EMPTY_VALUE;
      Buffer3[i] = EMPTY_VALUE;
      Buffer4[i] = EMPTY_VALUE;
      
      // v37.4: 布林带线绘制
      BBUpper[i] = iBands(Symbol(), PERIOD_M15, 20, 2, 0, PRICE_CLOSE, MODE_UPPER, i);
      BBLower[i] = iBands(Symbol(), PERIOD_M15, 20, 2, 0, PRICE_CLOSE, MODE_LOWER, i);
      BBMiddle[i] = iBands(Symbol(), PERIOD_M15, 20, 2, 0, PRICE_CLOSE, MODE_MAIN, i);
      
      double h1EmaFast = iMA(Symbol(), PERIOD_H1, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, i);
      double h1EmaSlow = iMA(Symbol(), PERIOD_H1, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, i);
      double h1MacdMain = iMACD(Symbol(), PERIOD_H1, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, i);
      double h1MacdSig = iMACD(Symbol(), PERIOD_H1, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, i);
      double h4Ema50 = iMA(Symbol(), PERIOD_H4, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, i);
      double h4Ema200 = iMA(Symbol(), PERIOD_H4, EMA_H4_Slow, 0, MODE_EMA, PRICE_CLOSE, i);
      double m5Rsi = iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, i);
      double m5Rsi1 = iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, i+1);
      double m5EmaFast = iMA(Symbol(), PERIOD_M15, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE, i);
      double m5EmaSlow = iMA(Symbol(), PERIOD_M15, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE, i);
      double m5EmaGap = MathAbs(m5EmaFast - m5EmaSlow);
      double m5Atr_val = iATR(Symbol(), PERIOD_M15, 14, i);
      
      int h4 = 0, h1 = 0, m5 = 0;
      if(h4Ema50 > h4Ema200) h4 = 1; else if(h4Ema50 < h4Ema200) h4 = -1;
      if(h1EmaFast > h1EmaSlow) h1 += 1; else if(h1EmaFast < h1EmaSlow) h1 -= 1;
      if(h1MacdMain > h1MacdSig) h1 += 1; else if(h1MacdMain < h1MacdSig) h1 -= 1;
      if(h1 >= 1) h1 = 1; else if(h1 <= -1) h1 = -1; else h1 = 0;
      // M5 新逻辑: RSI>55 + 前一根也>50 + 均线差距够大
      if(m5EmaFast > m5EmaSlow && m5EmaGap > m5Atr_val * 0.3 && m5Rsi > 55 && m5Rsi1 > 50)
         m5 = 1;
      else if(m5EmaFast < m5EmaSlow && m5EmaGap > m5Atr_val * 0.3 && m5Rsi < 45 && m5Rsi1 < 50)
         m5 = -1;
      
      if(h4 == 1 && h1 == 1 && m5Rsi > 40 && m5Rsi < 70 && 
         iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, i+1) < 40)
      {
         Buffer1[i] = Low[i] - 30 * Point;
      }
      
      if(h4 == -1 && h1 == -1 && m5Rsi < 60 && m5Rsi > 30 && 
         iRSI(Symbol(), PERIOD_M15, RSI_Period, PRICE_CLOSE, i+1) > 60)
      {
         Buffer2[i] = High[i] + 30 * Point;
      }
   }
   
   DrawDataPanel();
   
   return(0);
}
//+------------------------------------------------------------------+
