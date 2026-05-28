import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync, appendFileSync, readFileSync, readdirSync } from 'fs';

const LOGS_DIR = join(app.getPath('userData'), 'logs');

function ensureLogDir(): void {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return join(LOGS_DIR, `${date}.log`);
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

export function logInfo(message: string, data?: any): void {
  ensureLogDir();
  const timestamp = formatTimestamp();
  const logEntry = data 
    ? `[${timestamp}] [INFO] ${message} | ${JSON.stringify(data)}\n`
    : `[${timestamp}] [INFO] ${message}\n`;
  
  appendFileSync(getLogFilePath(), logEntry);
  console.log(logEntry.trim());
}

export function logError(message: string, error?: any): void {
  ensureLogDir();
  const timestamp = formatTimestamp();
  const errorStr = error instanceof Error 
    ? `${error.message}\n${error.stack}` 
    : String(error || 'Unknown error');
  const logEntry = `[${timestamp}] [ERROR] ${message} | ${errorStr}\n`;
  
  appendFileSync(getLogFilePath(), logEntry);
  console.error(logEntry.trim());
}

export function logWarn(message: string, data?: any): void {
  ensureLogDir();
  const timestamp = formatTimestamp();
  const logEntry = data 
    ? `[${timestamp}] [WARN] ${message} | ${JSON.stringify(data)}\n`
    : `[${timestamp}] [WARN] ${message}\n`;
  
  appendFileSync(getLogFilePath(), logEntry);
  console.warn(logEntry.trim());
}

export function logQVAC(message: string, data?: any): void {
  ensureLogDir();
  const timestamp = formatTimestamp();
  const logEntry = data 
    ? `[${timestamp}] [QVAC] ${message} | ${JSON.stringify(data)}\n`
    : `[${timestamp}] [QVAC] ${message}\n`;
  
  appendFileSync(getLogFilePath(), logEntry);
  console.log(logEntry.trim());
}

export function getRecentLogs(lines: number = 50): { logs: string[], file: string }[] {
  ensureLogDir();
  const result: { logs: string[], file: string }[] = [];
  
  try {
    const files = readdirSync(LOGS_DIR)
      .filter(f => f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 7); // Last 7 days
    
    for (const file of files) {
      const filePath = join(LOGS_DIR, file);
      const content = readFileSync(filePath, 'utf-8');
      const logLines = content.split('\n').filter(line => line.trim());
      const recentLines = logLines.slice(-lines);
      
      result.push({ logs: recentLines, file });
    }
  } catch (error) {
    console.error('Failed to read logs:', error);
  }
  
  return result;
}

export function getLogFilePathForUI(): string {
  return LOGS_DIR;
}