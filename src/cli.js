#!/usr/bin/env node

import chalk from 'chalk';
import { startServer } from './server.js';

async function main() {
  console.log(chalk.blue('🚀 Starting Predict Station API server...'));
  console.log(chalk.cyan('  → Listening on http://localhost:3001'));
  await startServer(3001);
}

main();