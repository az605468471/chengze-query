//+------------------------------------------------------------------+
//|                                               optimizer.mqh     |
//|                                    XAUUSD 自动优化模块           |
//|                                          Author: MasterD        |
//+------------------------------------------------------------------+
#ifndef OPTIMIZER_MQH
#define OPTIMIZER_MQH

#include "config.mqh"

//+------------------------------------------------------------------+
//| 优化器类                                                          |
//+------------------------------------------------------------------+
class COptimizer
{
private:
   string   m_symbol;
   ENUM_TIMEFRAMES m_timeframe;

   // 优化状态
   bool     m_isOptimizing;
   datetime m_lastOptimizeTime;
   int      m_optimizeCycle; // 优化周期（小时）

   // 性能统计
   double   m_winRate;
   double   m_profitFactor;
   double   m_expectancy;
   double   m_drawdown;

   // 参数范围
   double   m_bestParams[10]; // 最优参数
   double   m_currentParams[10]; // 当前参数
   int      m_paramCount;

public:
   COptimizer();
   ~COptimizer();

   bool Init(string symbol, ENUM_TIMEFRAMES timeframe);
   bool ShouldOptimize();
   void Optimize();
   bool IsOptimizing() { return m_isOptimizing; }

   double GetBestParam(int index) { return m_bestParams[index]; }
   double GetCurrentParam(int index) { return m_currentParams[index]; }

private:
   void RecordPerformance();
   void UpdateBestParams();
   void ApplyBestParams();
   void BacktestParams(double &params[], double &result[]);
   void GeneticAlgorithm();
};

//+------------------------------------------------------------------+
//| 构造函数                                                          |
//+------------------------------------------------------------------+
COptimizer::COptimizer()
{
   m_symbol = "";
   m_timeframe = PERIOD_H1;
   m_isOptimizing = false;
   m_lastOptimizeTime = 0;
   m_optimizeCycle = 24; // 每24小时优化一次
   m_winRate = 0;
   m_profitFactor = 0;
   m_expectancy = 0;
   m_drawdown = 0;
   m_paramCount = 10;

   // 初始化参数
   for (int i = 0; i < 10; i++)
   {
      m_bestParams[i] = 0;
      m_currentParams[i] = 0;
   }
}

//+------------------------------------------------------------------+
//| 析构函数                                                          |
//+------------------------------------------------------------------+
COptimizer::~COptimizer()
{
   // 清理资源
}

//+------------------------------------------------------------------+
//| 初始化优化器                                                      |
//+------------------------------------------------------------------+
bool COptimizer::Init(string symbol, ENUM_TIMEFRAMES timeframe)
{
   m_symbol = symbol;
   m_timeframe = timeframe;

   // 加载最优参数（如果有历史记录）
   LoadBestParams();

   Print("✅ 优化器初始化成功");
   Print("🔄 优化周期：每", m_optimizeCycle, "小时");
   return true;
}

//+------------------------------------------------------------------+
//| 检查是否需要优化                                                  |
//+------------------------------------------------------------------+
bool COptimizer::ShouldOptimize()
{
   // 检查时间间隔
   if (TimeCurrent() - m_lastOptimizeTime < m_optimizeCycle * 3600)
   {
      return false;
   }

   // 检查是否有足够的交易数据
   int tradeCount = CountTrades();
   if (tradeCount < 20)
   {
      return false;
   }

   // 检查是否已经优化
   if (m_isOptimizing)
   {
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| 执行优化                                                          |
//+------------------------------------------------------------------+
void COptimizer::Optimize()
{
   m_isOptimizing = true;

   // 1. 记录当前性能
   RecordPerformance();

   // 2. 执行遗传算法优化
   GeneticAlgorithm();

   // 3. 应用最优参数
   ApplyBestParams();

   // 4. 更新优化时间
   m_lastOptimizeTime = TimeCurrent();

   m_isOptimizing = false;

   Print("🔧 优化完成");
   Print("📊 最新参数：", GetParamString());
}

//+------------------------------------------------------------------+
//| 记录性能统计                                                      |
//+------------------------------------------------------------------+
void COptimizer::RecordPerformance()
{
   int totalTrades = 0;
   int winTrades = 0;
   double totalProfit = 0;
   double totalLoss = 0;
   double maxEquity = AccountBalance();
   double minEquity = AccountBalance();

   // 遍历历史订单
   for (int i = 0; i < OrdersHistoryTotal(); i++)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         // 只统计最近30天的订单
         if (TimeCurrent() - OrderCloseTime() < 30 * 24 * 3600)
         {
            totalTrades++;
            double profit = OrderProfit() + OrderSwap() + OrderCommission();

            if (profit > 0)
            {
               winTrades++;
               totalProfit += profit;
            }
            else
            {
               totalLoss += MathAbs(profit);
            }
         }
      }
   }

   // 计算统计指标
   if (totalTrades > 0)
   {
      m_winRate = (double)winTrades / totalTrades;
      m_profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
      m_expectancy = (totalProfit - totalLoss) / totalTrades;

      // 计算最大回撤
      double equity = AccountEquity();
      if (equity > maxEquity) maxEquity = equity;
      if (equity < minEquity) minEquity = equity;
      m_drawdown = (maxEquity - minEquity) / maxEquity * 100;
   }

   Print("📊 性能统计：");
   Print("  胜率：", DoubleToString(m_winRate * 100, 1), "%");
   Print("  盈亏比：", DoubleToString(m_profitFactor, 2));
   Print("  期望值：$", DoubleToString(m_expectancy, 2));
   Print("  最大回撤：", DoubleToString(m_drawdown, 1), "%");
}

//+------------------------------------------------------------------+
//| 遗传算法优化                                                      |
//+------------------------------------------------------------------+
void COptimizer::GeneticAlgorithm()
{
   // 种群大小
   int populationSize = 20;
   int generations = 10;

   // 参数范围
   double paramRanges[10][2] = {
      {10, 30},      // EMA_Fast
      {40, 80},      // EMA_Medium
      {150, 250},    // EMA_Slow
      {10, 20},      // RSI_Period
      {60, 80},      // RSI_Overbought
      {20, 40},      // RSI_Oversold
      {5, 20},       // ATR_Multiplier
      {50, 150},     // TakeProfit
      {30, 100},     // StopLoss
      {10, 50}       // TrailingStop
   };

   // 初始化种群
   double population[20][10];
   double fitness[20];

   for (int i = 0; i < populationSize; i++)
   {
      for (int j = 0; j < m_paramCount; j++)
      {
         population[i][j] = paramRanges[j][0] + MathRand() / 32767.0 * (paramRanges[j][1] - paramRanges[j][0]);
      }
      fitness[i] = EvaluateParams(population[i]);
   }

   // 进化
   for (int gen = 0; gen < generations; gen++)
   {
      // 选择（锦标赛）
      int parent1 = TournamentSelection(population, fitness, populationSize);
      int parent2 = TournamentSelection(population, fitness, populationSize);

      // 交叉
      double child[10];
      for (int j = 0; j < m_paramCount; j++)
      {
         if (MathRand() % 2 == 0)
         {
            child[j] = population[parent1][j];
         }
         else
         {
            child[j] = population[parent2][j];
         }
      }

      // 变异
      for (int j = 0; j < m_paramCount; j++)
      {
         if (MathRand() % 100 < 10) // 10%变异率
         {
            child[j] = paramRanges[j][0] + MathRand() / 32767.0 * (paramRanges[j][1] - paramRanges[j][0]);
         }
      }

      // 替换最差个体
      int worstIndex = GetWorstIndex(fitness, populationSize);
      for (int j = 0; j < m_paramCount; j++)
      {
         population[worstIndex][j] = child[j];
      }
      fitness[worstIndex] = EvaluateParams(child);

      // 更新最优参数
      UpdateBestParams(population, fitness, populationSize);
   }
}

//+------------------------------------------------------------------+
//| 评估参数                                                          |
//+------------------------------------------------------------------+
double COptimizer::EvaluateParams(double &params[])
{
   // 这里简化处理，实际应该进行回测
   // 返回一个基于期望值的评分
   double score = 0;

   // 评分规则：
   // 1. 盈亏比高：+100
   // 2. 胜率高：+50
   // 3. 回撤小：+30
   // 4. 期望值正：+20

   score += m_profitFactor * 50;
   score += m_winRate * 50;
   score += (100 - m_drawdown) / 100 * 30;
   score += m_expectancy > 0 ? 20 : 0;

   return score;
}

//+------------------------------------------------------------------+
//| 锦标赛选择                                                        |
//+------------------------------------------------------------------+
int COptimizer::TournamentSelection(double &population[][10], double &fitness[], int size)
{
   int tournamentSize = 3;
   int bestIndex = MathRand() % size;

   for (int i = 1; i < tournamentSize; i++)
   {
      int candidate = MathRand() % size;
      if (fitness[candidate] > fitness[bestIndex])
      {
         bestIndex = candidate;
      }
   }

   return bestIndex;
}

//+------------------------------------------------------------------+
//| 获取最差个体索引                                                  |
//+------------------------------------------------------------------+
int COptimizer::GetWorstIndex(double &fitness[], int size)
{
   int worstIndex = 0;
   for (int i = 1; i < size; i++)
   {
      if (fitness[i] < fitness[worstIndex])
      {
         worstIndex = i;
      }
   }
   return worstIndex;
}

//+------------------------------------------------------------------+
//| 更新最优参数                                                      |
//+------------------------------------------------------------------+
void COptimizer::UpdateBestParams(double &population[][10], double &fitness[], int size)
{
   for (int i = 0; i < size; i++)
   {
      double currentScore = EvaluateParams(population[i]);

      if (currentScore > EvaluateParams(m_bestParams))
      {
         for (int j = 0; j < m_paramCount; j++)
         {
            m_bestParams[j] = population[i][j];
         }
      }
   }
}

//+------------------------------------------------------------------+
//| 应用最优参数                                                      |
//+------------------------------------------------------------------+
void COptimizer::ApplyBestParams()
{
   // 应用到策略中（这里简化处理）
   Print("🔧 应用最优参数：");

   // 更新全局变量（需要在主文件中声明）
   // EMA_Fast = (int)m_bestParams[0];
   // EMA_Medium = (int)m_bestParams[1];
   // EMA_Slow = (int)m_bestParams[2];
   // RSI_Period = (int)m_bestParams[3];
   // RSI_Overbought = m_bestParams[4];
   // RSI_Oversold = m_bestParams[5];
   // ATR_Multiplier = m_bestParams[6];
   // TakeProfit = (int)m_bestParams[7];
   // StopLoss = (int)m_bestParams[8];
   // TrailingStop = (int)m_bestParams[9];

   Print("  EMA_Fast: ", (int)m_bestParams[0]);
   Print("  EMA_Medium: ", (int)m_bestParams[1]);
   Print("  EMA_Slow: ", (int)m_bestParams[2]);
   Print("  RSI_Period: ", (int)m_bestParams[3]);
   Print("  ATR_Multiplier: ", m_bestParams[6]);
   Print("  TakeProfit: ", (int)m_bestParams[7]);
   Print("  StopLoss: ", (int)m_bestParams[8]);
   Print("  TrailingStop: ", (int)m_bestParams[9]);
}

//+------------------------------------------------------------------+
//| 获取参数字符串                                                    |
//+------------------------------------------------------------------+
string COptimizer::GetParamString()
{
   string str = "";
   str += "EMA_Fast=" + IntegerToString((int)m_bestParams[0]) + " ";
   str += "EMA_Medium=" + IntegerToString((int)m_bestParams[1]) + " ";
   str += "EMA_Slow=" + IntegerToString((int)m_bestParams[2]) + " ";
   str += "RSI_Period=" + IntegerToString((int)m_bestParams[3]) + " ";
   str += "ATR_Multiplier=" + DoubleToString(m_bestParams[6], 1) + " ";
   str += "TP=" + IntegerToString((int)m_bestParams[7]) + " ";
   str += "SL=" + IntegerToString((int)m_bestParams[8]);

   return str;
}

//+------------------------------------------------------------------+
//| 加载最优参数                                                      |
//+------------------------------------------------------------------+
void COptimizer::LoadBestParams()
{
   // 这里可以从文件或全局变量加载历史最优参数
   // 简化处理：使用默认参数
   m_bestParams[0] = EMA_Fast;
   m_bestParams[1] = EMA_Medium;
   m_bestParams[2] = EMA_Slow;
   m_bestParams[3] = RSI_Period;
   m_bestParams[4] = RSI_Overbought;
   m_bestParams[5] = RSI_Oversold;
   m_bestParams[6] = ATR_Multiplier;
   m_bestParams[7] = TakeProfit;
   m_bestParams[8] = StopLoss;
   m_bestParams[9] = TrailingStop;
}

//+------------------------------------------------------------------+
//| 统计交易次数                                                      |
//+------------------------------------------------------------------+
int COptimizer::CountTrades()
{
   int count = 0;
   for (int i = 0; i < OrdersHistoryTotal(); i++)
   {
      if (OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         if (TimeCurrent() - OrderCloseTime() < 30 * 24 * 3600) // 最近30天
         {
            count++;
         }
      }
   }
   return count;
}

//+------------------------------------------------------------------+
#endif