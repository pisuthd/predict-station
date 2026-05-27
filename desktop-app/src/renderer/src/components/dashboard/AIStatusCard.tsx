import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import SelectModelModal from '../common/SelectModelModal';

export default function AIStatusCard() {
  const { aiEnabled, aiModel, isLoading, enableAI, disableAI } = useAI();
  const [showModelModal, setShowModelModal] = useState(false);
  const [totalForms, setTotalForms] = useState(0);

  useEffect(() => {
    fetchFormCount();
  }, []);

  const fetchFormCount = async () => {
    try {
      const deployments = await window.api.deployments.getAll();
      setTotalForms(deployments?.length || 0);
    } catch (error) {
      console.error('Failed to fetch form count:', error);
      setTotalForms(0);
    }
  };

  const statusItems = [
    { label: 'AI Status', value: aiEnabled ? 'Active' : 'Disabled', valueColor: aiEnabled ? 'text-green-500' : 'text-red-500' },
    { label: 'Storage', value: 'Connected', valueColor: 'text-green-500' },
    { label: 'AI Model', value: aiEnabled ? `Qwen3-${aiModel}` : '-' },
    { label: 'Total Forms', value: totalForms.toString() },
  ];

  const handleEnable = () => {
    setShowModelModal(true);
  };

  const handleModelSelect = (model: '1.7B' | '4B') => {
    setShowModelModal(false);
    enableAI(model);
  };

  const handleDisable = () => {
    disableAI();
  };

  return (
    <>
      <SelectModelModal
        isOpen={showModelModal}
        onSelect={handleModelSelect}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)] shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
            <Sparkles size={20} className="text-accent-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">Local AI Assistant</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isLoading ? 'Loading...' : aiEnabled ? `Ready` : 'Disabled'}
            </p>
          </div>
        </div>

        {/* Status List */}
        <div className="space-y-1">
          {statusItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-2.5 ${
                index < statusItems.length - 1 ? 'border-b border-[var(--color-border-subtle)]' : ''
              }`}
            >
              <span className="text-sm text-[var(--color-text-secondary)]">{item.label}</span>
              <span
                className={`text-sm font-medium flex items-center gap-2 ${
                  item.valueColor || 'text-[var(--color-text-primary)]'
                }`}
              >
                {item.value === 'Active' && <Check size={12} />}
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Enable/Disable Button */}
        <button
          onClick={aiEnabled ? handleDisable : handleEnable}
          disabled={isLoading}
          className={`flex items-center gap-2 w-full justify-center mt-4 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
            aiEnabled
              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
              : 'bg-accent-primary text-white hover:bg-accent-primary-hover'
          }`}
        > 
          {isLoading ? 'Loading...' : aiEnabled ? 'Disable AI' : 'Enable AI'}
        </button>
      </motion.div>
    </>
  );
}