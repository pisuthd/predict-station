import { motion } from 'framer-motion';
import { Wallet, Check, Copy, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import BalanceSection from './BalanceSection';

interface AccountCardProps {
  network?: 'mainnet' | 'testnet';
}

export default function AccountCard({ network = 'testnet' }: AccountCardProps) {
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Auto-create wallet if no wallet exists
  useEffect(() => {
    const initWallet = async () => {
      try {
        const status = await window.api.wallet.getStatus();
        if (status.hasWallet) {
          const address = await window.api.wallet.getAddress();
          setWalletAddress(address);
        } else if (!isCreating) {
          // Auto-create wallet
          setIsCreating(true);
          const newAddress = await window.api.wallet.createWallet();
          setWalletAddress(newAddress);
          setIsCreating(false);
        }
      } catch (error) {
        console.error('Failed to init wallet:', error);
        setIsCreating(false);
      }
    };

    initWallet();
  }, []);

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)] shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
          <Wallet size={20} className="text-accent-primary" />
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
            {walletAddress ? truncateAddress(walletAddress) : isCreating ? 'Creating...' : '0x...'}
          </p>
        </div>
        {walletAddress && (
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-accent-primary hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        )}
      </div>

      {/* Balance Section */}
      {walletAddress && (
        <BalanceSection walletAddress={walletAddress} network={network} />
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