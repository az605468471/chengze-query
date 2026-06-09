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
import ExportReport from '../components/ExportReport';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 m-4">
          <h3 className="text-red-200 font-semibold">⚠️ Component Error</h3>
          <p className="text-red-300 text-sm mt-2">
            Something went wrong while displaying this component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
              <ErrorBoundary>
                <RiskScore
                  score={results.riskScore.score}
                  level={results.riskScore.level}
                  risks={results.riskScore.risks}
                />
              </ErrorBoundary>
            </div>
            
            {/* Contract Info */}
            <ErrorBoundary>
              <ContractInfo data={results.contractInfo} />
            </ErrorBoundary>
            
            {/* Liquidity */}
            <ErrorBoundary>
              <LiquidityInfo data={results.liquidityData} />
            </ErrorBoundary>
            
            {/* Contract Security */}
            <ErrorBoundary>
              <ContractSecurity data={results.contractSecurity} />
            </ErrorBoundary>
            
            {/* Tokenomics */}
            <ErrorBoundary>
              <Tokenomics data={results.tokenomics} />
            </ErrorBoundary>
            
            {/* Liquidity Safety */}
            <ErrorBoundary>
              <LiquiditySafety data={results.liquiditySafety} />
            </ErrorBoundary>
            
            {/* Governance */}
            <ErrorBoundary>
              <Governance data={results.governance} />
            </ErrorBoundary>
            
            {/* Team Background */}
            <ErrorBoundary>
              <TeamBackground data={results.teamBackground} />
            </ErrorBoundary>
            
            {/* Onchain Analysis */}
            <ErrorBoundary>
              <OnchainAnalysis data={results.onchainAnalysis} />
            </ErrorBoundary>
            
            {/* Holder Distribution */}
            <div className="md:col-span-2">
              <ErrorBoundary>
                <HolderDistribution data={results.holderData} />
              </ErrorBoundary>
            </div>
            
            {/* Price History */}
            <div className="md:col-span-2">
              <ErrorBoundary>
                <PriceHistory data={results.priceHistory} />
              </ErrorBoundary>
            </div>
            
            {/* Transaction History */}
            <div className="md:col-span-2">
              <ErrorBoundary>
                <TransactionHistory data={results.transactions} />
              </ErrorBoundary>
            </div>
          </div>
        </section>
      )}

      {/* Export Report Section */}
      {results && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ErrorBoundary>
              <ExportReport
                data={results}
                contractAddress={results.contractInfo?.address || ''}
              />
            </ErrorBoundary>
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
