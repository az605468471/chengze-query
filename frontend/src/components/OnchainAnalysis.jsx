import { useTranslation } from 'react-i18next';

function OnchainAnalysis({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.onchainAnalysis')}
        </h3>
        <p className="text-gray-400">No onchain analysis data available</p>
      </div>
    );
  }
  
  // 计算活跃度得分
  const activityScore = data.activityScore || 0;
  const buyRatio = data.buyCount / (data.buyCount + data.sellCount) * 100 || 0;
  
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
        {t('results.onchainAnalysis')}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">{t('onchain.score')}</span>
          <span className={`text-2xl font-bold ${getColor(activityScore)}`}>{activityScore}/100</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getBarColor(activityScore)}`}
            style={{ width: `${activityScore}%` }}
          />
        </div>
      </div>
      
      {/* 详细指标 */}
      <div className="space-y-4">
        {/* 交易统计 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('onchain.transactions')}</span>
            <p className="text-gray-400 text-sm mt-1">
              最近 10 笔交易：{data.buyCount} 买入 / {data.sellCount} 卖出
            </p>
          </div>
          <span className={`font-bold ${buyRatio > 60 ? 'text-green-400' : buyRatio > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {buyRatio > 60 ? '🟢 买入主导' : buyRatio > 40 ? '🟡 均衡' : '🔴 卖出主导'}
          </span>
        </div>
        
        {/* 活跃度 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('onchain.activity')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {activityScore > 70 ? '🟢 高度活跃' : activityScore > 50 ? '🟡 一般活跃' : '🔴 冷清'}
            </p>
          </div>
          <span className={`font-bold ${activityScore > 70 ? 'text-green-400' : activityScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {activityScore > 70 ? '+25' : activityScore > 50 ? '+15' : '0'}
          </span>
        </div>
      </div>
      
      {/* 最近交易 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-white font-medium mb-3">{t('onchain.recentTxs')}</h4>
        <div className="space-y-2">
          {data.recentTransactions?.slice(0, 5).map((tx, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div>
                <span className={`text-sm px-2 py-1 rounded ${
                  tx.type === '买入' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {tx.type}
                </span>
                <span className="text-gray-300 text-sm ml-2">
                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)} → {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                </span>
              </div>
              <a 
                href={`https://bscscan.com/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {tx.value} →
              </a>
            </div>
          ))}
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

export default OnchainAnalysis;
