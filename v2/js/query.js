/**
 * 承泽查询系统 · 查询引擎 + 五维评分 v1.1
 * 数据源：GoPlus（安全/持仓/LP）+ DexScreener（价格/流动性）+ DefiLlama（TVL/生态）
 *
 * v1.1 修正：
 *  1. 删除随机数 —— 同地址评分恒定
 *  2. GoPlus 信任列表（trust_list=1）走主流币快速通道
 *  3. 持币集中度排除黑洞地址
 *  4. LP 锁仓：流动性 ≥ $1M 视为深度充足
 *  5. holder_count = 0 视为数据未采集，不扣分
 */

const CHAINS = {
  56:    { name: 'BSC',      goplus: 56,    explorer: 'https://bscscan.com' },
  1:     { name: 'Ethereum', goplus: 1,     explorer: 'https://etherscan.io' },
  8453:  { name: 'Base',     goplus: 8453,  explorer: 'https://basescan.org' },
  42161: { name: 'Arbitrum', goplus: 42161, explorer: 'https://arbiscan.io' },
};

// 黑洞 / 销毁地址 —— 评分时必须排除
const BURN_ADDRESSES = new Set([
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead',
  '0xdead000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000001',
]);

/* ============ 基础请求 ============ */
async function fetchJSON(url, timeout = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ============ 数据源 1：GoPlus 安全 ============ */
async function getGoPlus(chainId, address) {
  const cid = CHAINS[chainId]?.goplus || chainId;
  const url = `https://api.gopluslabs.io/api/v1/token_security/${cid}?contract_addresses=${address}`;
  const json = await fetchJSON(url);
  if (json.code !== 1 || !json.result) throw new Error('GoPlus 无数据');
  const r = json.result[address.toLowerCase()];
  if (!r) throw new Error('GoPlus 未收录该代币');
  return r;
}

/* ============ 数据源 2：DexScreener 行情 ============ */
async function getDexScreener(address) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
  const json = await fetchJSON(url);
  const pairs = json.pairs || [];
  if (pairs.length === 0) return null;

  const best = pairs.reduce((a, b) =>
    ((b.liquidity?.usd || 0) > (a.liquidity?.usd || 0) ? b : a)
  );

  return {
    pairAddress: best.pairAddress,
    dexId: best.dexId,
    priceUsd: parseFloat(best.priceUsd || 0),
    liquidityUsd: best.liquidity?.usd || 0,
    volume24h: best.volume?.h24 || 0,
    priceChange24h: best.priceChange?.h24 || 0,
    txns24h: (best.txns?.h24?.buys || 0) + (best.txns?.h24?.sells || 0),
    fdv: best.fdv || 0,
    marketCap: best.marketCap || 0,
    quoteToken: best.quoteToken?.symbol || '',
    allPairsCount: pairs.length,
  };
}

/* ============ 数据源 3：DefiLlama 协议数据 ============ */
async function getDefiLlama(symbol) {
  if (!symbol) return null;
  try {
    const list = await fetchJSON('https://api.llama.fi/protocols', 25000);
    const target = list.find(p => (p.symbol || '').toUpperCase() === symbol.toUpperCase());
    if (!target) return null;
    return {
      name: target.name,
      tvl: target.tvl || 0,
      category: target.category || '',
      twitter: target.twitter || '',
      github: (target.github || [])[0] || '',
      url: target.url || '',
      mcap: target.mcap || 0,
    };
  } catch {
    return null;
  }
}

/* ============ 持仓分析（排除黑洞）============ */
function analyzeHolders(goplus) {
  const holders = goplus.holders || [];
  if (holders.length === 0) {
    return { top10Pct: 0, holderCount: parseInt(goplus.holder_count || '0', 10), list: [], total: parseFloat(goplus.total_supply || '0') };
  }

  const total = parseFloat(goplus.total_supply || '0');
  const list = [];
  let realCount = 0;
  let top10Pct = 0;

  for (const h of holders) {
    const addr = (h.address || '').toLowerCase();
    const pct = parseFloat(h.percent || '0') * 100;
    const isBurn = BURN_ADDRESSES.has(addr);
    const isLocked = h.is_locked === 1;

    if (isBurn) {
      list.push({ address: h.address, pct, isBurn: true, isLocked, tag: h.tag || '黑洞/销毁' });
      continue;
    }
    realCount++;
    list.push({ address: h.address, pct, isBurn: false, isLocked, tag: h.tag || '' });
    if (realCount <= 10) top10Pct += pct;
  }

  return {
    top10Pct,
    holderCount: parseInt(goplus.holder_count || '0', 10),
    list,
    total,
  };
}

/* ============ LP 分析 ============ */
function analyzeLP(goplus) {
  const lps = goplus.lp_holders || [];
  if (lps.length === 0) return { hasLP: false, lockedPct: 0, lpCount: 0 };

  let lockedPct = 0;
  for (const lp of lps) {
    if (lp.is_locked === 1) lockedPct += parseFloat(lp.percent || '0') * 100;
  }
  return {
    hasLP: true,
    lockedPct,
    lpCount: parseInt(goplus.lp_holder_count || lps.length, 10),
  };
}

/* ============ 五维评分引擎 ============ */
function calculateScore(goplus, dex, llama, holders, lp) {
  const dims = [];
  const flags = [];
  const risks = [];
  const yes = v => v === '1' || v === 1;

  // GoPlus 官方信任列表 → 主流/已验证代币
  const isTrusted = yes(goplus.trust_list);

  // 开发者持仓（owner 与 creator 取大）
  const ownerPctRaw = parseFloat(goplus.owner_percent || '0') * 100;
  const creatorPctRaw = parseFloat(goplus.creator_percent || '0') * 100;
  const devHoldPct = Math.max(ownerPctRaw, creatorPctRaw);

  const liqUsd = dex?.liquidityUsd || 0;
  const isDeepLiquidity = liqUsd >= 1_000_000;

  /* ---------- 维度一：安全与真伪（30）---------- */
  let s1 = 0;
  const d1 = { name: '安全与真伪', max: 30, score: 0, items: [] };

  // 1. 合约开源（8分，否决）
  if (yes(goplus.is_open_source)) {
    s1 += 8;
    d1.items.push({ k: '合约开源', v: '已开源', ok: true, src: 'GoPlus' });
  } else {
    d1.items.push({ k: '合约开源', v: '未开源', ok: false, src: 'GoPlus' });
    flags.push({ k: '合约未开源', desc: '代码不可验证，可能存在隐藏后门' });
  }

  // 2. 增发权限（8分）
  if (!yes(goplus.is_mintable)) {
    s1 += 8;
    d1.items.push({ k: '增发权限', v: '已放弃', ok: true, src: 'GoPlus' });
  } else if (isTrusted) {
    s1 += 8;
    d1.items.push({ k: '增发权限', v: '主流代币（增发为设计特性）', ok: true, src: 'GoPlus·信任列表' });
  } else if (devHoldPct < 5) {
    s1 += 5;
    d1.items.push({ k: '增发权限', v: '可增发（团队持仓低）', ok: false, src: 'GoPlus' });
    risks.push({ k: '存在增发权限', desc: '合约保留 mint 函数，需关注所有者行为' });
  } else {
    d1.items.push({ k: '增发权限', v: '可增发且团队持仓高', ok: false, src: 'GoPlus' });
    flags.push({ k: '恶意增发风险', desc: '所有者可增发且持有大量代币' });
  }

  // 3. LP 锁仓（6分）
  if (isTrusted || isDeepLiquidity) {
    s1 += 6;
    d1.items.push({
      k: 'LP 锁仓',
      v: isTrusted ? '主流代币（深度充足）' : `流动性 $${(liqUsd / 1e6).toFixed(1)}M（深度充足）`,
      ok: true, src: 'GoPlus / DexScreener'
    });
  } else if (lp.hasLP && lp.lockedPct >= 50) {
    s1 += 6;
    d1.items.push({ k: 'LP 锁仓', v: `${lp.lockedPct.toFixed(1)}% 已锁定`, ok: true, src: 'GoPlus' });
  } else if (lp.hasLP && lp.lockedPct > 0) {
    s1 += 3;
    d1.items.push({ k: 'LP 锁仓', v: `仅 ${lp.lockedPct.toFixed(1)}% 锁定`, ok: false, src: 'GoPlus' });
    risks.push({ k: 'LP 锁仓比例低', desc: '流动性可能随时被撤走' });
  } else {
    d1.items.push({ k: 'LP 锁仓', v: lp.hasLP ? '未锁定' : '未检测到 LP', ok: false, src: 'GoPlus' });
    flags.push({ k: '流动性未锁定', desc: 'LP 未锁定，存在撤池跑路风险' });
  }

  // 4. 蜜罐（否决）
  if (yes(goplus.is_honeypot)) {
    d1.items.push({ k: '蜜罐检测', v: '是蜜罐', ok: false, src: 'GoPlus' });
    flags.push({ k: '蜜罐代币', desc: '只能买入无法卖出' });
  } else {
    d1.items.push({ k: '蜜罐检测', v: '正常', ok: true, src: 'GoPlus' });
  }

  // 5. 持币集中度（8分，已排除黑洞）
  if (holders.top10Pct < 30) {
    s1 += 8;
    d1.items.push({ k: '前10持仓', v: `${holders.top10Pct.toFixed(1)}%（已排除黑洞）`, ok: true, src: 'GoPlus' });
  } else if (holders.top10Pct < 50) {
    s1 += 4;
    d1.items.push({ k: '前10持仓', v: `${holders.top10Pct.toFixed(1)}%（已排除黑洞）`, ok: false, src: 'GoPlus' });
    risks.push({ k: '持币相对集中', desc: '前 10 地址占比较高，存在大额抛售风险' });
  } else {
    d1.items.push({ k: '前10持仓', v: `${holders.top10Pct.toFixed(1)}%（已排除黑洞）`, ok: false, src: 'GoPlus' });
    risks.push({ k: '持币高度集中', desc: '前 10 地址占比过高，容易被控盘' });
  }

  d1.score = s1;
  dims.push(d1);

  /* ---------- 维度二：真实需求（30）---------- */
  let s2 = 0;
  const d2 = { name: '真实需求', max: 30, score: 0, items: [] };

  // 1. 持币地址数（8分）
  const hc = holders.holderCount;
  if (hc === 0) {
    s2 += 5;
    d2.items.push({ k: '持币地址', v: '数据未采集', ok: true, src: 'GoPlus' });
  } else if (hc >= 10000) {
    s2 += 8; d2.items.push({ k: '持币地址', v: hc.toLocaleString(), ok: true, src: 'GoPlus' });
  } else if (hc >= 3000) {
    s2 += 6; d2.items.push({ k: '持币地址', v: hc.toLocaleString(), ok: true, src: 'GoPlus' });
  } else if (hc >= 1000) {
    s2 += 4; d2.items.push({ k: '持币地址', v: hc.toLocaleString(), ok: false, src: 'GoPlus' });
  } else if (hc >= 100) {
    s2 += 2; d2.items.push({ k: '持币地址', v: hc.toLocaleString(), ok: false, src: 'GoPlus' });
  } else {
    d2.items.push({ k: '持币地址', v: hc.toLocaleString(), ok: false, src: 'GoPlus' });
    risks.push({ k: '持币地址极少', desc: '参与者很少，流动性差' });
  }

  // 2. 24h 交易笔数（8分）
  const tx = dex?.txns24h || 0;
  if (tx >= 500) {
    s2 += 8; d2.items.push({ k: '24h 交易笔数', v: tx.toLocaleString(), ok: true, src: 'DexScreener' });
  } else if (tx >= 100) {
    s2 += 5; d2.items.push({ k: '24h 交易笔数', v: tx.toLocaleString(), ok: false, src: 'DexScreener' });
  } else if (tx >= 20) {
    s2 += 2; d2.items.push({ k: '24h 交易笔数', v: tx.toLocaleString(), ok: false, src: 'DexScreener' });
  } else {
    d2.items.push({ k: '24h 交易笔数', v: tx.toLocaleString(), ok: false, src: 'DexScreener' });
    risks.push({ k: '几乎没有交易', desc: '24 小时交易极少，可能已无活跃度' });
  }

  // 3. 协议 TVL（7分）
  const tvl = llama?.tvl || 0;
  if (tvl >= 1e7) {
    s2 += 7; d2.items.push({ k: '协议 TVL', v: `$${(tvl / 1e6).toFixed(1)}M`, ok: true, src: 'DefiLlama' });
  } else if (tvl >= 1e6) {
    s2 += 4; d2.items.push({ k: '协议 TVL', v: `$${(tvl / 1e6).toFixed(2)}M`, ok: false, src: 'DefiLlama' });
  } else if (tvl > 0) {
    s2 += 2; d2.items.push({ k: '协议 TVL', v: `$${(tvl / 1e3).toFixed(0)}K`, ok: false, src: 'DefiLlama' });
  } else {
    d2.items.push({ k: '协议 TVL', v: '未收录', ok: false, src: 'DefiLlama' });
  }

  // 4. 流动性深度（7分）
  if (liqUsd >= 100000) {
    s2 += 7; d2.items.push({ k: '流动性深度', v: `$${(liqUsd / 1e3).toFixed(0)}K`, ok: true, src: 'DexScreener' });
  } else if (liqUsd >= 20000) {
    s2 += 5; d2.items.push({ k: '流动性深度', v: `$${(liqUsd / 1e3).toFixed(1)}K`, ok: true, src: 'DexScreener' });
  } else if (liqUsd >= 5000) {
    s2 += 2; d2.items.push({ k: '流动性深度', v: `$${(liqUsd / 1e3).toFixed(1)}K`, ok: false, src: 'DexScreener' });
  } else {
    d2.items.push({ k: '流动性深度', v: `$${liqUsd.toFixed(0)}`, ok: false, src: 'DexScreener' });
    risks.push({ k: '流动性极低', desc: '大额交易会造成剧烈滑点' });
  }

  d2.score = s2;
  dims.push(d2);

  /* ---------- 维度三：经济模型（20）---------- */
  let s3 = 0;
  const d3 = { name: '经济模型', max: 20, score: 0, items: [] };

  // 1. 所有者持仓（6分）
  if (isTrusted) {
    s3 += 6; d3.items.push({ k: '所有者持仓', v: '主流代币', ok: true, src: 'GoPlus·信任列表' });
  } else if (devHoldPct < 5) {
    s3 += 6; d3.items.push({ k: '所有者持仓', v: `${devHoldPct.toFixed(2)}%`, ok: true, src: 'GoPlus' });
  } else if (devHoldPct < 15) {
    s3 += 3; d3.items.push({ k: '所有者持仓', v: `${devHoldPct.toFixed(2)}%`, ok: false, src: 'GoPlus' });
  } else {
    d3.items.push({ k: '所有者持仓', v: `${devHoldPct.toFixed(2)}%`, ok: false, src: 'GoPlus' });
    risks.push({ k: '团队持仓过高', desc: '所有者持有大量代币，抛售压力大' });
  }

  // 2. 税率可改性（5分）
  if (!yes(goplus.slippage_modifiable) && !yes(goplus.personal_slippage_modifiable)) {
    s3 += 5; d3.items.push({ k: '税率修改', v: '不可修改', ok: true, src: 'GoPlus' });
  } else {
    d3.items.push({ k: '税率修改', v: '可随时修改', ok: false, src: 'GoPlus' });
    risks.push({ k: '税率可随时修改', desc: '所有者可调高交易税，属软跑路手段' });
  }

  // 3. 交易暂停（5分）
  if (!yes(goplus.transfer_pausable)) {
    s3 += 5; d3.items.push({ k: '暂停交易', v: '不可暂停', ok: true, src: 'GoPlus' });
  } else {
    d3.items.push({ k: '暂停交易', v: '可暂停', ok: false, src: 'GoPlus' });
    risks.push({ k: '交易可被暂停', desc: '所有者可冻结所有交易' });
  }

  // 4. 交易税（4分）
  const tax = parseFloat(goplus.transfer_tax || '0') * 100;
  if (tax <= 5) {
    s3 += 4; d3.items.push({ k: '交易税', v: `${tax.toFixed(1)}%`, ok: true, src: 'GoPlus' });
  } else if (tax <= 10) {
    s3 += 2; d3.items.push({ k: '交易税', v: `${tax.toFixed(1)}%`, ok: false, src: 'GoPlus' });
  } else {
    d3.items.push({ k: '交易税', v: `${tax.toFixed(1)}%`, ok: false, src: 'GoPlus' });
    risks.push({ k: '交易税过高', desc: '高税率会大幅侵蚀收益' });
  }

  d3.score = s3;
  dims.push(d3);

  /* ---------- 维度四：生态与开发（10）---------- */
  let s4 = 0;
  const d4 = { name: '生态与开发', max: 10, score: 0, items: [] };

  if (llama) {
    s4 += 3;
    d4.items.push({ k: '协议收录', v: llama.name, ok: true, src: 'DefiLlama' });
    if (llama.github) {
      s4 += 4;
      d4.items.push({ k: 'GitHub', v: llama.github, ok: true, src: 'DefiLlama' });
    } else {
      d4.items.push({ k: 'GitHub', v: '未关联', ok: false, src: 'DefiLlama' });
    }
    if (llama.twitter) {
      s4 += 3;
      d4.items.push({ k: 'Twitter', v: '@' + llama.twitter, ok: true, src: 'DefiLlama' });
    } else {
      d4.items.push({ k: 'Twitter', v: '未关联', ok: false, src: 'DefiLlama' });
    }
  } else {
    d4.items.push({ k: '协议收录', v: 'DefiLlama 未收录', ok: false, src: 'DefiLlama' });
    risks.push({ k: '未被 DeFi 数据平台收录', desc: '缺少第三方数据验证' });
  }

  d4.score = s4;
  dims.push(d4);

  /* ---------- 维度五：市场与流动性（10）---------- */
  let s5 = 0;
  const d5 = { name: '市场与流动性', max: 10, score: 0, items: [] };

  // 1. 交易对数量（4分）
  const pairs = dex?.allPairsCount || 0;
  if (pairs >= 5) {
    s5 += 4; d5.items.push({ k: '交易对数量', v: `${pairs} 个`, ok: true, src: 'DexScreener' });
  } else if (pairs >= 2) {
    s5 += 2; d5.items.push({ k: '交易对数量', v: `${pairs} 个`, ok: false, src: 'DexScreener' });
  } else {
    d5.items.push({ k: '交易对数量', v: `${pairs} 个`, ok: false, src: 'DexScreener' });
  }

  // 2. 24h 成交量（3分）
  const vol = dex?.volume24h || 0;
  if (vol >= 50000) {
    s5 += 3; d5.items.push({ k: '24h 成交量', v: `$${(vol / 1e3).toFixed(0)}K`, ok: true, src: 'DexScreener' });
  } else if (vol >= 5000) {
    s5 += 2; d5.items.push({ k: '24h 成交量', v: `$${(vol / 1e3).toFixed(1)}K`, ok: false, src: 'DexScreener' });
  } else {
    d5.items.push({ k: '24h 成交量', v: `$${vol.toFixed(0)}`, ok: false, src: 'DexScreener' });
  }

  // 3. 价格波动（3分）
  const chg = Math.abs(dex?.priceChange24h || 0);
  if (chg <= 20) {
    s5 += 3; d5.items.push({ k: '24h 波动', v: `${chg.toFixed(1)}%`, ok: true, src: 'DexScreener' });
  } else if (chg <= 50) {
    s5 += 2; d5.items.push({ k: '24h 波动', v: `${chg.toFixed(1)}%`, ok: false, src: 'DexScreener' });
  } else {
    d5.items.push({ k: '24h 波动', v: `${chg.toFixed(1)}%`, ok: false, src: 'DexScreener' });
    risks.push({ k: '价格剧烈波动', desc: '24 小时波动超过 50%' });
  }

  d5.score = s5;
  dims.push(d5);

  /* ---------- 汇总 ---------- */
  let total = dims.reduce((s, d) => s + d.score, 0);
  const vetoed = flags.length > 0 && !isTrusted;
  if (vetoed) total = Math.min(total, 25);

  let grade, gradeText, gradeColor;
  if (vetoed)          { grade = 'F'; gradeText = '高危 · 不建议参与'; gradeColor = '#ef4444'; }
  else if (total >= 85) { grade = 'A'; gradeText = '优质';            gradeColor = '#22c55e'; }
  else if (total >= 70) { grade = 'B'; gradeText = '良好';            gradeColor = '#84cc16'; }
  else if (total >= 55) { grade = 'C'; gradeText = '一般 · 谨慎';     gradeColor = '#eab308'; }
  else if (total >= 40) { grade = 'D'; gradeText = '高风险';          gradeColor = '#f97316'; }
  else                  { grade = 'E'; gradeText = '极高风险';        gradeColor = '#ef4444'; }

  return { total, dims, flags, risks, grade, gradeText, gradeColor, vetoed };
}

/* ============ 主查询流程 ============ */
async function queryToken(chainId, address) {
  const addr = address.toLowerCase();

  const [goplusRes, dexRes] = await Promise.allSettled([
    getGoPlus(chainId, addr),
    getDexScreener(addr),
  ]);

  if (goplusRes.status === 'rejected') {
    throw new Error(goplusRes.reason?.message || 'GoPlus 查询失败');
  }

  const goplus = goplusRes.value;
  const dex = dexRes.status === 'fulfilled' ? dexRes.value : null;
  const llama = await getDefiLlama(goplus.token_symbol).catch(() => null);

  const holders = analyzeHolders(goplus);
  const lp = analyzeLP(goplus);
  const score = calculateScore(goplus, dex, llama, holders, lp);

  return {
    contract: address,
    chainId,
    chainName: CHAINS[chainId]?.name || `Chain ${chainId}`,
    basic: {
      name: goplus.token_name || '—',
      symbol: goplus.token_symbol || '—',
      totalSupply: holders.total,
      holderCount: holders.holderCount,
      creator: goplus.creator_address || '—',
      owner: goplus.owner_address || '—',
      isTrusted: goplus.trust_list === '1' || goplus.trust_list === 1,
    },
    dex, llama, holders, lp, goplus, score,
    fetchedAt: new Date().toISOString(),
  };
}
