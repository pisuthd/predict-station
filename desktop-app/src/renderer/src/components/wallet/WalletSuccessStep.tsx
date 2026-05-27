import { CheckCircle2, ArrowRight } from 'lucide-react';

interface WalletSuccessStepProps {
  action: 'create' | 'import';
  onGoToDashboard: () => void;
}

export default function WalletSuccessStep({ action, onGoToDashboard }: WalletSuccessStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>

      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        {action === 'create' ? 'Wallet Created!' : 'Wallet Imported!'}
      </h2>
      
      <p className="text-[var(--color-text-secondary)] mb-8">
        {action === 'create' 
          ? 'Your new wallet has been created and is ready to use.'
          : 'Your wallet has been successfully restored.'
        }
      </p>

      <button
        onClick={onGoToDashboard}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
      >
        Go to Dashboard
        <ArrowRight size={18} />
      </button>
    </div>
  );
}