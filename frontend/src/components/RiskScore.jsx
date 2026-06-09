import { useTranslation } from 'react-i18next';
import { memo, useMemo } from 'react';

const RiskScore = memo(function RiskScore({ score, level, risks }) {
  const { t } = useTranslation();
  
  const getColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };
  
  const getBgColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };
  
  const getLevelText = (level) => {
    switch (level) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      default: return 'Low Risk';
    }
  };
  
  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-white">
          {t('results.riskScore')}
        </h3>
        {contractData.riskScore?.confidence && (
          <div className="text-xs sm:text-sm text-gray-400">
            {t('risk.confidence')}: {contractData.riskScore.confidence}%
          </div>
        )}
        </div>
        
        {/* Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 100 100">
            <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
            <circle 
              className={`${getBgColor(level)}`} 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
              strokeDasharray={`${(score / 100) * 251} 251`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl sm:text-3xl font-bold ${getColor(level)}`}>{score}</span>
            <span className="text-xs sm:text-sm text-gray-400">{getLevelText(level)}</span>
          </div>
        </div>
      </div>
      
      {/* Risk Items */}
      {risks && risks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400 mb-2">{t('risk.foundRisks')}：</h4>
          {risks.map((risk, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${
                risk.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                risk.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-gray-700/50 border-gray-600/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm ${
                      risk.severity === 'high' ? 'text-red-400' :
                      risk.severity === 'medium' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {risk.severity === 'high' ? '🔴' : risk.severity === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <span className="font-medium text-white text-sm">
                      {t(risk.titleKey, risk.titleParams)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 ml-6">
                    {t(risk.descriptionKey, risk.descriptionParams)}
                  </p>
                  {risk.mitigation && (
                    <p className="text-xs text-gray-300 ml-6 mt-1">
                      <span className="text-gray-500">{t('common.suggestions')}:</span> {risk.mitigation}
                    </p>
                  )}
                </div>
                {risk.url && (
                  <a 
                    href={risk.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs ml-2 whitespace-nowrap"
                  >
                    {t('risk.viewSource')} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Risks */}
      {(!risks || risks.length === 0) && (
        <div className="text-center py-4">
          <p className="text-green-400">✅ {t('risk.noRisks')}</p>
        </div>
      )}
    </div>
  );
});

export default RiskScore;
