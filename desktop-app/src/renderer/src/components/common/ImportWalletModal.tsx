import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ImportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: string) => void;
}

export default function ImportWalletModal({ isOpen, onClose, onSuccess }: ImportWalletModalProps) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!seedPhrase.trim()) {
      setError('Please enter your seed phrase');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate seed phrase
      const isValid = await window.api.wallet.validateSeedPhrase(seedPhrase.trim());
      if (!isValid) {
        setError('Invalid seed phrase. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // Restore wallet
      const success = await window.api.wallet.restoreWallet(seedPhrase.trim());
      if (success) {
        // Get new address
        const address = await window.api.wallet.getAddress();
        setSeedPhrase('');
        onSuccess(address);
      } else {
        setError('Failed to import wallet. Please try again.');
      }
    } catch (err) {
      console.error('Failed to import wallet:', err);
      setError('Failed to import wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSeedPhrase('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Import Wallet
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-card)] text-[var(--color-text-muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-4 p-3 rounded-xl bg-amber-100 border border-amber-400 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            This will replace your current wallet with a new one. Make sure you have backed up your current seed phrase before proceeding.
          </p>
        </div>

        {/* Seed Phrase Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Seed Phrase
          </label>
          <textarea
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            placeholder="Enter your 12 or 24 word seed phrase (space separated)"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-mono text-sm placeholder:text-[var(--color-text-muted)] resize-none"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !seedPhrase.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}