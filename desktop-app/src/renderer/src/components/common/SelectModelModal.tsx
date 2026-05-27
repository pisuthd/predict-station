import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AIModel } from '../../context/AIContext';

interface ModelInfo {
  name: string;
  specs: string;
  label: string;
}

interface SelectModelModalProps {
  isOpen: boolean;
  onSelect: (model: AIModel) => void;
}

const models: Record<AIModel, ModelInfo> = {
  '1.7B': {
    name: 'Qwen3-1.7B',
    specs: '8GB+ RAM • ~1.5GB disk',
    label: 'Starter',
  },
  '4B': {
    name: 'Qwen3-4B',
    specs: '16GB+ RAM • ~3-4GB disk • GPU recommended',
    label: 'High-spec',
  },
  // 'LOCAL': {
  //   name: 'Medpsy-1.7B (Local)',
  //   specs: 'Local file • medpsy-1.7b-q4_k_m-imat.gguf',
  //   label: 'Custom',
  // },
};

export default function SelectModelModal({ isOpen, onSelect }: SelectModelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
            <Sparkles size={20} className="text-accent-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Enable AI
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Choose a model to get started
            </p>
          </div>
        </div>

        {/* Model Cards */}
        <div className="space-y-3">
          {(Object.keys(models) as AIModel[]).map((modelType, index) => {
            const model = models[modelType]; 

            return (
              <motion.button
                key={modelType}
                onClick={() => onSelect(modelType)}
                className="w-full relative overflow-hidden rounded-xl p-4 text-left transition-all border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] hover:border-accent-primary/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--color-text-primary)] mb-1">
                      {model.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {model.specs}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">
                    {model.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Download info message */}
        <p className="mt-4 text-center text-xs text-green-500">
          Initial download required. Subsequent uses will load from local cache.
        </p>
      </motion.div>
    </div>
  );
}