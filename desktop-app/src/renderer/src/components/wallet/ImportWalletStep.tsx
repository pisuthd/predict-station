interface ImportWalletStepProps {
  importPhrase: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  canContinue: boolean;
}

export default function ImportWalletStep({ importPhrase, onChange, onContinue, canContinue }: ImportWalletStepProps) {
  const wordCount = importPhrase.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Import Your Wallet</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Enter your 12 or 24-word recovery phrase to restore your wallet
        </p>
      </div>

      {/* Textarea */}
      <div className="mb-6">
        <textarea
          value={importPhrase}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your recovery phrase (e.g., word1 word2 word3...)"
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-accent-primary transition-colors resize-none font-mono text-sm"
        />
        <p className="mt-2 text-xs text-[var(--color-text-muted)] text-right">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="px-8 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}