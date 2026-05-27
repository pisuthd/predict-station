import { motion } from 'framer-motion';
import { Terminal, Check, X, RefreshCw } from 'lucide-react';
import { useCLI } from '../../context/CLIContext';

const CLI_INFO = {
  sui: { name: 'Sui CLI', command: 'sui --version' },
  walrus: { name: 'Walrus CLI', command: 'walrus --version' },
  siteBuilder: { name: 'Site Builder CLI', command: 'site-builder --version' },
};

export default function CLICard() {
  const { versions, isLoading, refetch, error } = useCLI();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)] shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
            <Terminal size={20} className="text-accent-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">CLI Tools</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isLoading ? 'Checking...' : (() => {
                const installed = [versions!.sui.found, versions!.walrus.found, versions!.siteBuilder.found].filter(Boolean).length;
                return `${installed} of 3 installed`;
              })()}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-accent-primary hover:bg-[var(--color-bg-surface)] transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : versions ? (
        <div className="space-y-3">
          {/* SUI */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center gap-3">
              {versions.sui.found ? (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={14} className="text-green-500" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X size={14} className="text-red-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {CLI_INFO.sui.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  {versions.sui.found ? versions.sui.version : versions.sui.error || 'Not found'}
                </p>
              </div>
            </div>
          </div>

          {/* Walrus */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center gap-3">
              {versions.walrus.found ? (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={14} className="text-green-500" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X size={14} className="text-red-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {CLI_INFO.walrus.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  {versions.walrus.found ? versions.walrus.version : versions.walrus.error || 'Not found'}
                </p>
              </div>
            </div>
          </div>

          {/* Site Builder */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center gap-3">
              {versions.siteBuilder.found ? (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={14} className="text-green-500" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X size={14} className="text-red-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {CLI_INFO.siteBuilder.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  {versions.siteBuilder.found ? versions.siteBuilder.version : versions.siteBuilder.error || 'Not found'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-[var(--color-text-muted)] text-sm">
          {error || 'Failed to check CLI versions'}
        </div>
      )}

      {/* Requirement notice */}
      <p className="mt-4 text-xs text-[var(--color-text-muted)] text-center">
        Walrus Form Studio requires these 3 CLI tools to function properly
      </p>
    </motion.div>
  );
}
