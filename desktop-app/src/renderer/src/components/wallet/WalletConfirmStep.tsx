import { AlertTriangle, Loader2 } from 'lucide-react';

interface WalletConfirmStepProps {
  action: 'create' | 'import';
  isLoading: boolean;
  onConfirm: () => void;
}

export default function WalletConfirmStep({ action, isLoading, onConfirm }: WalletConfirmStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          {action === 'create' ? 'Create Wallet?' : 'Import Wallet?'}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {action === 'create' 
            ? 'Your wallet will be created and the seed phrase will be stored securely on this device.'
            : 'Your wallet will be restored using the provided seed phrase and stored securely on this device.'
          }
        </p>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="mb-2"><strong>Make sure you have backed up your recovery phrase!</strong></p>
            <p>If you lose access to this device, you will need your recovery phrase to restore your wallet.</p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {action === 'create' ? 'Creating...' : 'Importing...'}
            </>
          ) : (
            action === 'create' ? 'Create Wallet' : 'Import Wallet'
          )}
        </button>
      </div>
    </div>
  );
}