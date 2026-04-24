import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDown, Copy, CheckCircle2, RefreshCcw, Info, AlertTriangle, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getCurrencies, getPrice, createSwap, getSwapStatus, STATUS_LABELS } from '../services/ghostyApi';
import type { Currency, PriceQuote, SwapStatus } from '../services/ghostyApi';
import TokenSelector from './TokenSelector';
import './SwapWidget.css';

// Address validation patterns per network
const ADDRESS_PATTERNS: Record<string, RegExp> = {
  'BITCOIN': /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/,
  'ETHEREUM': /^0x[a-fA-F0-9]{40}$/,
  'BSC': /^0x[a-fA-F0-9]{40}$/,
  'POLYGON': /^0x[a-fA-F0-9]{40}$/,
  'ARBITRUM': /^0x[a-fA-F0-9]{40}$/,
  'OPTIMISM': /^0x[a-fA-F0-9]{40}$/,
  'BASE': /^0x[a-fA-F0-9]{40}$/,
  'AVALANCHE': /^0x[a-fA-F0-9]{40}$/,
  'FANTOM': /^0x[a-fA-F0-9]{40}$/,
  'CRONOS': /^0x[a-fA-F0-9]{40}$/,
  'LINEA': /^0x[a-fA-F0-9]{40}$/,
  'ZKSYNC ERA': /^0x[a-fA-F0-9]{40}$/,
  'SOLANA': /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  'TRON': /^T[a-zA-Z0-9]{33}$/,
  'RIPPLE': /^r[a-zA-Z0-9]{24,34}$/,
  'CARDANO': /^addr1[a-z0-9]{58,}$/,
  'DOGE': /^D[5-9A-HJ-NP-U][a-km-zA-HJ-NP-Z0-9]{32}$/,
  'LITECOIN': /^(L|M|ltc1)[a-zA-HJ-NP-Z0-9]{25,62}$/,
  'MONERO': /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93,}$/,
  'TONCOIN': /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/,
};

function validateAddress(address: string, network: string): boolean {
  if (!address || address.length < 10) return false;
  const pattern = ADDRESS_PATTERNS[network];
  if (pattern) return pattern.test(address);
  // For unknown networks, accept anything > 20 chars as valid
  return address.length >= 20;
}

export default function SwapWidget() {
  const [view, setView] = useState<'form' | 'status'>('form');
  const [amount, setAmount] = useState('1');
  const [toAddress, setToAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedRecv, setCopiedRecv] = useState(false);
  const [anonMode, setAnonMode] = useState(true);
  const [addressWarning, setAddressWarning] = useState('');
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Token selection
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromToken, setFromToken] = useState<Currency | null>(null);
  const [toToken, setToToken] = useState<Currency | null>(null);
  const [showSelector, setShowSelector] = useState<'from' | 'to' | null>(null);

  // Price quote
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fiat (USD) value of the "from" amount
  const [fiatValue, setFiatValue] = useState<string>('');
  const fiatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swap status (live data from API)
  const [orderId, setOrderId] = useState<string | null>(null);
  const [swapStatus, setSwapStatus] = useState<SwapStatus | null>(null);
  const statusTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load currencies on mount
  useEffect(() => {
    getCurrencies().then((data) => {
      setCurrencies(data);
      const btc = data.find((c) => c.param === 'BTC');
      const sol = data.find((c) => c.param === 'SOL');
      if (btc) setFromToken(btc);
      if (sol) setToToken(sol);
    }).catch(console.error);
  }, []);

  // Fetch price quote with debounce
  const fetchQuote = useCallback(() => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    setQuoteError('');
    getPrice(fromToken.param, toToken.param, parseFloat(amount), anonMode)
      .then((data) => { setQuote(data); setQuoteLoading(false); })
      .catch((err) => { setQuoteError(err.message || 'Rate unavailable'); setQuoteLoading(false); console.error(err); });
  }, [fromToken, toToken, amount, anonMode]);

  useEffect(() => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(fetchQuote, 600);
    return () => { if (priceTimer.current) clearTimeout(priceTimer.current); };
  }, [fetchQuote]);

  // Fetch USD fiat value for the "from" token
  const fetchFiat = useCallback(() => {
    if (!fromToken || !amount || parseFloat(amount) <= 0) {
      setFiatValue('');
      return;
    }
    // Use USDT as the "to" currency to get USD value
    const usdtToken = currencies.find((c) => c.param === 'USDT' && c.network === 'ETHEREUM');
    if (!usdtToken || fromToken.param === 'USDT') {
      setFiatValue('');
      return;
    }
    getPrice(fromToken.param, 'USDT', parseFloat(amount), false)
      .then((data) => {
        const usd = Math.round(data.amount_to);
        setFiatValue(`~${usd.toLocaleString()} USD`);
      })
      .catch(() => setFiatValue(''));
  }, [fromToken, amount, currencies]);

  useEffect(() => {
    if (fiatTimer.current) clearTimeout(fiatTimer.current);
    fiatTimer.current = setTimeout(fetchFiat, 800);
    return () => { if (fiatTimer.current) clearTimeout(fiatTimer.current); };
  }, [fetchFiat]);

  // Address validation
  useEffect(() => {
    if (!toAddress || toAddress.length < 5) {
      setAddressWarning('');
      setShowWarningBanner(false);
      return;
    }
    if (toToken) {
      const isValid = validateAddress(toAddress, toToken.network);
      if (!isValid && toAddress.length >= 10) {
        setAddressWarning('Invalid address.');
        setShowWarningBanner(true);
      } else {
        setAddressWarning('');
        setShowWarningBanner(false);
      }
    }
  }, [toAddress, toToken]);

  // Poll swap status every 10s when in status view
  useEffect(() => {
    if (view === 'status' && orderId) {
      const poll = () => {
        getSwapStatus(orderId)
          .then((data) => setSwapStatus(data))
          .catch(console.error);
      };
      poll();
      statusTimer.current = setInterval(poll, 10000);
      return () => { if (statusTimer.current) clearInterval(statusTimer.current); };
    }
  }, [view, orderId]);

  // Stop polling when swap is done (status >= 4)
  useEffect(() => {
    if (swapStatus && swapStatus.status >= 4 && statusTimer.current) {
      clearInterval(statusTimer.current);
    }
  }, [swapStatus]);

  // ---- HANDLERS ----
  const handleSwap = async () => {
    if (!amount || !toAddress || !fromToken || !toToken) return;
    // Validate address before creating
    if (!validateAddress(toAddress, toToken.network)) {
      setAddressWarning('Invalid address.');
      setShowWarningBanner(true);
      return;
    }
    setIsCreating(true);
    setCreateError('');
    try {
      const id = await createSwap({
        currency_from: fromToken.param,
        currency_to: toToken.param,
        amount_from: parseFloat(amount),
        address_to: toAddress,
        is_anonym: anonMode,
      });
      setOrderId(id);
      setView('status');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create swap');
      console.error(err);
    }
    setIsCreating(false);
  };

  const copyToClipboard = (text: string, type: 'id' | 'addr' | 'recv') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }
    else if (type === 'addr') { setCopiedAddr(true); setTimeout(() => setCopiedAddr(false), 2000); }
    else { setCopiedRecv(true); setTimeout(() => setCopiedRecv(false), 2000); }
  };

  const handleTokenSelect = (currency: Currency) => {
    if (showSelector === 'from') {
      if (toToken?.param === currency.param) setToToken(fromToken);
      setFromToken(currency);
    } else {
      if (fromToken?.param === currency.param) setFromToken(toToken);
      setToToken(currency);
      // Clear address when changing to-token since format changes
      setToAddress('');
      setAddressWarning('');
      setShowWarningBanner(false);
    }
    setShowSelector(null);
  };

  const handleSwapDirection = () => {
    const tempFrom = fromToken;
    setFromToken(toToken);
    setToToken(tempFrom);
    setToAddress('');
    setAddressWarning('');
  };

  const handleNewSwap = () => {
    setView('form');
    setOrderId(null);
    setSwapStatus(null);
    setToAddress('');
  };

  const truncate = (addr: string) =>
    addr.length > 16 ? addr.substring(0, 8) + '...' + addr.substring(addr.length - 8) : addr;

  const getProgress = (status: number) => {
    if (status === 0) return 10;
    if (status === 1) return 35;
    if (status === 2) return 55;
    if (status === 3) return 80;
    if (status === 4) return 100;
    return 10;
  };

  // ==================== STATUS VIEW ====================
  if (view === 'status' && orderId) {
    const s = swapStatus;
    const statusNum = s?.status ?? 0;
    const statusLabel = STATUS_LABELS[statusNum] || 'Processing...';
    const isComplete = statusNum === 4;
    const isFailed = statusNum >= 5;

    return (
      <div className="swap-widget status-view animate-fade-in">
        <div className="status-header">
          <span className="status-title">
            {isComplete ? '✅ SWAP COMPLETE' : isFailed ? '❌ SWAP ' + statusLabel.toUpperCase() : 'ANONYMOUS SWAP CREATED'}
          </span>
        </div>
        
        <div className="status-section">
          <div className="status-label">SEND</div>
          <div className="status-value highlight-value">
            <span className="amount">{s?.amount_from ?? amount}</span>
            <div className="token-badge">
              {fromToken && <img src={fromToken.img} alt={fromToken.name} className="status-token-img" />}
              <span className="token-symbol">{s?.currency_from ?? fromToken?.name}</span>
              <span className="token-name">{fromToken?.name}</span>
            </div>
          </div>
        </div>

        <div className="status-section">
          <div className="status-label">
            TO <button className="btn-show-qr" onClick={() => setShowQR(!showQR)}>SHOW ▨</button>
          </div>
          <div className="status-value address-box">
            <span className="address-text">{s?.address_from ? truncate(s.address_from) : '...'}</span>
            <button className="btn-copy" onClick={() => s?.address_from && copyToClipboard(s.address_from, 'addr')}>
              {copiedAddr ? <CheckCircle2 size={18} color="#4ade80" /> : <Copy size={18} />}
            </button>
          </div>
          {showQR && s?.address_from && (
            <div className="qr-container animate-fade-in">
              <QRCodeSVG 
                value={s.address_from} 
                size={160} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"M"} 
                includeMargin={true}
              />
            </div>
          )}
        </div>

        <div className="loading-bar-container">
          <div className="loading-bar">
            <div
              className={`loading-progress ${isComplete ? 'complete' : ''} ${isFailed ? 'failed' : ''}`}
              style={statusNum > 0 ? { width: `${getProgress(statusNum)}%`, animation: 'none' } : undefined}
            ></div>
          </div>
          <div className="loading-text">{statusLabel}</div>
        </div>

        <div className="status-section">
          <div className="status-label highlight-label">PRIVYCASH TX ID</div>
          <div className="status-value address-box">
            <span className="address-text highlight-text">{orderId}</span>
            <button className="btn-copy" onClick={() => copyToClipboard(orderId, 'id')}>
               {copiedId ? <CheckCircle2 size={18} color="#4ade80" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="status-section">
          <div className="status-label">RECEIVER WALLET</div>
          <div className="status-value address-box">
            <span className="address-text">{s?.address_to ? truncate(s.address_to) : truncate(toAddress)}</span>
            <button className="btn-copy" onClick={() => copyToClipboard(s?.address_to || toAddress, 'recv')}>
              {copiedRecv ? <CheckCircle2 size={18} color="#4ade80" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="status-section">
          <div className="status-label">YOU GET</div>
          <div className="status-value get-value">
            <span className="amount">{s?.amount_to?.toFixed(6) ?? quote?.amount_to?.toFixed(6) ?? '...'}</span>
            <div className="token-badge sol">
              {toToken && <img src={toToken.img} alt={toToken.name} className="status-token-img" />}
              <span className="token-symbol">{s?.currency_to ?? toToken?.name}</span>
              <span className="token-name">{toToken?.network}</span>
            </div>
          </div>
        </div>

        {(isComplete || isFailed) && (
          <button className="btn-swap-now" onClick={handleNewSwap}>
            NEW SWAP
          </button>
        )}
      </div>
    );
  }

  // ==================== FORM VIEW ====================
  const outputDisplay = quoteLoading ? '...' : quote ? quote.amount_to.toFixed(6) : '0.00';
  const minReceived = quote ? (quote.amount_to * 0.96).toFixed(3) : '0.00';

  return (
    <div className="swap-widget form-view animate-fade-in">
      
      {/* Token Selector Modal */}
      {showSelector && (
        <TokenSelector
          currencies={currencies}
          selected={showSelector === 'from' ? fromToken : toToken}
          onSelect={handleTokenSelect}
          onClose={() => setShowSelector(null)}
        />
      )}

      {/* Invalid Address Warning Banner */}
      {showWarningBanner && (
        <div className="warning-banner">
          <div className="warning-content">
            <AlertTriangle size={18} />
            <span>{addressWarning}</span>
          </div>
          <button className="warning-close" onClick={() => setShowWarningBanner(false)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Anon Mode Toggle */}
      <div className="anon-mode-container">
        <span className="anon-label">Anon Mode</span>
        <div className="anon-toggle">
          <button className={`toggle-btn ${!anonMode ? 'active-off' : ''}`} onClick={() => setAnonMode(false)}>OFF</button>
          <button className={`toggle-btn ${anonMode ? 'active-on' : ''}`} onClick={() => setAnonMode(true)}>ON</button>
        </div>
      </div>

      {/* Step 1 */}
      <div className="step-header">
        <div className="step-badge">STEP 1</div>
        <button className="btn-refresh" onClick={fetchQuote}><RefreshCcw size={16} /></button>
      </div>

      <div className="input-group">
        <div className="input-row">
          <div className="input-col">
            <label>Send Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div className="token-col">
            <button className="token-select" onClick={() => setShowSelector('from')}>
              {fromToken ? <img src={fromToken.img} alt={fromToken.name} className="select-token-img" /> : <div className="token-icon btc-icon">?</div>}
              <span className="token-symbol">{fromToken?.name || '...'}</span>
              <span className="token-name">{fromToken?.name || ''}</span>
              <span className="caret">˅</span>
            </button>
            <div className="fiat-value">{fiatValue}</div>
          </div>
        </div>
      </div>

      <div className="swap-divider">
        <div className="swap-icon-wrapper" onClick={handleSwapDirection}><ArrowDown size={18} /></div>
      </div>

      <div className="input-group">
        <div className="input-row">
          <div className="input-col">
            <label>Est. Output</label>
            <input type="text" value={quoteError || outputDisplay} disabled className={`disabled-input ${quoteError ? 'error-text' : ''}`} />
          </div>
          <div className="token-col">
            <button className="token-select" onClick={() => setShowSelector('to')}>
              {toToken ? <img src={toToken.img} alt={toToken.name} className="select-token-img" /> : <div className="token-icon sol-icon">?</div>}
              <span className="token-symbol">{toToken?.name || '...'}</span>
              <span className="token-name">{toToken?.network || ''}</span>
              <span className="caret">˅</span>
            </button>
            <div className="fiat-value">&nbsp;</div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="step-header">
        <div className="step-badge">STEP 2</div>
      </div>

      <div className="input-group receive-group">
        <div className="receive-header">
          <label>RECEIVER WALLET</label>
          <div className="info-icon-wrapper">
            <Info size={14} className="info-icon" />
            <div className="wallet-helper-msg">
              Please input your wallet, where you want to receive your funds
            </div>
          </div>
        </div>
        <span className="receive-subtitle">Receiving wallet address in {toToken?.network || '...'} format</span>
        <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="address-input" />
      </div>

      {createError && <div className="swap-error">{createError}</div>}

      <button className="btn-swap-now" onClick={handleSwap} disabled={isCreating || !toAddress || !amount || !quote || !!addressWarning}>
        {isCreating ? 'CREATING SWAP...' : 'SWAP NOW'}
      </button>

      {/* More Info */}
      <div className="more-info-container">
        <h4 className="info-title">MORE INFORMATION</h4>
        <div className="info-row"><span>Min. Received</span><span>{minReceived} {toToken?.name || ''}</span></div>
        <div className="info-row"><span>Avg. TXO Time</span><span>5 minutes</span></div>
      </div>
    </div>
  );
}
