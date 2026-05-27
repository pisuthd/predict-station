export default function StorageSettingsTab() {
  return (
    <div>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Storage Settings</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Configure your Walrus decentralized storage connection
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Storage Endpoint
          </label>
          <input
            type="text"
            defaultValue="https://storage.walrus.space"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Publisher Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
}