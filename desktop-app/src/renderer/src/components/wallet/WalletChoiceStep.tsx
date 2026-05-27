import { Sparkles, Upload } from 'lucide-react';

interface WalletChoiceStepProps {
  onCreate: () => void;
  onImport: () => void;
}

export default function WalletChoiceStep({ onCreate, onImport }: WalletChoiceStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-[var(--color-text-secondary)] mb-8">Choose how you want to get started</p>

      <div className="space-y-4">
        {/* Create New Wallet */}
        <button
          onClick={onCreate}
          className="w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.01] bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-sm hover:border-accent-primary/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
              <Sparkles size={20} className="text-accent-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Create New Wallet
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Generate a new secure wallet with a fresh seed phrase
              </p>
            </div>
          </div>
        </button>

        {/* Import Existing Wallet */}
        <button
          onClick={onImport}
          className="w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.01] bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-sm hover:border-accent-primary/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
              <Upload size={20} className="text-accent-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Import Existing Wallet
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Restore your wallet using an existing seed phrase
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}