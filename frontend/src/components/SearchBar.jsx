import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getContractInfo, getHolderDistribution, getLiquidityData, calculateRiskScore, getTransactionHistory, getPriceHistory, getContractSecurity, getTokenomics, getLiquiditySafety, getGovernance, getTeamBackground, getOnchainAnalysis } from '../utils/api';

function SearchBar({ onResults, onLoading }) {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError(t('error'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (onLoading) onLoading(true);
      const [contractInfo, holderData, liquidityData, transactions, priceHistory, contractSecurity, tokenomics, liquiditySafety, governance, teamBackground, onchainAnalysis] = await Promise.all([
        getContractInfo(address),
        getHolderDistribution(address),
        getLiquidityData(address),
        getTransactionHistory(address),
        getPriceHistory(address),
        getContractSecurity(address),
        getTokenomics(address),
        getLiquiditySafety(address),
        getGovernance(address),
        getTeamBackground(address),
        getOnchainAnalysis(address)
      ]);
      
      const riskScore = calculateRiskScore(contractInfo, holderData, liquidityData, contractSecurity, address);
      
      onResults({
        address,
        contractInfo: contractInfo || {},
        holderData: holderData || {},
        liquidityData: liquidityData || {},
        riskScore: riskScore || { score: 0, level: 'low', risks: [] },
        transactions: transactions || [],
        priceHistory: priceHistory || {},
        contractSecurity: contractSecurity || {},
        tokenomics: tokenomics || {},
        liquiditySafety: liquiditySafety || {},
        governance: governance || {},
        teamBackground: teamBackground || {},
        onchainAnalysis: onchainAnalysis || {}
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {loading ? t('loading') : t('searchBtn')}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}

export default SearchBar;
