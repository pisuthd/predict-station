import { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/common/PageWrapper';
import {  Cpu, Terminal } from 'lucide-react';
import { StorageSettingsTab, AISettingsTab, CLISettingsTab } from './settings';
import SelectModelModal from '../components/common/SelectModelModal';
import { useAI, AIModel } from '../context/AIContext';

type TabId = 'storage' | 'ai' | 'cli';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('cli');
  const [showModelModal, setShowModelModal] = useState(false);
  const { enableAI } = useAI();

  const tabs = [
    // { id: 'storage' as const, label: 'Storage', icon: Database },
    { id: 'ai' as const, label: 'AI Settings', icon: Cpu },
    { id: 'cli' as const, label: 'CLI Tools', icon: Terminal },
  ];

  const handleModelSelect = (model: AIModel) => {
    setShowModelModal(false);
    enableAI(model);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'storage':
        return <StorageSettingsTab />;
      case 'ai':
        return <AISettingsTab onShowModelModal={() => setShowModelModal(true)} />;
      case 'cli':
        return <CLISettingsTab />;
      default:
        return null;
    }
  };

  return (
    <PageWrapper title="Settings">
      <SelectModelModal
        isOpen={showModelModal}
        onSelect={handleModelSelect}
      />

      <div className="flex gap-8 max-w-4xl">
        {/* Tabs */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-primary-dim text-accent-primary'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)] shadow-sm"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}