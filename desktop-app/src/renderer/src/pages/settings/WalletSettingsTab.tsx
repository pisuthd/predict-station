import { useState } from 'react';
import { Eye, Trash2, Check, Copy } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function WalletSettingsTab() {
  const { hasWallet, address, deleteWallet, revealSeedPhrase } = useWallet();
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [revealedPhrase, setRevealedPhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRevealSeed = async () => {
    try {
      const phrase = await revealSeedPhrase();
      setRevealedPhrase(phrase);
    } catch (error) {
      console.error('Failed to reveal seed phrase:', error);
    }
  };

  const handleResetWallet = async () => {
    try {
      await deleteWallet();
      setRevealedPhrase(null);
    } catch (error) {
      console.error('Failed to delete wallet:', error);
    }
  };

  const handleCopySeed = async () => {
    if (revealedPhrase) {
      await navigator.clipboard.writeText(revealedPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <>
      <ConfirmModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        onConfirm={handleRevealSeed}
        title="Reveal Seed Phrase"
        message="Your seed phrase will be revealed. Make sure no one is watching."
        confirmText="Reveal"
      />

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetWallet}
        title="Reset Wallet"
        message="This will permanently delete your wallet from this device. Make sure you have backed up your seed phrase."
        confirmText="Reset Wallet"
      />

      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Wallet</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Manage your wallet settings
        </p>
        
        {/* Wallet Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasWallet ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-[var(--color-text-secondary)]">
              {hasWallet ? 'Wallet Created' : 'No Wallet'}
            </span>
          </div>
          {hasWallet && address && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
              {truncateAddress(address)}
            </p>
          )}
        </div>

        {hasWallet ? (
          <div className="space-y-4">
            {/* Show Seed Phrase */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">Recovery Phrase</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {revealedPhrase ? 'Keep this secret!' : 'Click to reveal your 12-word recovery phrase'}
                  </p>
                </div>
                {!revealedPhrase && (
                  <button
                    onClick={() => setShowRevealModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary-hover transition-colors"
                  >
                    <Eye size={14} />
                    Reveal
                  </button>
                )}
              </div>

              {revealedPhrase && (
                <>
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] mb-3">
                    {revealedPhrase.split(' ').map((word, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <span className="text-[var(--color-text-muted)] w-4">{index + 1}.</span>
                        <span className="font-mono text-[var(--color-text-primary)]">{word}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopySeed}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => { setRevealedPhrase(null); setCopied(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Reset Wallet */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Reset Wallet</h4>
                  <p className="text-xs text-red-700">
                    Permanently delete your wallet from this device
                  </p>
                </div>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              No wallet found. Create a wallet to get started.
            </p>
            <a
              href="#/setup-wallet"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary-hover transition-colors"
            >
              Create Wallet
            </a>
          </div>
        )}
      </div>
    </>
  );
}