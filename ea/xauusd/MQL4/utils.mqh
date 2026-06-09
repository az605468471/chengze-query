//+------------------------------------------------------------------+
//|                                               utils.mqh         |
//|                                    XAUUSD 工具模块               |
//|                                          Author: MasterD        |
//+------------------------------------------------------------------+
#ifndef UTILS_MQH
#define UTILS_MQH

#include "config.mqh"

//+------------------------------------------------------------------+
//| 工具类                                                            |
//+------------------------------------------------------------------+
class CUtils
{
public:
   CUtils();
   ~CUtils();

   // 时间相关
   bool     IsTradeTime();
   bool     IsNewsTime();
   int      GetBeijingHour();
   string   GetTradeSession();

   // 价格相关
   double   GetSpread();
   double   GetBid();
   double   GetAsk();
   double   GetClose(int shift);
   double   GetHigh(int shift);
   double   GetLow(int shift);
   double   GetOpen(int shift);

   // 指标相关
   double   GetEMA(int period, int shift);
   double   GetRSI(int period, int shift);
   double   GetATR(int period, int shift);
   double   GetMACD(int mode, int shift);

   // 交易相关
   int      CountPositions();
   int      CountOrders();
   double   GetTotalProfit();
   double   GetDailyProfit();
   void     CloseAllPositions();
   void     CloseAllOrders();

   // 报警相关
   void     SendAlert(string message, int type = 0);
   void     SendNotification(string message);
   void     SendEmail(string subject, string body);

   // 日志相关
   void     Log(string message);
   void     LogError(string message);
   void     LogTrade(string symbol, int type, double lots, double price, double sl, double tp, double profit);

   // 数据相关
   bool     SaveData(string filename, string data);
   string   LoadData(string filename);
   string   GetTimestamp();
};

//+------------------------------------------------------------------+
//| 构造函数                                                          |
//+------------------------------------------------------------------+
CUtils::CUtils()
{
   // 初始化
}

//+------------------------------------------------------------------+
//| 析构函数                                                          |
//+------------------------------------------------------------------+
CUtils::~CUtils()
{
   // 清理资源
}

//+------------------------------------------------------------------+
//| 检查交易时间                                                      |
//+------------------------------------------------------------------+
bool CUtils::IsTradeTime()
{
   int hour = GetBeijingHour();

   // 主要交易时段
   // 亚盘：8:00-15:00
   // 欧盘：15:00-20:30
   // 美盘：20:30-03:00

   // 欧盘+美盘时段最佳
   if (hour >= 15 && hour < 24)
   {
      return true;
   }

   return false;
}

//+------------------------------------------------------------------+
//| 检查是否是新闻时间                                                |
//+------------------------------------------------------------------+
bool CUtils::IsNewsTime()
{
   // 这里可以接入新闻API，简化处理
   // 重大数据发布时间：非农、CPI、利率决议等
   // 通常在每月第一个周五（非农）、每月中旬（CPI）等

   // 简化：避开每月第一个周五的20:30
   if (DayOfWeek() == 5 && Day() <= 7)
   {
      int hour = GetBeijingHour();
      if (hour >= 20 && hour <= 22)
      {
         return true;
      }
   }

   return false;
}

//+------------------------------------------------------------------+
//| 获取北京时间                                                      |
//+------------------------------------------------------------------+
int CUtils::GetBeijingHour()
{
   int hour = Hour();
   int beijingHour = (hour + 8) % 24;
   return beijingHour;
}

//+------------------------------------------------------------------+
//| 获取交易时段                                                      |
//+------------------------------------------------------------------+
string CUtils::GetTradeSession()
{
   int hour = GetBeijingHour();

   if (hour >= 8 && hour < 15)
   {
      return "亚盘";
   }
   else if (hour >= 15 && hour < 20)
   {
      return "欧盘";
   }
   else if (hour >= 20 || hour < 3)
   {
      return "美盘";
   }
   else
   {
      return "休市";
   }
}

//+------------------------------------------------------------------+
//| 获取点差                                                          |
//+------------------------------------------------------------------+
double CUtils::GetSpread()
{
   return MarketInfo(Symbol(), MODE_SPREAD);
}

//+------------------------------------------------------------------+
//| 获取买价                                                          |
//+------------------------------------------------------------------+
double CUtils::GetBid()
{
   return MarketInfo(Symbol(), MODE_BID);
}

//+------------------------------------------------------------------+
//| 获取卖价                                                          |
//+------------------------------------------------------------------+
double CUtils::GetAsk()
{
   return MarketInfo(Symbol(), MODE_ASK);
}

//+------------------------------------------------------------------+
//| 获取收盘价                                                        |
//+------------------------------------------------------------------+
double CUtils::GetClose(int shift)
{
   return iClose(Symbol(), 0, shift);
}

//+------------------------------------------------------------------+
//| 获取最高价                                                        |
//+------------------------------------------------------------------+
double CUtils::GetHigh(int shift)
{
   return iHigh(Symbol(), 0, shift);
}

//+------------------------------------------------------------------+
//| 获取最低价                                                        |
//+------------------------------------------------------------------+
double CUtils::GetLow(int shift)
{
   return iLow(Symbol(), 0, shift);
}

//+------------------------------------------------------------------+
//| 获取开盘价                                                        |
//+------------------------------------------------------------------+
double CUtils::GetOpen(int shift)
{
   return iOpen(Symbol(), 0, shift);
}

//+------------------------------------------------------------------+
//| 获取EMA值                                                         |
//+------------------------------------------------------------------+
double CUtils::GetEMA(int period, int shift)
{
   return iMA(Symbol(), 0, period, 0, MODE_EMA, PRICE_CLOSE, shift);
}

//+------------------------------------------------------------------+
//| 获取RSI值                                                         |
//+------------------------------------------------------------------+
double CUtils::GetRSI(int period, int shift)
{
   return iRSI(Symbol(), 0, period, PRICE_CLOSE, shift);
}

//+------------------------------------------------------------------+
//| 获取ATR值                                                         |
//+------------------------------------------------------------------+
double CUtils::GetATR(int period, int shift)
{
   return iATR(Symbol(), 0, period, shift);
}

//+------------------------------------------------------------------+
//| 获取MACD值                                                        |
//+------------------------------------------------------------------+
double CUtils::GetMACD(int mode, int shift)
{
   if (mode == MODE_MAIN)
   {
      return iMACD(Symbol(), 0, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_MAIN, shift);
   }
   else
   {
      return iMACD(Symbol(), 0, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE, MODE_SIGNAL, shift);
   }
}

//+------------------------------------------------------------------+
//| 统计持仓数                                                        |
//+------------------------------------------------------------------+
int CUtils::CountPositions()
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
//| 统计订单数                                                        |
//+------------------------------------------------------------------+
int CUtils::CountOrders()
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
//| 获取总利润                                                        |
//+------------------------------------------------------------------+
double CUtils::GetTotalProfit()
{
   double profit = 0;
   for (int i = 0; i < OrdersTotal(); i++)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if (OrderMagicNumber() == MagicNumber)
         {
            profit += OrderProfit() + OrderSwap() + OrderCommission();
         }
      }
   }
   return profit;
}

//+------------------------------------------------------------------+
//| 获取今日利润                                                      |
//+------------------------------------------------------------------+
double CUtils::GetDailyProfit()
{
   double profit = 0;
   datetime todayStart = iTime(Symbol(), PERIOD_D1, 0);

   for (int i = 0; i < OrdersHistoryTotal(); i++)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         if (OrderMagicNumber() == MagicNumber && OrderCloseTime() >= todayStart)
         {
            profit += OrderProfit() + OrderSwap() + OrderCommission();
         }
      }
   }
   return profit;
}

//+------------------------------------------------------------------+
//| 平所有仓位                                                        |
//+------------------------------------------------------------------+
void CUtils::CloseAllPositions()
{
   for (int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if (OrderMagicNumber() == MagicNumber)
         {
            if (OrderType() == OP_BUY)
            {
               OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrYellow);
            }
            else if (OrderType() == OP_SELL)
            {
               OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrYellow);
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 撤所有订单                                                        |
//+------------------------------------------------------------------+
void CUtils::CloseAllOrders()
{
   for (int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if (OrderMagicNumber() == MagicNumber)
         {
            OrderDelete(OrderTicket());
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 发送报警                                                          |
//+------------------------------------------------------------------+
void CUtils::SendAlert(string message, int type)
{
   // 发送到MT4/MT5 App
   SendNotification(message);

   // 发送邮件
   if (AlertEmail)
   {
      SendEmail("XAUUSD EA 报警", message);
   }

   // 记录日志
   Log(message);
}

//+------------------------------------------------------------------+
//| 发送通知                                                          |
//+------------------------------------------------------------------+
void CUtils::SendNotification(string message)
{
   // 使用MT4内置通知
   SendNotification(message);
}

//+------------------------------------------------------------------+
//| 发送邮件                                                          |
//+------------------------------------------------------------------+
void CUtils::SendEmail(string subject, string body)
{
   // 使用MT4内置邮件
   SendMail(subject, body);
}

//+------------------------------------------------------------------+
//| 记录日志                                                          |
//+------------------------------------------------------------------+
void CUtils::Log(string message)
{
   string timestamp = GetTimestamp();
   Print("[", timestamp, "] ", message);
}

//+------------------------------------------------------------------+
//| 记录错误日志                                                      |
//+------------------------------------------------------------------+
void CUtils::LogError(string message)
{
   string timestamp = GetTimestamp();
   Print("[", timestamp, "] ❌ ERROR: ", message);
}

//+------------------------------------------------------------------+
//| 记录交易日志                                                      |
//+------------------------------------------------------------------+
void CUtils::LogTrade(string symbol, int type, double lots, double price, double sl, double tp, double profit)
{
   string timestamp = GetTimestamp();
   string typeStr = (type == OP_BUY) ? "BUY" : "SELL";

   string message = StringFormat(
      "[TRADE] %s %s %.2f @ %.5f SL=%.5f TP=%.5f P/L=%.2f",
      timestamp, symbol, typeStr, lots, price, sl, tp, profit
   );

   Print(message);

   // 保存到文件
   string filename = "XAUUSD_TradeLog_" + TimeToString(TimeCurrent(), TIME_DATE) + ".log";
   SaveData(filename, message);
}

//+------------------------------------------------------------------+
//| 保存数据                                                          |
//+------------------------------------------------------------------+
bool CUtils::SaveData(string filename, string data)
{
   int handle = FileOpen(filename, FILE_WRITE | FILE_READ | FILE_TXT | FILE_SHARE_READ | FILE_SHARE_WRITE);
   if (handle == INVALID_HANDLE)
   {
      return false;
   }

   FileSeek(handle, 0, SEEK_END);
   FileWriteString(handle, data + "\n");
   FileClose(handle);

   return true;
}

//+------------------------------------------------------------------+
//| 加载数据                                                          |
//+------------------------------------------------------------------+
string CUtils::LoadData(string filename)
{
   int handle = FileOpen(filename, FILE_READ | FILE_TXT | FILE_SHARE_READ | FILE_SHARE_WRITE);
   if (handle == INVALID_HANDLE)
   {
      return "";
   }

   string data = "";
   while (!FileIsEnding(handle))
   {
      data += FileReadString(handle) + "\n";
   }

   FileClose(handle);
   return data;
}

//+------------------------------------------------------------------+
//| 获取时间戳                                                        |
//+------------------------------------------------------------------+
string CUtils::GetTimestamp()
{
   return TimeToString(TimeCurrent(), TIME_DATE | TIME_SECONDS);
}

//+------------------------------------------------------------------+
#endif