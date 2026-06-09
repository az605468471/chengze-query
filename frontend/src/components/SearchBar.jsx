import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getContractInfo, getHolderDistribution, getLiquidityData, calculateRiskScore, getTransactionHistory, getPriceHistory, getContractSecurity, getTokenomics, getLiquiditySafety, getGovernance, getTeamBackground, getOnchainAnalysis } from '../utils/api';

function SearchBar({ onResults, onLoading, onError }) {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError(t('error'));
      if (onError) onError(t('error'));
      return;
    }
    
    setLoading(true);
    setError('');
    if (onLoading) onLoading(true);
    
    try {
      console.log('Starting analysis for address:', address);
      
      const results = await Promise.allSettled([
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
      ])
      
      const getStatus = (result) => result.status === 'fulfilled' ? result.value : {}
      const contractInfo = getStatus(results[0])
      const holderData = getStatus(results[1])
      const liquidityData = getStatus(results[2])
      const transactions = getStatus(results[3])
      const priceHistory = getStatus(results[4])
      const contractSecurity = getStatus(results[5])
      const tokenomics = getStatus(results[6])
      const liquiditySafety = getStatus(results[7])
      const governance = getStatus(results[8])
      const teamBackground = getStatus(results[9])
      const onchainAnalysis = getStatus(results[10]);
      
      console.log('API responses received:', {
        contractInfo,
        holderData,
        liquidityData,
        transactions,
        priceHistory,
        contractSecurity,
        tokenomics,
        liquiditySafety,
        governance,
        teamBackground,
        onchainAnalysis
      });
      
      const riskScore = calculateRiskScore(contractInfo, holderData, liquidityData, contractSecurity, address);
      console.log('Risk score calculated:', riskScore);
      
      const resultData = {
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
      };
      
      console.log('Result data prepared:', resultData);
      onResults(resultData);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err.message || t('error');
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-base"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold w-full sm:w-auto"
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
