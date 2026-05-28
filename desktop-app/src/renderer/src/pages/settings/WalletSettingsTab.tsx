import { useState, useEffect } from 'react';
import { Eye, Trash2, Check, Copy, Download } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';
import ImportWalletModal from '../../components/common/ImportWalletModal';

export default function WalletSettingsTab() {
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [revealedPhrase, setRevealedPhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletPath, setWalletPath] = useState<string>('');
  const [confirmInput, setConfirmInput] = useState('');
  const [resetInput, setResetInput] = useState('');

  // Get wallet status and path on mount
  useEffect(() => {
    const getWalletInfo = async () => {
      try {
        const [status, path] = await Promise.all([
          window.api.wallet.getStatus(),
          window.api.wallet.getWalletPath(),
        ]);
        setWalletPath(path);
        if (status.hasWallet) {
          const address = await window.api.wallet.getAddress();
          setWalletAddress(address);
        }
      } catch (error) {
        console.error('Failed to get wallet info:', error);
      }
    };
    getWalletInfo();
  }, []);

  const handleRevealSeed = async () => {
    if (confirmInput !== 'CONFIRM') return;
    setConfirmInput('');
    try {
      const phrase = await window.api.wallet.revealSeedPhrase();
      setRevealedPhrase(phrase);
      setShowRevealModal(false);
    } catch (error) {
      console.error('Failed to reveal seed phrase:', error);
    }
  };

  const handleResetWallet = async () => {
    if (resetInput !== 'RESET') return;
    setResetInput('');
    try {
      await window.api.wallet.deleteWallet();
      setRevealedPhrase(null);
      setWalletAddress(null);
      setShowResetModal(false);
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

  

  const hasWallet = walletAddress !== null;

  return (
    <>
      {/* Reveal Modal with CONFIRM input */}
      <ConfirmModal
        isOpen={showRevealModal}
        onClose={() => { setShowRevealModal(false); setConfirmInput(''); }}
        onCancel={() => { setShowRevealModal(false); setConfirmInput(''); }}
        onConfirm={handleRevealSeed}
        title="Reveal Seed Phrase"
        confirmText="Reveal"
        cancelText="Cancel"
        variant="default"
        customContent={
          <div className='mb-6'>
            <p className="mb-4 text-[var(--color-text-muted)]">
              Type <span className="font-bold text-[var(--color-text-primary)]">CONFIRM</span> to reveal your seed phrase. Make sure no one is watching.
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
              placeholder="Type CONFIRM"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-mono text-center uppercase tracking-wider placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        }
      />

      {/* Reset Modal with RESET input */}
      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => { setShowResetModal(false); setResetInput(''); }}
        onCancel={() => { setShowResetModal(false); setResetInput(''); }}
        onConfirm={handleResetWallet}
        title="Reset Wallet"
        confirmText="Reset"
        cancelText="Cancel"
        variant="danger"
        customContent={
          <div className='mb-6'>
            <p className="mb-4 text-[var(--color-text-muted)]">
              Type <span className="font-bold text-red-400">RESET</span> to confirm. This will permanently delete your wallet. Make sure you have backed up your seed phrase.
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value.toUpperCase())}
              placeholder="Type RESET"
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-mono text-center uppercase tracking-wider placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        }
      />

      {/* Import Modal */}
      <ImportWalletModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(address) => {
          setWalletAddress(address);
          setShowImportModal(false);
        }}
      />

      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Wallet</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Manage your wallet settings
        </p>

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

            {/* Import from Existing */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">Import from Existing</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Replace current wallet with another seed phrase
                  </p>
                </div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary-hover transition-colors"
                >
                  <Download size={14} />
                  Import
                </button>
              </div>
            </div>

            {/* Reset Wallet */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-400">Reset Wallet</h4>
                  <p className="text-xs text-red-300">
                    Permanently delete your wallet from this device
                  </p>
                </div>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Import from Existing */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">Import from Existing</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Restore wallet with your seed phrase
                  </p>
                </div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary-hover transition-colors"
                >
                  <Download size={14} />
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet File Path */}
        <div className="my-6 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Wallet File Location</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-mono break-all">
            {walletPath || 'Loading...'}
          </p>
        </div>

      </div>
    </>
  );
}