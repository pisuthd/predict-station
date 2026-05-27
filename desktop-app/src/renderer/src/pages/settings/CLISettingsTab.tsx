import { Check, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCLI, useWalletValidation } from '../../context/CLIContext';

const CLI_INFO = {
  sui: { name: 'Sui CLI', command: 'sui --version' },
  walrus: { name: 'Walrus CLI', command: 'walrus --version' },
  siteBuilder: { name: 'Site Builder CLI', command: 'site-builder --version' },
};

export default function CLISettingsTab() {
  const { versions, isLoading: cliLoading, refetch } = useCLI();
  const { status: walletStatus, refetch: refetchWallet, isReady } = useWalletValidation();

  const handleRefresh = async () => {
    await refetch();
    await refetchWallet();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">CLI Tools & Environment</h2>
        <button
          onClick={handleRefresh}
          disabled={cliLoading || walletStatus.isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={(cliLoading || walletStatus.isLoading) ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Manage your CLI tools for interacting with Sui and Walrus
      </p>

      {/* Environment Status Summary */}
      <div className={`mb-6 p-4 rounded-xl border ${
        isReady 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {isReady ? (
            <CheckCircle2 size={24} className="text-green-500" />
          ) : (
            <AlertCircle size={24} className="text-yellow-500" />
          )}
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">
              {isReady ? 'Environment Ready' : 'Environment Not Ready'}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isReady 
                ? 'All CLIs installed and wallet configured' 
                : 'Some requirements are not met'}
            </p>
          </div>
        </div>
      </div>

      {cliLoading || walletStatus.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : versions ? (
        <div className="space-y-3">
          {/* SUI */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {versions.sui.found ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={16} className="text-green-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X size={16} className="text-red-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {CLI_INFO.sui.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {CLI_INFO.sui.command}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {versions.sui.found ? (
                  <p className="text-sm font-mono text-green-500">{versions.sui.version}</p>
                ) : (
                  <p className="text-sm text-red-500">{versions.sui.error || 'Not found'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Walrus */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {versions.walrus.found ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={16} className="text-green-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X size={16} className="text-red-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {CLI_INFO.walrus.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {CLI_INFO.walrus.command}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {versions.walrus.found ? (
                  <p className="text-sm font-mono text-green-500">{versions.walrus.version}</p>
                ) : (
                  <p className="text-sm text-red-500">{versions.walrus.error || 'Not found'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Site Builder */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {versions.siteBuilder.found ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={16} className="text-green-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X size={16} className="text-red-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {CLI_INFO.siteBuilder.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {CLI_INFO.siteBuilder.command}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {versions.siteBuilder.found ? (
                  <p className="text-sm font-mono text-green-500">{versions.siteBuilder.version}</p>
                ) : (
                  <p className="text-sm text-red-500">{versions.siteBuilder.error || 'Not found'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Status Section */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <p className="font-medium text-[var(--color-text-primary)] mb-3">Wallet Status</p>
            <div className="space-y-2">
              {/* Network */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-surface)]">
                <span className="text-sm text-[var(--color-text-secondary)]">Network</span>
                <span className={`text-sm font-mono ${walletStatus.network ? 'text-green-500' : 'text-red-500'}`}>
                  {walletStatus.network || 'Not connected'}
                </span>
              </div>
              {/* Active Address */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-surface)]">
                <span className="text-sm text-[var(--color-text-secondary)]">Active Address</span>
                <span className={`text-sm font-mono ${walletStatus.address ? 'text-green-500' : 'text-red-500'}`}>
                  {walletStatus.address ? `${walletStatus.address.slice(0, 8)}...${walletStatus.address.slice(-6)}` : 'None'}
                </span>
              </div>
              {/* Balances */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-surface)]">
                <span className="text-sm text-[var(--color-text-secondary)]">SUI Balance</span>
                <span className="text-sm font-mono text-[var(--color-text-primary)]">
                  {walletStatus.suiBalance !== null ? `${walletStatus.suiBalance} SUI` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-surface)]">
                <span className="text-sm text-[var(--color-text-secondary)]">WAL Balance</span>
                <span className="text-sm font-mono text-[var(--color-text-primary)]">
                  {walletStatus.walBalance !== null ? `${walletStatus.walBalance} WAL` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-[var(--color-text-muted)] text-sm">
          Failed to check CLI versions
        </div>
      )}

      {/* Help text */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
        <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Installation</h4>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          For installation instructions, please visit the Walrus documentation.
        </p>
        <a
          href="https://docs.wal.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary-hover transition-colors"
        >
          View Walrus Docs
        </a>
      </div>
    </div>
  );
}