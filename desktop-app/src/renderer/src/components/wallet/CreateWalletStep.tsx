import { Copy, Check } from 'lucide-react';

interface CreateWalletStepProps {
  seedPhrase: string;
  copied: boolean;
  onCopy: () => void;
  onContinue: () => void;
}

export default function CreateWalletStep({ seedPhrase, copied, onCopy, onContinue }: CreateWalletStepProps) {
  const words = seedPhrase.split(' ');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Your Recovery Phrase</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Write down these 24 words in order and store them safely. This is the only way to recover your wallet.
        </p>
      </div>

      {/* Seed Phrase Grid */}
      <div className="grid grid-cols-4 gap-3 p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] mb-6">
        {words.map((word, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] w-5">{index + 1}.</span>
            <span className="text-sm font-mono text-[var(--color-text-primary)]">{word}</span>
          </div>
        ))}
      </div>

      {/* Copy Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> Never share your recovery phrase with anyone. Anyone with this phrase can access your funds.
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="px-8 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
        >
          I've written it down
        </button>
      </div>
    </div>
  );
}