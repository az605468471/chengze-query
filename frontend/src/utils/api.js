import axios from 'axios';

// BSCScan API (免费，5次/秒)
const BSCSCAN_API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY || 'YOUR_BSCSCAN_API_KEY';
const BSCSCAN_BASE = 'https://api.bscscan.com/api';

// DexScreener API (完全免费)
const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';

// DefiLlama API (完全免费)
const DEFILLAMA_BASE = 'https://api.llama.fi';

/**
 * 获取合约基本信息
 */
export async function getContractInfo(address) {
  try {
    const response = await axios.get(BSCSCAN_BASE, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: BSCSCAN_API_KEY
      }
    });
    
    const data = response.data.result[0];
    return {
      name: data.ContractName || 'Unknown',
      compiler: data.CompilerVersion || 'Unknown',
      verified: data.SourceCode !== '',
      optimization: data.OptimizationUsed === '1',
      source: 'BSCScan',
      url: `https://bscscan.com/address/${address}`
    };
  } catch (error) {
    console.error('Error fetching contract info:', error);
    return null;
  }
}

/**
 * 获取持仓分布
 */
export async function getHolderDistribution(address) {
  try {
    const response = await axios.get(BSCSCAN_BASE, {
      params: {
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: address,
        page: 1,
        offset: 10,
        apikey: BSCSCAN_API_KEY
      }
    });
    
    const holders = response.data.result;
    const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.TokenHolderQuantity), 0);
    
    return {
      top10: holders.slice(0, 10).map((h, i) => ({
        rank: i + 1,
        address: h.TokenHolderAddress,
        balance: h.TokenHolderQuantity,
        percentage: ((parseFloat(h.TokenHolderQuantity) / totalSupply) * 100).toFixed(2)
      })),
      totalHolders: holders.length,
      source: 'BSCScan',
      url: `https://bscscan.com/token/${address}#balances`
    };
  } catch (error) {
    console.error('Error fetching holder distribution:', error);
    return null;
  }
}

/**
 * 获取流动性数据
 */
export async function getLiquidityData(address) {
  try {
    const response = await axios.get(`${DEXSCREENER_BASE}/tokens/${address}`);
    
    if (response.data.pairs && response.data.pairs.length > 0) {
      const pair = response.data.pairs[0];
      return {
        dex: pair.dexId,
        pairAddress: pair.pairAddress,
        baseToken: pair.baseToken.symbol,
        quoteToken: pair.quoteToken.symbol,
        priceUsd: pair.priceUsd,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        source: 'DexScreener',
        url: `https://dexscreener.com/bsc/${pair.pairAddress}`
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching liquidity data:', error);
    return null;
  }
}

/**
 * 计算风险评分
 */
export function calculateRiskScore(contractInfo, holderData, liquidityData) {
  let score = 100;
  let risks = [];
  
  // 合约未验证
  if (!contractInfo?.verified) {
    score -= 30;
    risks.push('Contract not verified');
  }
  
  // 持仓集中度过高
  if (holderData?.top10?.length > 0) {
    const top10Percentage = holderData.top10.reduce((sum, h) => sum + parseFloat(h.percentage), 0);
    if (top10Percentage > 50) {
      score -= 20;
      risks.push('High concentration in top 10 holders');
    }
  }
  
  // 流动性过低
  if (liquidityData?.liquidity < 10000) {
    score -= 25;
    risks.push('Low liquidity');
  }
  
  // 24h交易量过低
  if (liquidityData?.volume24h < 1000) {
    score -= 15;
    risks.push('Low trading volume');
  }
  
  // 价格波动过大
  if (Math.abs(liquidityData?.priceChange24h || 0) > 50) {
    score -= 10;
    risks.push('High price volatility');
  }
  
  let riskLevel = 'low';
  if (score < 50) riskLevel = 'high';
  else if (score < 70) riskLevel = 'medium';
  
  return {
    score: Math.max(0, score),
    level: riskLevel,
    risks: risks
  };
}
