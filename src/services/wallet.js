// Wallet Service - Sui wallet generation and management

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import bip39 from 'bip39';

// Wallet data path
const WALLET_DIR = path.join(os.homedir(), '.predict-station');
const WALLET_FILE = path.join(WALLET_DIR, 'wallet.json');

// Ensure wallet directory exists
function ensureWalletDir() {
  if (!fs.existsSync(WALLET_DIR)) {
    fs.mkdirSync(WALLET_DIR, { recursive: true });
  }
}

// Derive Sui address from mnemonic using SHA256
// Note: For production, use @mysten/sui with Ed25519Keypair for proper derivation
function deriveAddress(mnemonic) {
  const hash = crypto.createHash('sha256').update(mnemonic).digest();
  return '0x' + hash.slice(0, 32).toString('hex');
}

// Wallet Service
export const walletService = {
  // Check if wallet exists
  hasWallet() {
    ensureWalletDir();
    return fs.existsSync(WALLET_FILE);
  },

  // Get wallet status
  getStatus() {
    const exists = this.hasWallet();
    if (!exists) {
      return { exists: false, address: null };
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8'));
      return { exists: true, address: data.address };
    } catch {
      return { exists: false, address: null };
    }
  },

  // Generate mnemonic using bip39
  generateMnemonic() {
    return bip39.generateMnemonic();
  },

  // Validate mnemonic
  validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  },

  // Create a new wallet
  async createWallet(seedPhrase = null) {
    try {
      const mnemonic = seedPhrase || bip39.generateMnemonic();
      
      if (!bip39.validateMnemonic(mnemonic)) {
        return { success: false, error: 'Invalid mnemonic' };
      }
      
      const address = deriveAddress(mnemonic);
      
      const walletData = {
        mnemonic,
        address,
        createdAt: new Date().toISOString(),
      };
      
      ensureWalletDir();
      fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData, null, 2), 'utf-8');
      
      console.log('[Wallet] New wallet created:', address);
      
      return { success: true, address, mnemonic };
    } catch (error) {
      console.error('[Wallet] Failed to create wallet:', error);
      return { success: false, error: error.message };
    }
  },

  // Get wallet address
  getAddress() {
    try {
      if (!this.hasWallet()) {
        return null;
      }
      const data = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8'));
      return data.address;
    } catch {
      return null;
    }
  },

  // Reveal seed phrase (for backup)
  revealMnemonic() {
    try {
      if (!this.hasWallet()) {
        return null;
      }
      const data = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8'));
      return data.mnemonic;
    } catch {
      return null;
    }
  },

  // Delete wallet
  deleteWallet() {
    try {
      if (fs.existsSync(WALLET_FILE)) {
        fs.unlinkSync(WALLET_FILE);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Initialize wallet on startup (auto-create if not exists)
  async initialize() {
    if (!this.hasWallet()) {
      console.log('[Wallet] No wallet found, creating new...');
      await this.createWallet();
    } else {
      const status = this.getStatus();
      console.log('[Wallet] Existing wallet:', status.address);
    }
  }
};

export default walletService;