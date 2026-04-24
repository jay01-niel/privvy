import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { Currency } from '../services/ghostyApi';
import './TokenSelector.css';

interface Props {
  currencies: Currency[];
  selected: Currency | null;
  onSelect: (c: Currency) => void;
  onClose: () => void;
}

export default function TokenSelector({ currencies, selected, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get unique networks sorted by number of tokens
  const networkCounts = currencies.reduce<Record<string, number>>((acc, c) => {
    acc[c.network] = (acc[c.network] || 0) + 1;
    return acc;
  }, {});

  const networks = Object.entries(networkCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  // Filter currencies
  const filtered = currencies.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.param.toLowerCase().includes(search.toLowerCase()) ||
      c.network.toLowerCase().includes(search.toLowerCase());

    const matchesNetwork = !activeNetwork || c.network === activeNetwork;

    return matchesSearch && matchesNetwork;
  });

  return (
    <div className="token-modal-overlay" onClick={onClose}>
      <div className="token-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h3>Select Token</h3>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search token or network..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Network filter pills */}
        <div className="network-pills">
          <button
            className={`pill ${!activeNetwork ? 'active' : ''}`}
            onClick={() => setActiveNetwork(null)}
          >
            All
          </button>
          {networks.slice(0, 12).map((net) => (
            <button
              key={net}
              className={`pill ${activeNetwork === net ? 'active' : ''}`}
              onClick={() => setActiveNetwork(activeNetwork === net ? null : net)}
            >
              {net}
            </button>
          ))}
        </div>

        {/* Token list */}
        <div className="token-list">
          {filtered.length === 0 && (
            <div className="no-results">No tokens found</div>
          )}
          {filtered.map((c, i) => (
            <button
              key={`${c.param}-${c.network}-${i}`}
              className={`token-item ${selected?.param === c.param ? 'selected' : ''}`}
              onClick={() => onSelect(c)}
            >
              <img
                src={c.img}
                alt={c.name}
                className="token-item-icon"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="token-item-info">
                <span className="token-item-name">{c.name}</span>
                <span className="token-item-network">{c.network}</span>
              </div>
              <span className="token-item-param">{c.param}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
