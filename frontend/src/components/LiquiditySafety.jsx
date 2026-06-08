import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function LiquiditySafety({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.liquiditySafety')}
        </h3>
        <p className="text-gray-400">No liquidity safety data available</p>
      </div>
    );
  }
  
  // 计算流动性安全得分
  const lockedScore = data.lpLocked ? 25 : 0;
  const depthScore = data.liquidityDepth > 10000 ? 25 : data.liquidityDepth > 5000 ? 15 : 0;
  const rugPullScore = data.rugPullRisk === 'low' ? 25 : data.rugPullRisk === 'medium' ? 15 : 0;
  const slippageScore = data.slippage < 5 ? 25 : data.slippage < 10 ? 15 : 0;
  
  const totalScore = lockedScore + depthScore + rugPullScore + slippageScore;
  
  const getColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('results.liquiditySafety')}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">{t('liquiditySafety.score')}</span>
          <span className={`text-2xl font-bold ${getColor(totalScore)}`}>{totalScore}/100</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getBarColor(totalScore)}`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>
      
      {/* 详细指标 */}
      <div className="space-y-4">
        {/* LP 锁定 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('liquiditySafety.lpLocked')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.lpLocked ? '✅ LP 已锁定，跑路风险低' : '⚠️ LP 未锁定，存在跑路风险'}
            </p>
          </div>
          <span className={`font-bold ${data.lpLocked ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.lpLocked ? '+25' : '0'}
          </span>
        </div>
        
        {/* 流动性深度 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('liquiditySafety.liquidityDepth')}</span>
            <p className="text-gray-400 text-sm mt-1">
              深度：${data.liquidityDepth?.toLocaleString() || '0'}
            </p>
          </div>
          <span className={`font-bold ${data.liquidityDepth > 10000 ? 'text-green-400' : data.liquidityDepth > 5000 ? 'text-yellow-400' : 'text-red-400'}`}>
            {data.liquidityDepth > 10000 ? '+25' : data.liquidityDepth > 5000 ? '+15' : '0'}
          </span>
        </div>
        
        {/* 跑路风险 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('liquiditySafety.rugPullRisk')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.rugPullRisk === 'low' ? '🟢 低风险' : data.rugPullRisk === 'medium' ? '🟡 中等风险' : '🔴 高风险'}
            </p>
          </div>
          <span className={`font-bold ${data.rugPullRisk === 'low' ? 'text-green-400' : data.rugPullRisk === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
            {data.rugPullRisk === 'low' ? '+25' : data.rugPullRisk === 'medium' ? '+15' : '0'}
          </span>
        </div>
        
        {/* 滑点 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('liquiditySafety.slippage')}</span>
            <p className="text-gray-400 text-sm mt-1">
              预估滑点：{data.slippage || 0}%
            </p>
          </div>
          <span className={`font-bold ${data.slippage < 5 ? 'text-green-400' : data.slippage < 10 ? 'text-yellow-400' : 'text-red-400'}`}>
            {data.slippage < 5 ? '+25' : data.slippage < 10 ? '+15' : '0'}
          </span>
        </div>
      </div>
      
      {/* 出处链接 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{t('results.source')}</span>
          <a 
            href={data.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {data.source || 'DexScreener'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default LiquiditySafety;
