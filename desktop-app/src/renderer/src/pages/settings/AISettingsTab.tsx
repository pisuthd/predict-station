import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import WelcomeModelModal from '../../components/common/WelcomeModelModal';

export default function AISettingsTab() {
  const { aiEnabled, aiModel, isLoading: aiLoading, disableAI, enableAI } = useAI();
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  const handleToggleAI = async () => {
    if (aiEnabled) {
      setShowDisableModal(true);
    } else {
      setShowModelModal(true);
    }
  };

  const handleConfirmDisable = async () => {
    setShowDisableModal(false);
    await disableAI();
  };

  const handleModelSelect = async (model: '1.7B' | '4B') => {
    setShowModelModal(false);
    await enableAI(model);
  };

  return (
    <>
      <ConfirmModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={handleConfirmDisable}
        title="Disable AI"
        message="Are you sure you want to disable the AI assistant? You can enable it again anytime."
        confirmText="Disable"
      />

      <WelcomeModelModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        onSelect={handleModelSelect}
      />

      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">AI Model</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Configure your local AI assistant
        </p>
        
        {/* AI Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-[var(--color-text-secondary)]">
              {aiLoading ? 'Loading...' : aiEnabled ? 'AI Enabled' : 'AI Disabled'}
            </span>
          </div>
          {aiEnabled && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Model: Qwen3-{aiModel}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Enable/Disable AI */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
                  <Sparkles size={20} className="text-accent-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">Local AI Runtime</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {aiLoading ? 'Loading...' : aiEnabled ? `Using Qwen3-${aiModel}` : 'Enable to use local AI'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAI}
                disabled={aiLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
                  aiEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                    : 'bg-accent-primary text-white hover:bg-accent-primary-hover'
                }`}
              > 
                {aiLoading ? 'Loading...' : aiEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Model Selection - disabled when AI is enabled */}
          {aiEnabled ? (
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] opacity-75">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">Change Model</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Current: Qwen3-{aiModel}
                  </p>
                </div>
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] font-medium text-sm border border-[var(--color-border-default)] cursor-not-allowed"
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-amber-600">
                Disable current model to change
              </p>
            </div>
          ) : !aiLoading && (
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[var(--color-text-primary)]">Change Model</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Select model when enabling AI
                  </p>
                </div>
                <button
                  onClick={() => setShowModelModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-medium text-sm hover:bg-[var(--color-border-default)] transition-colors border border-[var(--color-border-default)]"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}