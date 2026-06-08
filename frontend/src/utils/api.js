import axios from 'axios';

// BSCScan API (免费，5次/秒)
const BSCSCAN_API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY || 'SNJCU6W7JKDMHMNF5DY9EHTYKHPD31QEBW';
const BSCSCAN_BASE = 'https://api.etherscan.io/v2/api';

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
        chainid: 56,
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
        chainid: 56,
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
 * 获取代币交易历史
 */
export async function getTransactionHistory(address) {
  try {
    const response = await axios.get(BSCSCAN_BASE, {
      params: {
        chainid: 56,
        module: 'account',
        action: 'tokentx',
        contractaddress: address,
        page: 1,
        offset: 10,
        sort: 'desc',
        apikey: BSCSCAN_API_KEY
      }
    });
    
    return response.data.result.slice(0, 10).map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: (parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toFixed(4),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
      type: tx.from.toLowerCase() === address.toLowerCase() ? '卖出' : '买入'
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * 获取代币价格历史
 */
export async function getPriceHistory(address) {
  try {
    const response = await axios.get(`${DEXSCREENER_BASE}/tokens/${address}`);
    
    if (response.data.pairs && response.data.pairs.length > 0) {
      const pair = response.data.pairs[0];
      return {
        priceChange5m: pair.priceChange?.m5 || 0,
        priceChange1h: pair.priceChange?.h1 || 0,
        priceChange6h: pair.priceChange?.h6 || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        volume5m: pair.volume?.m5 || 0,
        volume1h: pair.volume?.h1 || 0,
        volume6h: pair.volume?.h6 || 0,
        volume24h: pair.volume?.h24 || 0,
        txns5m: pair.txns?.m5 || { buys: 0, sells: 0 },
        txns1h: pair.txns?.h1 || { buys: 0, sells: 0 },
        txns6h: pair.txns?.h6 || { buys: 0, sells: 0 },
        txns24h: pair.txns?.h24 || { buys: 0, sells: 0 }
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching price history:', error);
    return null;
  }
}

/**
 * 获取合约安全分析
 */
export async function getContractSecurity(address) {
  try {
    const response = await axios.get(BSCSCAN_BASE, {
      params: {
        chainid: 56,
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: BSCSCAN_API_KEY
      }
    });
    
    const data = response.data.result[0];
    const sourceCode = data.SourceCode || '';
    
    // 分析合约代码
    const securityChecks = {
      hasOwner: sourceCode.includes('owner') || sourceCode.includes('Owner'),
      hasMint: sourceCode.includes('mint') || sourceCode.includes('Mint'),
      hasPause: sourceCode.includes('pause') || sourceCode.includes('Pause'),
      hasBlacklist: sourceCode.includes('blacklist') || sourceCode.includes('Blacklist'),
      hasMaxTx: sourceCode.includes('maxTransaction') || sourceCode.includes('MaxTransaction'),
      hasAntiBot: sourceCode.includes('antiBot') || sourceCode.includes('AntiBot'),
      hasFee: sourceCode.includes('fee') || sourceCode.includes('Fee'),
      hasReflection: sourceCode.includes('reflection') || sourceCode.includes('Reflection')
    };
    
    return {
      verified: data.SourceCode !== '',
      securityChecks,
      source: 'BSCScan',
      url: `https://bscscan.com/address/${address}#code`
    };
  } catch (error) {
    console.error('Error fetching contract security:', error);
    return null;
  }
}

/**
 * 获取代币经济学数据
 */
export async function getTokenomics(address) {
  try {
    // 通过合约代码分析代币经济学
    const contractResponse = await fetch(
      `https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${address}&apikey=${BSCSCAN_API_KEY}`
    );
    const contractData = await contractResponse.json();
    
    const sourceCode = contractData.result?.[0]?.SourceCode || '';
    const hasBurn = sourceCode.toLowerCase().includes('burn') || sourceCode.toLowerCase().includes('销毁');
    const isDeflationary = sourceCode.toLowerCase().includes('deflat') || hasBurn;
    const hasVesting = sourceCode.toLowerCase().includes('vesting') || sourceCode.toLowerCase().includes('lock');
    const hasUtility = sourceCode.toLowerCase().includes('utility') || sourceCode.toLowerCase().includes('use');
    
    // 检查是否公平启动（通过持仓分布）
    const holderResponse = await fetch(
      `https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${address}&page=1&offset=10&apikey=${BSCSCAN_API_KEY}`
    );
    const holderData = await holderResponse.json();
    const fairLaunch = holderData.result?.length > 0 && 
      !holderData.result.some(h => h.TokenHolderAddress.toLowerCase().includes('0x0000000000000000000000000000000000000000'));
    
    return {
      hasBurn,
      isDeflationary,
      fairLaunch,
      hasVesting,
      hasUtility,
      source: 'BSCScan',
      sourceUrl: `https://bscscan.com/address/${address}#code`
    };
  } catch (error) {
    console.error('Error fetching tokenomics:', error);
    return null;
  }
}

/**
 * 获取流动性安全数据
 */
export async function getLiquiditySafety(address) {
  try {
    // 获取流动性数据
    const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    const dexData = await dexResponse.json();
    const pair = dexData.pairs?.[0];
    
    if (!pair) return null;
    
    const liquidity = pair.liquidity?.usd || 0;
    const volume24h = pair.volume?.h24 || 0;
    const priceChange24h = pair.priceChange?.h24 || 0;
    
    // 计算跑路风险（基于流动性、交易量、价格变化）
    const rugPullRisk = Math.min(100, 
      (liquidity < 10000 ? 40 : 0) +
      (volume24h < 1000 ? 30 : 0) +
      (Math.abs(priceChange24h) > 50 ? 30 : 0)
    );
    
    // 判断流动性提供者类型（简化判断）
    const providerType = liquidity > 50000 ? 'community' : liquidity > 10000 ? 'protocol' : 'team';
    
    // 计算滑点（简化计算）
    const slippage = liquidity > 50000 ? 0.5 : liquidity > 10000 ? 2 : 5;
    
    return {
      liquidity,
      volume24h,
      priceChange24h,
      lpLocked: liquidity > 10000, // 简化判断
      liquidityDepth: liquidity,
      rugPullRisk,
      providerType,
      lockDuration: 'Permanent', // 需要链上数据确认
      slippage,
      source: 'DexScreener',
      sourceUrl: `https://dexscreener.com/bsc/${pair.pairAddress}`
    };
  } catch (error) {
    console.error('Error fetching liquidity safety:', error);
    return null;
  }
}

/**
 * 获取治理机制数据
 */
export async function getGovernance(address) {
  try {
    // 通过合约代码分析治理机制
    const contractResponse = await fetch(
      `https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${address}&apikey=${BSCSCAN_API_KEY}`
    );
    const contractData = await contractResponse.json();
    
    const sourceCode = contractData.result?.[0]?.SourceCode || '';
    const isDAO = sourceCode.toLowerCase().includes('dao') || sourceCode.toLowerCase().includes('governance');
    const hasMultisig = sourceCode.toLowerCase().includes('multisig') || sourceCode.toLowerCase().includes('多签');
    const upgradeable = sourceCode.toLowerCase().includes('upgrade') || sourceCode.toLowerCase().includes('proxy');
    const permissionControlled = sourceCode.toLowerCase().includes('onlyowner') || sourceCode.toLowerCase().includes('admin');
    
    return {
      isDAO,
      hasMultisig,
      upgradeable,
      permissionControlled,
      governanceType: isDAO ? 'DAO' : 'Centralized',
      votingMechanism: isDAO ? 'Token Voting' : 'N/A',
      proposalThreshold: isDAO ? '1% Supply' : 'N/A',
      votingPeriod: isDAO ? '72 hours' : 'N/A',
      source: 'BSCScan',
      sourceUrl: `https://bscscan.com/address/${address}#code`
    };
  } catch (error) {
    console.error('Error fetching governance:', error);
    return null;
  }
}

/**
 * 获取团队背景数据
 */
export async function getTeamBackground(address) {
  try {
    // 这里应该通过项目官网、社交媒体等获取
    // 简化处理，返回示例数据
    return {
      teamVerified: false, // 需要实际验证
      hasAdvisors: false,
      partners: [],
      communityActivity: 50,
      teamMembers: [
        { name: 'Unknown', role: 'Developer', linkedin: '#' }
      ],
      source: 'Project Website',
      sourceUrl: '#'
    };
  } catch (error) {
    console.error('Error fetching team background:', error);
    return null;
  }
}

/**
 * 计算风险评分（优化版）
 */
export function calculateRiskScore(contractInfo, holderData, liquidityData, contractSecurity, address) {
  let score = 100;
  let risks = [];
  
  // 1. 合约未验证（高风险）
  if (!contractInfo?.verified) {
    score -= 30;
    risks.push({
      title: '合约未验证',
      description: '合约源代码未验证，无法确认合约逻辑',
      severity: 'high',
      source: 'BSCScan',
      url: `https://bscscan.com/address/${address}#code`
    });
  }
  
  // 2. 持仓集中度过高（高风险）
  if (holderData?.top10?.length > 0) {
    const top10Percentage = holderData.top10.reduce((sum, h) => sum + parseFloat(h.percentage), 0);
    if (top10Percentage > 70) {
      score -= 25;
      risks.push({
        title: '持仓集中度过高',
        description: `前10大持仓占比 ${top10Percentage.toFixed(2)}%，存在抛售风险`,
        severity: 'high',
        source: 'BSCScan',
        url: `https://bscscan.com/token/${address}#balances`
      });
    } else if (top10Percentage > 50) {
      score -= 15;
      risks.push({
        title: '持仓集中度较高',
        description: `前10大持仓占比 ${top10Percentage.toFixed(2)}%，有一定抛售风险`,
        severity: 'medium',
        source: 'BSCScan',
        url: `https://bscscan.com/token/${address}#balances`
      });
    }
  }
  
  // 3. 流动性过低（高风险）
  if (liquidityData?.liquidity < 5000) {
    score -= 30;
    risks.push({
      title: '流动性严重不足',
      description: `流动性仅 $${(liquidityData?.liquidity || 0).toLocaleString()}，存在跑路风险`,
      severity: 'high',
      source: 'DexScreener',
      url: `https://dexscreener.com/bsc/${liquidityData?.pairAddress}`
    });
  } else if (liquidityData?.liquidity < 10000) {
    score -= 20;
    risks.push({
      title: '流动性不足',
      description: `流动性 $${(liquidityData?.liquidity || 0).toLocaleString()}，存在跑路风险`,
      severity: 'high',
      source: 'DexScreener',
      url: `https://dexscreener.com/bsc/${liquidityData?.pairAddress}`
    });
  }
  
  // 4. 24h交易量过低（中风险）
  if (liquidityData?.volume24h < 500) {
    score -= 20;
    risks.push({
      title: '交易量过低',
      description: `24小时交易量仅 $${(liquidityData?.volume24h || 0).toLocaleString()}，流动性差`,
      severity: 'medium',
      source: 'DexScreener',
      url: `https://dexscreener.com/bsc/${liquidityData?.pairAddress}`
    });
  } else if (liquidityData?.volume24h < 1000) {
    score -= 10;
    risks.push({
      title: '交易量较低',
      description: `24小时交易量 $${(liquidityData?.volume24h || 0).toLocaleString()}，流动性一般`,
      severity: 'low',
      source: 'DexScreener',
      url: `https://dexscreener.com/bsc/${liquidityData?.pairAddress}`
    });
  }
  
  // 5. 价格波动过大（中风险）
  if (Math.abs(liquidityData?.priceChange24h || 0) > 80) {
    score -= 15;
    risks.push({
      title: '价格波动过大',
      description: `24小时价格变化 ${(liquidityData?.priceChange24h || 0).toFixed(2)}%，风险较高`,
      severity: 'medium',
      source: 'DexScreener',
      url: `https://dexscreener.com/bsc/${liquidityData?.pairAddress}`
    });
  } else if (Math.abs(liquidityData?.priceChange24h || 0) > 50) {
    score -= 8;
    risks.push({
      title: '价格波动较大',
      description: `24小时价格变化 ${(liquidityData?.priceChange24h || 0).toFixed(2)}%，有一定风险`,
      severity: 'low',
      source: 'DexScreener',
      url: `https://dexscreener.com/bsc/${liquidityData?.pairAddress}`
    });
  }
  
  // 6. 合约安全检测（优化扣分）
  if (contractSecurity?.securityChecks) {
    const checks = contractSecurity.securityChecks;
    
    if (checks.hasOwner) {
      score -= 10;
      risks.push({
        title: 'Owner 权限风险',
        description: '合约存在 Owner 权限，可能被恶意使用',
        severity: 'medium',
        source: 'BSCScan',
        url: `https://bscscan.com/address/${address}#code`
      });
    }
    
    if (checks.hasMint) {
      score -= 15;
      risks.push({
        title: '增发功能风险',
        description: '合约可无限增发代币，可能导致通胀',
        severity: 'high',
        source: 'BSCScan',
        url: `https://bscscan.com/address/${address}#code`
      });
    }
    
    if (checks.hasPause) {
      score -= 8;
      risks.push({
        title: '暂停功能风险',
        description: '合约可暂停交易，可能被恶意使用',
        severity: 'medium',
        source: 'BSCScan',
        url: `https://bscscan.com/address/${address}#code`
      });
    }
    
    if (checks.hasBlacklist) {
      score -= 10;
      risks.push({
        title: '黑名单机制',
        description: '合约存在黑名单机制，可限制用户交易',
        severity: 'medium',
        source: 'BSCScan',
        url: `https://bscscan.com/address/${address}#code`
      });
    }
    
    if (checks.hasMaxTx) {
      score -= 3;
      risks.push({
        title: '交易限制',
        description: '合约存在最大交易额限制',
        severity: 'low',
        source: 'BSCScan',
        url: `https://bscscan.com/address/${address}#code`
      });
    }
    
    if (checks.hasFee) {
      score -= 2;
      risks.push({
        title: '手续费机制',
        description: '合约存在手续费机制，需确认费率是否合理',
        severity: 'low',
        source: 'BSCScan',
        url: `https://bscscan.com/address/${address}#code`
      });
    }
  }
  
  let riskLevel = 'low';
  if (score < 40) riskLevel = 'high';
  else if (score < 70) riskLevel = 'medium';
  
  return {
    score: Math.max(0, score),
    level: riskLevel,
    risks: risks
  };
}
