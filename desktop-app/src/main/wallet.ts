import { app, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as bip39 from 'bip39';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SuiGrpcClient } from '@mysten/sui/grpc';
// import { walrus } from '@mysten/walrus';

const execAsync = promisify(exec);

// Network URLs
const NETWORK_CONFIG = {
  testnet: {
    fullnode: 'https://fullnode.testnet.sui.io:443',
    aggregator: 'https://aggregator.walrus-testnet.walrus.space',
  },
  mainnet: {
    fullnode: 'https://fullnode.mainnet.sui.io:443',
    aggregator: 'https://aggregator.walrus-mainnet.walrus.space',
  },
};

// Create SuiGrpcClient instances extended with walrus for both networks
const testnetClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: NETWORK_CONFIG.testnet.fullnode,
}) 

const mainnetClient = new SuiGrpcClient({
  network: 'mainnet',
  baseUrl: NETWORK_CONFIG.mainnet.fullnode,
}) 

function getClient(network: 'testnet' | 'mainnet') {
  return network === 'mainnet' ? mainnetClient : testnetClient;
}

const WALLET_DATA_PATH = path.join(app.getPath('userData'), 'wallet.json');

interface WalletData {
  encryptedSeed: string;
  address: string;
}

function deriveAddress(mnemonic: string): string {
  const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
  return keypair.getPublicKey().toSuiAddress();
}

function saveWallet(data: WalletData): void {
  fs.writeFileSync(WALLET_DATA_PATH, JSON.stringify(data), 'utf-8');
}

function loadWallet(): WalletData | null {
  try {
    if (fs.existsSync(WALLET_DATA_PATH)) {
      const content = fs.readFileSync(WALLET_DATA_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to load wallet:', error);
  }
  return null;
}

// IPC Handlers
export function setupWalletHandlers(ipcMain: any): void {
  // Check if safeStorage is available
  ipcMain.handle('wallet:isEncryptionAvailable', async () => {
    return safeStorage.isEncryptionAvailable();
  });

  // Generate mnemonic
  ipcMain.handle('wallet:generateMnemonic', async () => {
    try {
      return bip39.generateMnemonic();
    } catch (error) {
      console.error('Failed to generate mnemonic:', error);
      throw error;
    }
  });

  // Create wallet
  ipcMain.handle('wallet:createWallet', async (_, seedPhrase?: string) => {
    try {
      const mnemonic = seedPhrase || bip39.generateMnemonic();

      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic');
      }

      const encryptedSeed = safeStorage.encryptString(mnemonic).toString('base64');
      const address = deriveAddress(mnemonic);

      const walletData: WalletData = { encryptedSeed, address };
      saveWallet(walletData);

      return address;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  });

  // Restore wallet
  ipcMain.handle('wallet:restoreWallet', async (_, seedPhrase: string) => {
    try {
      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid mnemonic');
      }

      const encryptedSeed = safeStorage.encryptString(seedPhrase).toString('base64');
      const address = deriveAddress(seedPhrase);

      const walletData: WalletData = { encryptedSeed, address };
      saveWallet(walletData);

      return true;
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      throw error;
    }
  });

  // Get wallet status
  ipcMain.handle('wallet:getStatus', async () => {
    const walletData = loadWallet();
    return {
      hasWallet: walletData !== null,
      isInitialized: walletData !== null,
      isEncryptionAvailable: safeStorage.isEncryptionAvailable(),
    };
  });

  // Get wallet address
  ipcMain.handle('wallet:getAddress', async () => {
    const walletData = loadWallet();
    if (!walletData) {
      throw new Error('No wallet found');
    }
    return walletData.address;
  });

  // Initialize from stored
  ipcMain.handle('wallet:initializeFromStored', async () => {
    const walletData = loadWallet();
    return walletData !== null;
  });

  // Delete wallet
  ipcMain.handle('wallet:deleteWallet', async () => {
    try {
      if (fs.existsSync(WALLET_DATA_PATH)) {
        fs.unlinkSync(WALLET_DATA_PATH);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      throw error;
    }
  });

  // Validate seed phrase
  ipcMain.handle('wallet:validateSeedPhrase', async (_, seedPhrase: string) => {
    return bip39.validateMnemonic(seedPhrase);
  });

  // Reveal seed phrase
  ipcMain.handle('wallet:revealSeedPhrase', async () => {
    try {
      const walletData = loadWallet();
      if (!walletData) {
        throw new Error('No wallet found');
      }

      // Decrypt the seed phrase
      const encryptedBuffer = Buffer.from(walletData.encryptedSeed, 'base64');
      const decrypted = safeStorage.decryptString(encryptedBuffer);

      return decrypted;
    } catch (error) {
      console.error('Failed to reveal seed phrase:', error);
      throw error;
    }
  });
}

// ============================================
// CLI Version Check
// ============================================

interface CLIVersionResult {
  found: boolean;
  version: string | null;
  error: string | null;
}

async function checkCLIVersion(cliName: string): Promise<CLIVersionResult> {
  try {
    const { stdout } = await execAsync(`${cliName} --version`, { timeout: 10000 });
    const version = stdout.trim();
    return { found: true, version, error: null };
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        return { found: false, version: null, error: 'Command not found' };
      }
      return { found: false, version: null, error: error.message };
    }
    return { found: false, version: null, error: String(error) };
  }
}

export function setupCLIHandlers(ipcMain: any): void {
  // Check CLI version
  ipcMain.handle('cli:checkVersion', async (_, cliName: string) => {
    return checkCLIVersion(cliName);
  });

  // Check all CLI versions at once
  ipcMain.handle('cli:getAllVersions', async () => {
    const [sui, walrus, siteBuilder] = await Promise.all([
      checkCLIVersion('sui'),
      checkCLIVersion('walrus'),
      checkCLIVersion('site-builder'),
    ]);

    return {
      sui,
      walrus,
      siteBuilder,
    };
  });

  // Check wallet environment - runs CLI commands to validate
  ipcMain.handle('cli:checkWallet', async () => {
    const result = {
      cliInstalled: false,
      network: null as string | null,
      address: null as string | null,
      suiBalance: null as number | null,
      walBalance: null as number | null,
      errors: [] as string[],
    };

    try {
      // Check if sui CLI is installed
      const suiCheck = await checkCLIVersion('sui');
      if (!suiCheck.found) {
        result.errors.push('SUI CLI not installed');
        return result;
      }
      result.cliInstalled = true;

      // Get active environment
      try {
        const { stdout: envStdout } = await execAsync('sui client active-env', { timeout: 15000 });
        const envMatch = envStdout.match(/(.+)/);
        result.network = envMatch ? envMatch[1].trim() : null;
      } catch {
        result.errors.push('Failed to get SUI network');
      }

      // Get active address
      try {
        const { stdout: addrStdout } = await execAsync('sui client active-address', { timeout: 15000 });
        const addrMatch = addrStdout.match(/0x[a-fA-F0-9]+/);
        result.address = addrMatch ? addrMatch[0] : null;
      } catch {
        result.errors.push('No active SUI address');
      }

      // Get balance
      try {
        const { stdout: balStdout } = await execAsync('sui client balance', { timeout: 15000 });

        // Parse SUI balance
        const suiMatch = balStdout.match(/Sui\s+\d+\s+\/?([\d.]+)\s*SUI/);
        if (suiMatch) {
          result.suiBalance = parseFloat(suiMatch[1]) || 0;
        }

        // Parse WAL balance
        const walMatch = balStdout.match(/WAL Token\s+\d+\s+\/?([\d.]+)\s*WAL/);
        if (walMatch) {
          result.walBalance = parseFloat(walMatch[1]) || 0;
        }
      } catch {
        result.errors.push('Failed to get wallet balance');
      }

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  });

  // Deploy site to Walrus
  ipcMain.handle('cli:deploySite', async (_, options: {
    epochs: number;
    network?: string;
    configPath?: string;
    formName?: string;
    formFields?: unknown[];
    formDescription?: string;
    template?: 'sui-wallet' | 'zklogin';
  }) => {
    const { epochs, network = 'testnet', formName, formFields, formDescription, template = 'sui-wallet' } = options;

    // Create deployment slug early
    let deploymentSlug: string = '';
    if (formName && formFields) {
      const timestamp = Date.now().toString(36);
      const sanitizedFormName = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30);
      deploymentSlug = `${sanitizedFormName}-${timestamp}`;
    }

    try {
      // Construct absolute paths - use selected template
      const appPath = app.getAppPath();
      const templateFolder = template === 'zklogin' ? 'template-zklogin' : 'template';
      const distPath = path.join(appPath, templateFolder, 'dist');

      // Use bundled config from resources folder
      const bundledConfigPath = path.join(appPath, 'resources', 'sites-config.yaml');

      console.log('[Deploy] App path:', appPath);
      console.log('[Deploy] Dist path:', distPath);
      console.log('[Deploy] Config path:', bundledConfigPath);

      // Inject form data into dist before deploy
      if (formName && formFields && deploymentSlug) {
        console.log('[Deploy] Deployment slug:', deploymentSlug);

        const formData = {
          name: formName,
          fields: formFields,
          description: formDescription || undefined,
          slug: deploymentSlug,
        };

        // Write form.json to dist
        const formJsonPath = path.join(distPath, 'form.json');
        fs.writeFileSync(formJsonPath, JSON.stringify(formData, null, 2));
        console.log('[Deploy] Wrote form.json');

        // Get creator address from CLI's active address
        let creatorAddress: string = 'unknown';
        try {
          const { stdout: addrStdout } = await execAsync('sui client active-address', { timeout: 15000 });
          const addrMatch = addrStdout.match(/0x[a-fA-F0-9]+/);
          if (addrMatch) {
            creatorAddress = addrMatch[0];
          }
        } catch (err) {
          console.error('[Deploy] Failed to get CLI active address:', err);
          // Fallback to app wallet address
          const walletData = loadWallet();
          creatorAddress = walletData?.address || 'unknown';
        }

        console.log('[Deploy] Creator address:', creatorAddress);

        // Calculate expiration date based on network
        // Testnet: 1 epoch = 1 day, Mainnet: 1 epoch = 14 days
        const deployedAt = new Date().toISOString();
        const daysPerEpoch = network === 'mainnet' ? 14 : 1;
        const expiresAtDate = new Date();
        expiresAtDate.setDate(expiresAtDate.getDate() + (epochs * daysPerEpoch));
        const expiresAt = expiresAtDate.toISOString();

        // Create metadata object (no siteId/portalUrl - they'll be added after deploy)
        const formMetadata = {
          slug: deploymentSlug,
          creatorAddress,
          network,
          deployedAt,
          epochs,
          expiresAt,
        };

        // Inject into index.html
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');

          // Check if there's an existing injected script with form data, remove it
          const existingScriptMatch = html.match(/<script>\s*window\.__FORM_(DATA|METADATA)__[\s\S]*?<\/script>/);
          if (existingScriptMatch) {
            console.log('[Deploy] Found existing script, removing...');
            html = html.replace(existingScriptMatch[0], '');
          }

          // Inject form data and metadata
          html = html.replace(
            '</body>',
            `<script>
              window.__FORM_DATA__ = ${JSON.stringify(formData)};
              window.__FORM_METADATA__ = ${JSON.stringify(formMetadata)};
            </script></body>`
          );
          fs.writeFileSync(indexPath, html);
          console.log('[Deploy] Injected form data and metadata into index.html');
        }
      }

      // Build the command - use bundled config file
      const contextFlag = `--context=${network}`;
      const configFlag = `--config="${bundledConfigPath}"`;

      const command = `site-builder ${contextFlag} ${configFlag} deploy "${distPath}" --epochs ${epochs}`;

      console.log('[Deploy] Running:', command);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 min timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // Parse output for site ID and portal URL
      const output = stdout + stderr;

      // Extract site object ID (handles both "New site object ID" and "Site object ID")
      let siteObjectId: string | null = null;
      const siteIdMatch = output.match(/(?:New )?site object id:\s*(0x[a-fA-F0-9]+)/i);
      if (siteIdMatch) {
        siteObjectId = siteIdMatch[1];
      }

      // Extract local portal URL
      let portalUrl: string | null = null;
      const portalMatch = output.match(/http:\/\/[a-z0-9.]+localhost:3000/);
      if (portalMatch) {
        portalUrl = portalMatch[0];
      }

      // Cleanup: remove ws-resources.json to prevent conflicts on reuse
      const wsResourcesPath = path.join(distPath, 'ws-resources.json');
      if (fs.existsSync(wsResourcesPath)) {
        fs.unlinkSync(wsResourcesPath);
        console.log('[Deploy] Cleaned up ws-resources.json');
      }

      // Return slug (we already generated it above)
      return {
        success: true,
        slug: deploymentSlug,
        siteObjectId,
        portalUrl,
        output,
      };
    } catch (error) {
      console.error('[Deploy] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
        output: error instanceof Error ? error.message : '',
      };
    }
  });

  console.log('CLI handlers registered');
}

// ============================================
// Submissions Handler (using SuiGrpcClient with Walrus extension)
// ============================================

interface SubmissionData {
  blobId: string;
  objectId: string;
  slug: string;
  formName: string;
  submittedAt: string;
  responses: Record<string, unknown>;
}

// Walrus blob package IDs
const WALRUS_BLOB_STRUCT_TYPE = {
  testnet: '0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66::blob::Blob',
  mainnet: '0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77::blob::Blob',
};

// Convert decimal blob ID to URL-safe base64 format
function decimalBlobIdToBase64Url(decimalId: string): string {
  try {
    let num = BigInt(decimalId);
    const bytes = new Uint8Array(32);
    // Little-endian: least significant byte at index 0
    for (let i = 0; i < 32; i++) {
      bytes[i] = Number(num & 0xffn);
      num >>= 8n;
    }
    // Convert to base64url
    const base64 = Buffer.from(bytes).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Failed to convert blob ID:', error);
    return decimalId;
  }
}

// Check if blob ID is in decimal format and needs conversion
function normalizeBlobId(blobId: string): string {
  // If it's a decimal string (very long number), convert it
  if (/^\d+$/.test(blobId) && blobId.length > 50) {
    return decimalBlobIdToBase64Url(blobId);
  }
  return blobId;
}

// Get current epoch from Walrus CLI
async function getCurrentEpoch(network: 'testnet' | 'mainnet'): Promise<number | null> {
  try {
    const context = `--context=${network}`;
    const command = `walrus info epoch ${context}`;
    const { stdout } = await execAsync(command, { timeout: 15000 });
    
    // Parse "Current epoch: 399" from output
    const match = stdout.match(/Current epoch:\s*(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  } catch (error) {
    console.error('Failed to get current epoch:', error);
    return null;
  }
}

// Check if blob is still available (not expired and certified)
function isBlobAvailable(blobObject: Record<string, unknown>, currentEpoch: number): boolean {
  const certifiedEpoch = blobObject.certified_epoch as number | null;
  const endEpoch = (blobObject.storage as Record<string, unknown>)?.end_epoch as number | null;
  const deletable = blobObject.deletable as boolean;
  
  return (
    certifiedEpoch !== null &&
    certifiedEpoch !== undefined &&
    endEpoch !== null &&
    endEpoch !== undefined &&
    endEpoch > currentEpoch &&
    !deletable
  );
}

// Fetch blob content using Walrus SDK (quilt format)
async function fetchBlobContent(blobId: string, network: 'testnet' | 'mainnet'): Promise<Record<string, unknown> | null> {
  const client = getClient(network);

  try {
    // Get file using Walrus SDK
 
    // const blob = await client.walrus.getBlob({ blobId });
    // const files = await blob.files();

    // const [file] = files;

    // // Get as text and parse JSON
    // const text = await file.text();

    // const content = JSON.parse(text);

    // return content as Record<string, unknown>;
    return null
  } catch (error) {
    console.error('Error fetching blob content:', error);
    return null;
  }
}

export function setupSubmissionsHandlers(ipcMain: any): void {
  // Query blob submissions for an address using SuiGrpcClient with pagination
  ipcMain.handle('submissions:getOwned', async (_, options: {
    address: string;
    network?: 'testnet' | 'mainnet';
  }) => {
    const network = (options.network || 'testnet') as 'testnet' | 'mainnet';
    const client = getClient(network);

    try {
      // Get current epoch for expiration check
      const currentEpoch = await getCurrentEpoch(network);
      if (currentEpoch === null) {
        console.warn('Could not get current epoch, skipping expiration check');
      }

      const submissions: SubmissionData[] = [];
      let cursor: string | null = null;

      // Paginate through all results
      do {
        const response = await client.core.listOwnedObjects({
          owner: options.address,
          type: WALRUS_BLOB_STRUCT_TYPE[network],
          include: {
            json: true,
            type: true,
          },
          limit: 100,
          cursor,
        });

        // Process each blob object - already filtered by type
        for (const obj of response.objects) {
          const objectId = obj.objectId;
          if (!objectId) continue;

          try {
            // Get data from object json content
            const content = obj.json as Record<string, unknown> | null;

            // Check blob expiration if we have current epoch
            if (currentEpoch !== null && !isBlobAvailable(content || {}, currentEpoch)) {
              continue; // Skip expired blobs
            }

            // Filter by size - only include blobs smaller than 500KB (form responses should be small JSON)
            const blobSize = parseInt(content?.size as string, 10);
            if (isNaN(blobSize) || blobSize >= 500000) {
              continue; // Skip large blobs (likely non-JSON files)
            }

            let blobId: string | null = content?.blob_id as string || content?.id as string || null;
            let slug: string | null = content?.slug as string || null;
            let formName: string | null = content?.form_name as string || null;

            // Get content from Walrus if we have blobId
            let responses: Record<string, unknown> = {};
            let submittedAt = new Date().toISOString();

            if (blobId) {
              // Normalize blob ID (convert from decimal to base64url if needed)
              const normalizedBlobId = normalizeBlobId(blobId);
              const blobContent = await fetchBlobContent(normalizedBlobId, network);
              if (blobContent) {
                responses = (blobContent.responses as Record<string, unknown>) || blobContent;
                submittedAt = (blobContent.submittedAt as string)
                  || (blobContent.submitted_at as string)
                  || submittedAt;
                slug = slug || (blobContent.slug as string);
                formName = formName || (blobContent.formName as string) || (blobContent.form_name as string);
              }
            }

            if (slug) {
              submissions.push({
                blobId: blobId || objectId,
                objectId,
                slug,
                formName: formName || 'Unknown Form',
                submittedAt,
                responses,
              });
            }
          } catch (err) {
            console.error('Failed to process blob object:', err);
          }
        }

        // Check for next page
        cursor = response.cursor || null;
      } while (cursor);

      return { success: true, submissions };
    } catch (error) {
      console.error('Failed to query submissions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query submissions',
        submissions: []
      };
    }
  });

  // Get submissions for a specific slug using SuiGrpcClient with pagination
  ipcMain.handle('submissions:getBySlug', async (_, options: {
    address: string;
    slug: string;
    network?: 'testnet' | 'mainnet';
  }) => {

    const network = (options.network || 'testnet') as 'testnet' | 'mainnet';
    const client = getClient(network);

    try {
      // Get current epoch for expiration check
      const currentEpoch = await getCurrentEpoch(network);
      if (currentEpoch === null) {
        console.warn('Could not get current epoch, skipping expiration check');
      }
 

      const submissions: SubmissionData[] = [];
      let cursor: string | null = null;

      // Paginate through all results
      do {
        const response = await client.core.listOwnedObjects({
          owner: options.address,
          type: WALRUS_BLOB_STRUCT_TYPE[network],
          include: {
            json: true,
            type: true,
          },
          limit: 100,
          cursor,
        });


        // Process each blob object - already filtered by type
        for (const obj of response.objects) {
          const objectId = obj.objectId;
          if (!objectId) continue;

          try {
            // Get blobId from object json content
            const content = obj.json as Record<string, unknown> | null;
 
            
            // Check blob expiration if we have current epoch
            if (currentEpoch !== null && !isBlobAvailable(content || {}, currentEpoch)) {
              continue; // Skip expired blobs
            }

            // Filter by size - only include blobs smaller than 500KB (form responses should be small JSON)
            const blobSize = parseInt(content?.size as string, 10);
            if (isNaN(blobSize) || blobSize >= 500000) {
              continue; // Skip large blobs (likely non-JSON files)
            }

            const blobId: string | null = content?.blob_id as string || content?.id as string || null;

            // Skip if no blobId
            if (!blobId) continue;

            // Normalize blob ID (convert from decimal to base64url if needed)
            const normalizedBlobId = normalizeBlobId(blobId);

            // Fetch blob content first (contains slug)
            const blobContent = await fetchBlobContent(normalizedBlobId, network);
            if (!blobContent) continue;

            // Get slug from blob content
            const foundSlug = (blobContent.slug as string) || null;

            // Only include if slug matches
            if (foundSlug !== options.slug) continue;

            // Extract other data from blob content
            const responses = (blobContent.responses as Record<string, unknown>) || blobContent;
            const submittedAt = (blobContent.submittedAt as string)
              || (blobContent.submitted_at as string)
              || new Date().toISOString();
            const formName = (blobContent.formName as string)
              || (blobContent.form_name as string)
              || 'Unknown Form';

            submissions.push({
              blobId,
              objectId,
              slug: foundSlug,
              formName,
              submittedAt,
              responses,
            });
          } catch (err) {
            console.error('Failed to process blob object:', err);
          }
        }

        // Check for next page
        cursor = response.cursor || null;
      } while (cursor);

      return { success: true, submissions };
    } catch (error) {
      console.error('Failed to query submissions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query submissions',
        submissions: []
      };
    }
  });

  console.log('Submissions handlers registered');
}
