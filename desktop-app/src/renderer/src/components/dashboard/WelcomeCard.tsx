import { motion } from 'framer-motion';
import { ExternalLink, Plus } from 'lucide-react';

export default function WelcomeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent-primary rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Welcome to Walrus Form Studio</h2>
          <p className="text-white/80 text-sm">
            Create and manage forms on decentralized storage with AI assistance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#/new-form"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-accent-primary font-semibold hover:bg-white/90 transition-colors"
          >
            <Plus size={18} />
            Create Form
          </a>
          <a
            href="https://github.com/tamago-labs/walrus-form-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors"
          >
            <ExternalLink size={18} />
            How to Use
          </a>
        </div>
      </div>
    </motion.div>
  );
}
