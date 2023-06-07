#! /usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';

(async () => {
  try {
    if (!fs.existsSync('./package.json')) {
      console.log(chalk.redBright('package.json not found.'));
      process.exit();
    };

    const packageData = fs.readFileSync('./package.json');
    const { scripts = {} } = JSON.parse(packageData);
    if (Object.keys(scripts).length === 0) {
      console.log(chalk.redBright('package.json no script.'));
      process.exit();
    };
    
    let pkgManageTool = 'npm';
    let pkgManageToolList = [
      { tool: 'npm', exist: () => fs.existsSync('./package-lock.json') },
      { tool: 'yarn', exist: () => fs.existsSync('./yarn.lock') },
      { tool: 'pnpm', exist: () => fs.existsSync('./pnpm-lock.yaml') },
    ];
    const existLockArr = pkgManageToolList.filter((v) => v.exist());
    if (existLockArr.length === 1) {
      pkgManageTool = existLockArr[0].tool;
    };
    let prompts = [
      {
        type: 'list',
        name: 'targetScript',
        message: `Select a script to run:`,
        choices: Object.keys(scripts).map((v) => `${v}: ${scripts[v]}`),
        loop: false,
      },
    ];
    if (existLockArr.length > 1) {
      prompts.push({
        type: 'list',
        name: 'targetPkgTool',
        message: `Select a package management tool:`,
        choices: existLockArr.map((v) => v.tool),
        loop: false,
      })
    };

    const { targetScript, targetPkgTool = pkgManageTool } = await inquirer.prompt(prompts);
    console.log(chalk.blueBright(`running: ${targetPkgTool} run ${targetScript.split(':')[0]}`));
    spawn(targetPkgTool, ['run', targetScript.split(':')[0]], {
      stdio: 'inherit',
    })
  } catch (error) {
    console.log(error);
  }
})();