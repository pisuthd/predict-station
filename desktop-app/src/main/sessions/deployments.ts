import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const DEPLOYMENTS_DIR = 'deployments';

export interface DeploymentInfo {
  slug: string;
  network: string;
  deployedAt: string;
  epochs: number;
  expiresAt: string;
  formName: string;
  creatorAddress: string;
  siteObjectId: string | null; // Sui object ID from deploy
  portalUrl: string | null;   // Local portal URL
}

export interface DeploymentData extends DeploymentInfo {
  formFields: unknown[];
}

function getDeploymentsBasePath(): string {
  return path.join(app.getPath('userData'), DEPLOYMENTS_DIR);
}

function getDeploymentPath(deploymentSlug: string): string {
  return path.join(getDeploymentsBasePath(), deploymentSlug);
}

export function getDeploymentsList(): string[] {
  const deploymentsPath = getDeploymentsBasePath();
  
  if (!fs.existsSync(deploymentsPath)) {
    return [];
  }
  
  const entries = fs.readdirSync(deploymentsPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

export function deploymentExists(deploymentSlug: string): boolean {
  const deploymentPath = getDeploymentPath(deploymentSlug);
  return fs.existsSync(deploymentPath);
}

export function createDeploymentFolder(deploymentSlug: string): { path: string; infoPath: string; formDataPath: string } {
  const basePath = getDeploymentPath(deploymentSlug);
  const infoPath = path.join(basePath, 'info.json');
  const formDataPath = path.join(basePath, 'form-data.json');

  fs.mkdirSync(basePath, { recursive: true });

  return { path: basePath, infoPath, formDataPath };
}

export function saveDeployment(
  deploymentSlug: string,
  deploymentInfo: DeploymentInfo,
  formFields: unknown[]
): void {
  const { infoPath, formDataPath } = createDeploymentFolder(deploymentSlug);
  
  fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync(formDataPath, JSON.stringify(formFields, null, 2));
}

export function loadDeployment(deploymentSlug: string): DeploymentData | null {
  const deploymentPath = getDeploymentPath(deploymentSlug);
  
  if (!fs.existsSync(deploymentPath)) {
    return null;
  }
  
  try {
    const infoPath = path.join(deploymentPath, 'info.json');
    const formDataPath = path.join(deploymentPath, 'form-data.json');
    
    if (!fs.existsSync(infoPath)) {
      return null;
    }
    
    const infoContent = fs.readFileSync(infoPath, 'utf-8');
    const info = JSON.parse(infoContent) as DeploymentInfo;
    
    let formFields: unknown[] = [];
    if (fs.existsSync(formDataPath)) {
      const formContent = fs.readFileSync(formDataPath, 'utf-8');
      formFields = JSON.parse(formContent);
    }
    
    return { ...info, formFields };
  } catch {
    return null;
  }
}

export function getAllDeployments(): DeploymentData[] {
  const slugs = getDeploymentsList();
  const deployments: DeploymentData[] = [];
  
  for (const slug of slugs) {
    const deployment = loadDeployment(slug);
    if (deployment) {
      deployments.push(deployment);
    }
  }
  
  // Sort by deployedAt (most recent first)
  deployments.sort((a, b) => 
    new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime()
  );
  
  return deployments;
}

export function deleteDeployment(deploymentSlug: string): boolean {
  const deploymentPath = getDeploymentPath(deploymentSlug);
  
  if (fs.existsSync(deploymentPath)) {
    fs.rmSync(deploymentPath, { recursive: true, force: true });
    return true;
  }
  
  return false;
}

export function getDeploymentBySiteId(siteId: string): DeploymentData | null {
  // siteId is the deployment slug
  return loadDeployment(siteId);
}

export function updateDeployment(deploymentSlug: string, updates: Partial<DeploymentInfo>): boolean {
  const deployment = loadDeployment(deploymentSlug);
  
  if (!deployment) {
    return false;
  }
  
  const updatedInfo = { ...deployment, ...updates } as DeploymentInfo;
  const { infoPath } = createDeploymentFolder(deploymentSlug);
  fs.writeFileSync(infoPath, JSON.stringify(updatedInfo, null, 2));
  
  return true;
}