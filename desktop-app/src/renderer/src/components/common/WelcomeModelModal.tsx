import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { AIModel } from '../../context/AIContext';

interface ModelOption {
  id: AIModel;
  name: string;
  specs: string;
  requirements: string;
}

interface WelcomeModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: AIModel) => void;
}

const modelOptions: ModelOption[] = [
  {
    id: '1.7B',
    name: 'Qwen3-1.7B',
    specs: 'Starter model for basic tasks',
    requirements: '8GB+ RAM • ~1.5GB disk space • Fast loading',
  },
  {
    id: '4B',
    name: 'Qwen3-4B',
    specs: 'Enhanced model for better quality responses',
    requirements: '16GB+ RAM • ~4GB disk space • GPU recommended',
  },
];

export default function WelcomeModelModal({ isOpen, onClose, onSelect }: WelcomeModelModalProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const handleSelectModel = (model: AIModel) => {
    // Close modal immediately
    onClose();
    
    // Then call onSelect
    onSelect(model);
  };

  const handleStartLater = () => {
    onClose();
    setSelectedModel(null);
    setShowDropdown(false);
  };

  const handleClose = () => {
    onClose();
    setSelectedModel(null);
    setShowDropdown(false);
  };

  const selectedOption = modelOptions.find(m => m.id === selectedModel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Welcome to LocalBook
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Start to power your DeepBook trading agents on Sui.
          </p>
        </div>

        {/* Model Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Select Model
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-accent-primary/50 transition-colors"
            >
              <span className={selectedModel ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}>
                {selectedModel ? `Qwen3-${selectedModel}` : 'Choose a model...'}
              </span>
              <ChevronDown size={16} className={`text-[var(--color-text-muted)] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] shadow-lg overflow-hidden">
                {modelOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedModel(option.id);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--color-bg-surface)] transition-colors border-b border-[var(--color-border-subtle)] last:border-b-0"
                  >
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      Qwen3-{option.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specs Display */}
        {selectedOption && (
          <div className="mb-4 p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
            <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {selectedOption.name}
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">
              {selectedOption.specs}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {selectedOption.requirements}
            </p>
          </div>
        )}

        {/* Download info message */}
        <p className="mb-4  text-xs text-[var(--color-text-muted)]">
          Local inference powered by Tether's QVAC. Model downloaded on first use and cached for all QVAC-based apps.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleStartLater}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            Start Later
          </button>
          <button
            onClick={() => selectedModel && handleSelectModel(selectedModel)}
            disabled={!selectedModel}
            className="flex-1 px-4 py-3 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}