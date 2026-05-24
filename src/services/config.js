// Config Service - Node configuration management

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Config data path
const CONFIG_DIR = path.join(os.homedir(), '.predict-station');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default values
const DEFAULTS = {
  suiRpc: 'https://fullnode.testnet.sui.io:443',
  predictServer: 'https://predict-server.testnet.mystenlabs.com',
  agentNode: 'http://localhost:3001',
};

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

// Config Service
export const configService = {
  // Get current config
  get() {
    ensureConfigDir();
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        return { ...DEFAULTS, ...data };
      }
    } catch (error) {
      console.error('[Config] Failed to read config:', error);
    }
    return { ...DEFAULTS };
  },

  // Save config
  save(config) {
    try {
      ensureConfigDir();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('[Config] Failed to save config:', error);
      return { success: false, error: error.message };
    }
  },

  // Get specific value
  getValue(key) {
    const config = this.get();
    return config[key] || DEFAULTS[key];
  },

  // Set specific value
  setValue(key, value) {
    const config = this.get();
    config[key] = value;
    return this.save(config);
  },

  // Reset to defaults
  reset() {
    return this.save({ ...DEFAULTS });
  },

  // Get wallet path (for reference)
  getWalletPath() {
    return path.join(CONFIG_DIR, 'wallet.json');
  },

  // Get data directory path
  getDataDir() {
    return CONFIG_DIR;
  }
};

export default configService;