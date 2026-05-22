#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { startServer } from './server.js';

const program = new Command();

program
  .name('predict-station')
  .description('CLI for Predict Station')
  .version('0.1.0');

// Default: start server
program
  .command('')
  .action(async () => {
    console.log(chalk.blue('🚀 Starting Predict Station Agent Node...'));
    console.log(chalk.cyan('  → Listening on http://localhost:3001'));
    await startServer(3001);
  });

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

program.parse(process.argv);