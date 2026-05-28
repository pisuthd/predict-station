import { motion } from 'framer-motion';
import { Bot, Check, Copy, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTokenBalances } from '../../hooks';

interface AccountCardProps {
  address: string | null;
  network: 'mainnet' | 'testnet';
  setNetwork: (network: 'mainnet' | 'testnet') => void;
  hasWallet: boolean;
}

const COIN_IMAGES = {
  SUI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
  WAL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/36119.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/USDC.png?1769615602',
};

export default function AccountCard({ address, network, setNetwork, hasWallet }: AccountCardProps) {
  const [copied, setCopied] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const { balances, isLoading } = useTokenBalances(address, network);

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const tokens = [
    { symbol: 'SUI', name: 'SUI', balance: balances.sui, image: COIN_IMAGES.SUI },
    { symbol: 'WAL', name: 'WAL', balance: balances.wal, image: COIN_IMAGES.WAL },
    { symbol: 'USDC', name: 'USDC', balance: '0', image: COIN_IMAGES.USDC },
  ];

  const handlePrev = () => {
    setSliderIndex((prev) => (prev === 0 ? tokens.length - 2 : prev - 1));
  };

  const handleNext = () => {
    setSliderIndex((prev) => (prev >= tokens.length - 2 ? 0 : prev + 1));
  };

  // Get visible tokens (2 at a time)
  const visibleTokens = [
    tokens[sliderIndex],
    tokens[(sliderIndex + 1) % tokens.length],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)] shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
          <Bot size={20} className="text-accent-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Trading Wallet</h3>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Wallet Address</p>
          <p className="text-sm font-mono text-[var(--color-text-muted)]">
            {hasWallet && address ? truncateAddress(address) : '0x...'}
          </p>
        </div>
        {hasWallet && (
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-accent-primary hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        )}
      </div>

      {/* Token Balance Slider - 2 at a time */}
      {hasWallet && (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-accent-primary hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex-1 grid grid-cols-2 gap-3">
              {visibleTokens.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]"
                >
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{token.name}</p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {isLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        token.balance
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-accent-primary hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

     

      {/* Network Row - AFTER balances */}
      <div className="flex items-center gap-3 mt-4">
        <p className="text-xs text-[var(--color-text-muted)] font-medium whitespace-nowrap">Network</p>
        <div className="relative flex-1">
          <select
            disabled
            value="testnet"
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-medium cursor-not-allowed text-sm"
          >
            <option value="testnet">Sui Testnet</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
        </div>
      </div>

       {/* Notice */}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        Manage your wallet: backup seed, reset, or import existing at Settings.
      </p>

    </motion.div>
  );
}