import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import RiskScore from '../components/RiskScore';
import ContractInfo from '../components/ContractInfo';
import HolderDistribution from '../components/HolderDistribution';
import LiquidityInfo from '../components/LiquidityInfo';
import TransactionHistory from '../components/TransactionHistory';
import PriceHistory from '../components/PriceHistory';
import ContractSecurity from '../components/ContractSecurity';
import Tokenomics from '../components/Tokenomics';
import LiquiditySafety from '../components/LiquiditySafety';
import Governance from '../components/Governance';
import TeamBackground from '../components/TeamBackground';
import OnchainAnalysis from '../components/OnchainAnalysis';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Home() {
  const { t } = useTranslation();
  const [results, setResults] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('检查钱包失败:', error);
        }
      }
    }
    checkWallet();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with Wallet Connection */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          {t('subtitle')}
        </p>
        <SearchBar onResults={setResults} />
        
        {/* Wallet Address Display */}
        {walletAddress && (
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-2">{t('wallet.connected')}：</p>
            <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300 inline-block">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          </div>
        )}
      </section>

      {/* Results Section */}
      {results && (
        <section className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Score */}
            <div className="md:col-span-2">
              <RiskScore
                score={results.riskScore.score}
                level={results.riskScore.level}
                risks={results.riskScore.risks}
              />
            </div>
            
            {/* Contract Info */}
            <ContractInfo data={results.contractInfo} />
            
            {/* Liquidity */}
            <LiquidityInfo data={results.liquidityData} />
            
            {/* Contract Security */}
            <ContractSecurity data={results.contractSecurity} />
            
            {/* Tokenomics */}
            <Tokenomics data={results.tokenomics} />
            
            {/* Liquidity Safety */}
            <LiquiditySafety data={results.liquiditySafety} />
            
            {/* Governance */}
            <Governance data={results.governance} />
            
            {/* Team Background */}
            <TeamBackground data={results.teamBackground} />
            
            {/* Onchain Analysis */}
            <OnchainAnalysis data={results.onchainAnalysis} />
            
            {/* Holder Distribution */}
            <div className="md:col-span-2">
              <HolderDistribution data={results.holderData} />
            </div>
            
            {/* Price History */}
            <div className="md:col-span-2">
              <PriceHistory data={results.priceHistory} />
            </div>
            
            {/* Transaction History */}
            <div className="md:col-span-2">
              <TransactionHistory data={results.transactions} />
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {!results && (
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-6">
            <FeatureCard
              icon="🔐"
              title={t('features.contractCheck')}
              description="Check contract verification, source code, and permissions"
            />
            <FeatureCard
              icon="👥"
              title={t('features.holderAnalysis')}
              description="Analyze token distribution and whale activity"
            />
            <FeatureCard
              icon="💧"
              title={t('features.liquidityCheck')}
              description="Check liquidity depth and trading volume"
            />
            <FeatureCard
              icon="📋"
              title={t('features.auditReport')}
              description="View professional audit reports and scores"
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <span className="font-bold">{t('title')}</span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white">{t('footer.about')}</a>
              <a href="#" className="hover:text-white">{t('footer.docs')}</a>
              <a href="#" className="hover:text-white">{t('footer.contact')}</a>
              <a href="#" className="hover:text-white">{t('footer.github')}</a>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            © 2026 {t('title')}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center hover:bg-gray-750 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

export default Home;
