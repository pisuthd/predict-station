#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { startServer } from './server.js';

const program = new Command();

program
  .name('predict-station')
  .description('CLI for Predict Station')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Predict Station project')
  .action(() => {
    console.log(chalk.blue('🎯 Welcome to Predict Station!'));
    console.log(chalk.green('Project initialized successfully.'));
    console.log(chalk.gray('Navigate to the frontend folder and run npm run dev to start.'));
  });

program
  .command('start')
  .description('Start the Predict Station frontend')
  .action(() => {
    console.log(chalk.blue('🚀 Starting Predict Station frontend...'));
    console.log(chalk.gray('Run cd frontend && npm run dev to start the development server.'));
  });

program
  .command('dev')
  .description('Start both the HTTP API server and frontend')
  .action(async () => {
    console.log(chalk.blue('🎯 Starting Predict Station...'));
    
    // Start HTTP API server
    console.log(chalk.cyan('  → Starting HTTP API server on port 3001...'));
    await startServer(3001);
    console.log(chalk.green('  ✓ HTTP API server running on http://localhost:3001'));
    
    console.log(chalk.gray('\nPress Ctrl+C to stop the server.\n'));
  });

program
  .command('server')
  .description('Start just the HTTP API server')
  .action(async () => {
    console.log(chalk.blue('🔌 Starting HTTP API server...'));
    await startServer(3001);
    console.log(chalk.green('Server running on http://localhost:3001'));
    console.log(chalk.gray('\nPress Ctrl+C to stop.\n'));
  });

program.parse(process.argv);