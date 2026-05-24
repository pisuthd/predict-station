#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import readline from 'readline';
import { startServer } from './server.js';

const program = new Command();

program
  .name('predict-station')
  .description('CLI for Predict Station')
  .version('0.1.0');

// Wallet command
program
  .command('wallet')
  .description('View wallet information')
  .action(() => {
    console.log(chalk.blue('\n🚀 Predict Station Wallet\n'));
    console.log(chalk.white('  Address:   ') + chalk.cyan('0x1234...abcd') + chalk.gray(' (placeholder)'));
    console.log(chalk.white('  Network:   ') + chalk.cyan('Devnet'));
    console.log(chalk.white('  Balance:   ') + chalk.cyan('1,000.00 SUI') + chalk.gray(' (placeholder)'));
    console.log(chalk.yellow('\n  ⚠️  Wallet is in demo mode'));
    console.log(chalk.gray('     Connect a real wallet to see actual balance\n'));
  });

// Server command (explicit)
program
  .command('server')
  .description('Start the Agent Node server')
  .action(async () => {
    console.log(chalk.blue('🚀 Starting Predict Station Agent Node...'));
    console.log(chalk.cyan('  → Listening on http://localhost:3001'));
    await startServer(3001);
  });

// Default action when no command is specified
const args = process.argv.slice(2);
if (args.length === 0) {
  startServerWithModelSelection();
} else {
  program.parse(process.argv);
}

// Model selection prompt
async function startServerWithModelSelection() {
  console.log(chalk.blue('\n🚀 Predict Station Agent Node\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
  
  console.log(chalk.white('  Select AI Model:\n'));
  console.log(chalk.cyan('    [1] Qwen3-1.7B ') + chalk.gray('(Fast, lower memory)'));
  console.log(chalk.cyan('    [2] Qwen3-4B   ') + chalk.gray('(Higher quality, more memory)\n'));
  
  const choice = await question(chalk.yellow('  Enter choice [1/2] (default: 1): ')) || '1';
  const modelType = choice.trim() === '2' ? '4B' : '1.7B';
  
  rl.close();
  
  console.log(chalk.cyan(`\n  → Starting with Qwen3-${modelType}...\n`));
  
  // Start server with selected model
  await startServer(3001, modelType);
}
