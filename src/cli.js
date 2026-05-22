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
    console.log(chalk.gray('Run npm run dev to start the API server.'));
  });

program
  .command('dev')
  .description('Start the HTTP API server on port 3001')
  .action(async () => {
    console.log(chalk.blue('🚀 Starting Predict Station API server...'));
    await startServer(3001);
  });

program
  .command('server')
  .description('Start the HTTP API server')
  .action(async () => {
    console.log(chalk.blue('🔌 Starting HTTP API server...'));
    await startServer(3001);
  });

program.parse(process.argv);