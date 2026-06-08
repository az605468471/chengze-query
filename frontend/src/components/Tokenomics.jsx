import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Tokenomics({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.tokenomics')}
        </h3>
        <p className="text-gray-400">No tokenomics data available</p>
      </div>
    );
  }
  
  // 计算销毁机制得分
  const burnScore = data.hasBurn ? 20 : 0;
  const deflationScore = data.isDeflationary ? 20 : 0;
  const fairLaunchScore = data.fairLaunch ? 20 : 0;
  const vestingScore = data.hasVesting ? 20 : 0;
  const utilityScore = data.hasUtility ? 20 : 0;
  
  const totalScore = burnScore + deflationScore + fairLaunchScore + vestingScore + utilityScore;
  
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
        {t('results.tokenomics')}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">{t('tokenomics.score')}</span>
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
        {/* 销毁机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.burnMechanism')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasBurn ? '✅ 有回购销毁机制，维持通缩压力' : '❌ 无销毁机制，可能存在通胀风险'}
            </p>
          </div>
          <span className={`font-bold ${data.hasBurn ? 'text-green-400' : 'text-red-400'}`}>
            {data.hasBurn ? '+20' : '0'}
          </span>
        </div>
        
        {/* 通缩模型 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.inflationModel')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.isDeflationary ? '✅ 通缩模型，代币稀缺性持续增强' : '⚠️ 通胀模型，代币可能持续增发'}
            </p>
          </div>
          <span className={`font-bold ${data.isDeflationary ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.isDeflationary ? '+20' : '0'}
          </span>
        </div>
        
        {/* 公平启动 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.fairLaunch')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.fairLaunch ? '✅ 公平启动，无预挖或老鼠仓' : '⚠️ 存在预挖或不公平分配'}
            </p>
          </div>
          <span className={`font-bold ${data.fairLaunch ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.fairLaunch ? '+20' : '0'}
          </span>
        </div>
        
        {/* 解锁机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.vestingSchedule')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasVesting ? '✅ 有解锁机制，防止集中抛售' : '⚠️ 无解锁机制，可能存在抛售压力'}
            </p>
          </div>
          <span className={`font-bold ${data.hasVesting ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasVesting ? '+20' : '0'}
          </span>
        </div>
        
        {/* 实用性 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.utility')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasUtility ? '✅ 有实际用途，非纯投机' : '⚠️ 无明确用途，纯投机风险'}
            </p>
          </div>
          <span className={`font-bold ${data.hasUtility ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasUtility ? '+20' : '0'}
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
            {data.source || 'BSCScan'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Tokenomics;
