import { useTranslation } from 'react-i18next';

function RiskScore({ score, level, risks }) {
  const { t } = useTranslation();
  
  const getScoreColor = () => {
    if (level === 'high') return 'text-red-500';
    if (level === 'medium') return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getBgColor = () => {
    if (level === 'high') return 'bg-red-500/20 border-red-500/50';
    if (level === 'medium') return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-green-500/20 border-green-500/50';
  };

  return (
    <div className={`p-6 rounded-lg border ${getBgColor()}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{t('results.riskScore')}</h3>
      
      <div className="flex items-center gap-4">
        <div className={`text-5xl font-bold ${getScoreColor()}`}>
          {score}
        </div>
        <div>
          <div className={`text-xl font-semibold ${getScoreColor()}`}>
            {t(`risk.${level}`)}
          </div>
          <div className="text-gray-400 text-sm">
            / 100
          </div>
        </div>
      </div>
      
      {risks && risks.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-400 text-sm mb-2">Risk Factors:</p>
          <ul className="list-disc list-inside text-gray-300 text-sm">
            {risks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RiskScore;
