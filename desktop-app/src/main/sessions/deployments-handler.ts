import { ipcMain } from 'electron';
import * as deployments from './deployments';

// function nameToSlug(name: string): string {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-+|-+$/g, '');
// }

export function registerDeploymentsIpcHandlers(): void {
  // Get all deployments
  ipcMain.handle('deployments:getAll', async () => {
    try {
      return deployments.getAllDeployments();
    } catch (error) {
      console.error('Failed to get deployments:', error);
      throw error;
    }
  });

  // Get single deployment
  ipcMain.handle('deployments:get', async (_event, deploymentSlug: string) => {
    try {
      const deployment = deployments.loadDeployment(deploymentSlug);
      return deployment;
    } catch (error) {
      console.error('Failed to get deployment:', error);
      throw error;
    }
  });

  // Save deployment (called after successful deploy)
  ipcMain.handle('deployments:save', async (
    _event,
    data: {
      slug: string;
      network: string;
      epochs: number;
      formName: string;
      formFields: unknown[];
      creatorAddress: string;
      siteObjectId?: string | null;
      portalUrl?: string | null;
    }
  ) => {
    try {
      const deploymentSlug = data.slug;

      // Calculate expiry date based on network
      // Testnet: 1 epoch = 1 day, Mainnet: 1 epoch = 14 days
      const deployedAt = new Date().toISOString();
      const daysPerEpoch = data.network === 'mainnet' ? 14 : 1;
      const expiresAtDate = new Date();
      expiresAtDate.setDate(expiresAtDate.getDate() + (data.epochs * daysPerEpoch));
      const expiresAt = expiresAtDate.toISOString();

      const deploymentInfo = {
        slug: deploymentSlug,
        network: data.network,
        deployedAt,
        epochs: data.epochs,
        expiresAt,
        formName: data.formName,
        creatorAddress: data.creatorAddress,
        siteObjectId: data.siteObjectId || null,
        portalUrl: data.portalUrl || null,
      };

      deployments.saveDeployment(deploymentSlug, deploymentInfo, data.formFields);

      return { 
        success: true, 
        deploymentSlug,
        deployedAt,
        expiresAt,
      };
    } catch (error) {
      console.error('Failed to save deployment:', error);
      throw error;
    }
  });

  // Delete deployment
  ipcMain.handle('deployments:delete', async (_event, deploymentSlug: string) => {
    try {
      const deleted = deployments.deleteDeployment(deploymentSlug);
      return { success: deleted };
    } catch (error) {
      console.error('Failed to delete deployment:', error);
      throw error;
    }
  });

  // Update deployment (e.g., extend epochs)
  ipcMain.handle('deployments:update', async (
    _event,
    deploymentSlug: string,
    updates: Partial<{
      epochs: number;
      expiresAt: string;
    }>
  ) => {
    try {
      const updated = deployments.updateDeployment(deploymentSlug, updates);
      return { success: updated };
    } catch (error) {
      console.error('Failed to update deployment:', error);
      throw error;
    }
  });

  // Import deployment from JSON file
  ipcMain.handle('deployments:import', async (_event, data: {
    version: string;
    exportedAt: string;
    deployment: {
      slug: string;
      network: string;
      epochs: number;
      formName: string;
      creatorAddress: string;
      siteObjectId: string | null;
      portalUrl: string | null;
      formFields: unknown[];
    };
  }) => {
    try {
      // Use original slug from export
      const slug = data.deployment.slug;
      
      // Check if slug already exists
      const existing = deployments.loadDeployment(slug);
      if (existing) {
        return { success: false, error: `Form with slug "${slug}" already exists` };
      }
      
      // Calculate expiry based on epochs
      const daysPerEpoch = data.deployment.network === 'mainnet' ? 14 : 1;
      const expiresAtDate = new Date();
      expiresAtDate.setDate(expiresAtDate.getDate() + (data.deployment.epochs * daysPerEpoch));

      const deploymentInfo = {
        slug,
        network: data.deployment.network,
        deployedAt: data.exportedAt || new Date().toISOString(),
        epochs: data.deployment.epochs,
        expiresAt: expiresAtDate.toISOString(),
        formName: data.deployment.formName,
        creatorAddress: data.deployment.creatorAddress,
        siteObjectId: data.deployment.siteObjectId || null,
        portalUrl: data.deployment.portalUrl || null,
      };

      deployments.saveDeployment(slug, deploymentInfo, data.deployment.formFields);

      return { 
        success: true, 
        slug,
        deployment: deploymentInfo,
      };
    } catch (error) {
      console.error('Failed to import deployment:', error);
      return { success: false, error: String(error) };
    }
  });

  console.log('Deployments IPC handlers registered');
}