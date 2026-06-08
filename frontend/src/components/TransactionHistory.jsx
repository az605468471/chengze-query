import { useTranslation } from 'react-i18next';

function TransactionHistory({ data }) {
  const { t } = useTranslation();
  
  if (!data || data.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('results.transactionHistory') || '交易记录'}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-2">类型</th>
              <th className="text-left py-2">地址</th>
              <th className="text-right py-2">数量</th>
              <th className="text-right py-2">时间</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((tx, index) => (
              <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${tx.type === '买入' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-2 text-gray-300 font-mono text-xs truncate max-w-[150px]">
                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                </td>
                <td className="py-2 text-right text-white font-semibold">
                  {tx.value}
                </td>
                <td className="py-2 text-right text-gray-400 text-xs">
                  {tx.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionHistory;
