import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useAI } from '../../context/AIContext';

export default function AIStatusCard() {
  const { aiEnabled, aiModel, isLoading, error, disableAI, setShowWelcomeModal } = useAI();
  const [uptime, setUptime] = useState<string>('');

  // Update uptime every second
  useEffect(() => {
    if (!aiEnabled) {
      setUptime('');
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);

      if (hours > 0) {
        setUptime(`${hours}h ${minutes}m`);
      } else if (minutes >= 1) {
        setUptime(`${minutes}m`);
      } else {
        setUptime('<1m');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [aiEnabled]);

  const getStatusValue = () => {
    if (isLoading) return 'Loading...';
    if (error) return 'Error';
    return aiEnabled ? 'Active' : 'Disabled';
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-yellow-500';
    if (error) return 'text-red-500';
    return aiEnabled ? 'text-green-500' : 'text-red-500';
  };

  const statusItems = [
    { label: 'Status', value: getStatusValue(), valueColor: getStatusColor() },
    { label: 'Model', value: aiEnabled ? `Qwen3-${aiModel}` : (isLoading ? '...' : '-') },
    { label: 'Uptime', value: uptime || '-' },
    { label: 'Sessions', value: 0 }
  ];

  const handleEnable = () => {
    setShowWelcomeModal(true);
  };

  const handleDisable = () => {
    disableAI();
  };

  const handleRetry = () => {
    setShowWelcomeModal(true);
  };

  const renderButton = () => {
    if (isLoading) {
      return (
        <button
          disabled
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] cursor-not-allowed"
        >
          <Loader2 size={16} className="animate-spin" />
          Loading...
        </button>
      );
    }

    if (error) {
      return (
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      );
    }

    if (aiEnabled) {
      return (
        <button
          onClick={handleDisable}
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-accent-primary-dim text-accent-primary hover:opacity-80 transition-opacity"
        >
          Unload Model
        </button>
      );
    }

    return (
      <button
        onClick={handleEnable}
        className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-accent-primary text-white hover:bg-accent-primary-hover transition-colors"
      >
        Enable AI
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)] shadow-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
          <Sparkles size={20} className="text-accent-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Local AI Runtime</h3>
        </div>
      </div>

      {/* Status List */}
      <div className="space-y-1">
        {statusItems.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center justify-between py-2.5 ${index < statusItems.length - 1 ? 'border-b border-[var(--color-border-subtle)]' : ''
              }`}
          >
            <span className="text-sm text-[var(--color-text-secondary)]">{item.label}</span>
            <span
              className={`text-sm font-medium flex items-center gap-2 ${item.valueColor || 'text-[var(--color-text-primary)]'
                }`}
            >
              {item.value === 'Active' && <Check size={12} />}
              {item.value === 'Error' && <AlertCircle size={12} />}
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Action Button */}
      {renderButton()}

      <p className="mt-3 text-xs text-[var(--color-text-muted)]"> 
        Load time: 2-3 minutes depending on model chosen.
      </p>  
    </motion.div>
  );
}