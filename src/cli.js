#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';

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

program.parse(process.argv);