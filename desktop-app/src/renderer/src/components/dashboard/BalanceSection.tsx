import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTokenBalances } from '../../hooks';

const COIN_IMAGES = {
  SUI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
  WAL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/36119.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/USDC.png?1769615602',
};

interface BalanceSectionProps {
  walletAddress: string;
  network: 'mainnet' | 'testnet';
}

export default function BalanceSection({ walletAddress, network }: BalanceSectionProps) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const { balances, isLoading } = useTokenBalances(walletAddress, network);

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
  );
}