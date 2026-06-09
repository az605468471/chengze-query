//+------------------------------------------------------------------+
//|                                               risk.mqh          |
//|                                    XAUUSD 风险管理模块           |
//|                                          Author: MasterD        |
//+------------------------------------------------------------------+
#ifndef RISK_MQH
#define RISK_MQH

#include "config.mqh"

//+------------------------------------------------------------------+
//| 风险管理类                                                        |
//+------------------------------------------------------------------+
class CRiskManager
{
private:
   double   m_initialBalance;
   double   m_riskPercent;
   double   m_maxDrawdown;
   double   m_currentEquity;
   double   m_maxEquity;

   // 风险状态
   bool     m_canTrade;
   datetime m_lastCheckTime;

public:
   CRiskManager();
   ~CRiskManager();

   bool Init(double initialBalance, double riskPercent, double maxDrawdown);
   void Update(double equity, double balance);

   bool CanTrade() { return m_canTrade; }
   double CalculateLotSize(string symbol, int stopLoss, double defaultLot, double minLot, double maxLot);

   double GetDrawdown() { return (m_maxEquity - m_currentEquity) / m_maxEquity * 100; }
   double GetRiskPercent() { return m_riskPercent; }
   double GetMaxDrawdown() { return m_maxDrawdown; }

   void   SetRiskPercent(double percent) { m_riskPercent = percent; }
   void   SetMaxDrawdown(double drawdown) { m_maxDrawdown = drawdown; }

private:
   bool   CheckDrawdownLimit();
   bool   CheckDailyLossLimit();
   bool   CheckConsecutiveLossLimit();
};

//+------------------------------------------------------------------+
//| 构造函数                                                          |
//+------------------------------------------------------------------+
CRiskManager::CRiskManager()
{
   m_initialBalance = 0;
   m_riskPercent = 2.0;
   m_maxDrawdown = 10.0;
   m_currentEquity = 0;
   m_maxEquity = 0;
   m_canTrade = true;
   m_lastCheckTime = 0;
}

//+------------------------------------------------------------------+
//| 析构函数                                                          |
//+------------------------------------------------------------------+
CRiskManager::~CRiskManager()
{
   // 清理资源
}

//+------------------------------------------------------------------+
//| 初始化风险管理器                                                  |
//+------------------------------------------------------------------+
bool CRiskManager::Init(double initialBalance, double riskPercent, double maxDrawdown)
{
   m_initialBalance = initialBalance;
   m_riskPercent = riskPercent;
   m_maxDrawdown = maxDrawdown;
   m_currentEquity = initialBalance;
   m_maxEquity = initialBalance;
   m_canTrade = true;

   Print("✅ 风险管理器初始化成功");
   Print("  初始资金：$", m_initialBalance);
   Print("  单笔风险：", m_riskPercent, "%");
   Print("  最大回撤：", m_maxDrawdown, "%");

   return true;
}

//+------------------------------------------------------------------+
//| 更新风险状态                                                      |
//+------------------------------------------------------------------+
void CRiskManager::Update(double equity, double balance)
{
   m_currentEquity = equity;

   // 更新最高净值
   if (equity > m_maxEquity)
   {
      m_maxEquity = equity;
   }

   // 检查是否可以交易
   m_canTrade = CheckDrawdownLimit();

   // 每天检查一次
   if (TimeCurrent() - m_lastCheckTime > 24 * 3600)
   {
      m_lastCheckTime = TimeCurrent();

      // 检查每日损失限制
      if (!CheckDailyLossLimit())
      {
         m_canTrade = false;
         Print("⚠️ 达到每日损失限制，停止交易");
      }

      // 检查连续亏损限制
      if (!CheckConsecutiveLossLimit())
      {
         m_canTrade = false;
         Print("⚠️ 达到连续亏损限制，停止交易");
      }
   }

   // 记录风险状态
   if (!m_canTrade)
   {
      Print("🔴 风险控制触发，停止交易");
   }
}

//+------------------------------------------------------------------+
//| 计算手数                                                          |
//+------------------------------------------------------------------+
double CRiskManager::CalculateLotSize(string symbol, int stopLoss, double defaultLot, double minLot, double maxLot)
{
   // 如果风险管理不允许交易，返回最小手数
   if (!m_canTrade)
   {
      return minLot;
   }

   // 计算风险金额
   double riskAmount = m_currentEquity * m_riskPercent / 100;

   // 获取当前价格
   double price = MarketInfo(symbol, MODE_ASK);
   if (price == 0) price = MarketInfo(symbol, MODE_BID);

   // 计算止损金额（每手）
   double tickValue = MarketInfo(symbol, MODE_TICKVALUE);
   double tickSize = MarketInfo(symbol, MODE_TICKSIZE);

   if (tickValue == 0 || tickSize == 0 || stopLoss == 0)
   {
      return defaultLot;
   }

   // 计算止损金额
   double slAmount = stopLoss * tickValue / tickSize;

   // 计算手数
   double lots = riskAmount / slAmount;

   // 应用限制
   if (lots < minLot) lots = minLot;
   if (lots > maxLot) lots = maxLot;

   // 根据净值动态调整
   double equityRatio = m_currentEquity / m_initialBalance;
   if (equityRatio > 1.5)
   {
      // 净值增长50%以上，可以适当增加手数
      lots *= 1.2;
   }
   else if (equityRatio < 0.7)
   {
      // 净值减少30%以上，减少手数
      lots *= 0.7;
   }

   // 再次应用限制
   if (lots < minLot) lots = minLot;
   if (lots > maxLot) lots = maxLot;

   // 格式化手数
   lots = NormalizeDouble(lots, 2);

   Print("📊 手数计算：");
   Print("  风险金额：$", riskAmount);
   Print("  止损点数：", stopLoss);
   Print("  计算手数：", lots);

   return lots;
}

//+------------------------------------------------------------------+
//| 检查回撤限制                                                      |
//+------------------------------------------------------------------+
bool CRiskManager::CheckDrawdownLimit()
{
   double drawdown = GetDrawdown();

   if (drawdown >= m_maxDrawdown)
   {
      Print("⚠️ 达到最大回撤限制：", DoubleToString(drawdown, 1), "%");
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| 检查每日损失限制                                                  |
//+------------------------------------------------------------------+
bool CRiskManager::CheckDailyLossLimit()
{
   // 计算今日损失
   double todayProfit = 0;
   datetime todayStart = iTime(Symbol(), PERIOD_D1, 0);

   for (int i = 0; i < OrdersHistoryTotal(); i++)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         if (OrderCloseTime() >= todayStart)
         {
            todayProfit += OrderProfit() + OrderSwap() + OrderCommission();
         }
      }
   }

   // 如果今日损失超过账户的5%，停止交易
   if (todayProfit < -m_currentEquity * 0.05)
   {
      Print("⚠️ 今日损失：$", DoubleToString(todayProfit, 2));
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| 检查连续亏损限制                                                  |
//+------------------------------------------------------------------+
bool CRiskManager::CheckConsecutiveLossLimit()
{
   // 统计最近10笔交易的连续亏损
   int consecutiveLoss = 0;
   int maxConsecutiveLoss = 5;

   for (int i = OrdersHistoryTotal() - 1; i >= 0 && consecutiveLoss < maxConsecutiveLoss; i--)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         double profit = OrderProfit() + OrderSwap() + OrderCommission();
         if (profit < 0)
         {
            consecutiveLoss++;
         }
         else
         {
            break;
         }
      }
   }

   if (consecutiveLoss >= maxConsecutiveLoss)
   {
      Print("⚠️ 连续亏损次数：", consecutiveLoss);
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
#endif