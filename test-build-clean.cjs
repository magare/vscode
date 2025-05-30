#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Quick test script to validate CursorClone build environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message, level = 'info') {
	const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
	const prefix = level === 'error' ? '[ERROR]' : level === 'warn' ? '[WARN]' : '[INFO]';
	console.log(`[${timestamp}] ${prefix} ${message}`);
}

function checkFile(filePath, description) {
	if (fs.existsSync(filePath)) {
		log(`${description} exists: ${filePath}`);
		return true;
	} else {
		log(`${description} missing: ${filePath}`, 'error');
		return false;
	}
}

function runCommand(command, description) {
	try {
		log(`Testing: ${description}`);
		const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
		log(`Success: ${description}`);
		return true;
	} catch (error) {
		log(`Failed: ${description} - ${error.message}`, 'error');
		return false;
	}
}

function checkNodeVersion() {
	const version = process.version;
	log(`Node.js version: ${version}`);

	// Read .nvmrc to check expected version
	const nvmrcPath = path.join(__dirname, '.nvmrc');
	if (fs.existsSync(nvmrcPath)) {
		const expectedVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
		log(`Expected Node.js version: v${expectedVersion}`);

		if (!version.startsWith(`v${expectedVersion}`)) {
			log(`Node.js version mismatch. Expected v${expectedVersion}, got ${version}`, 'warn');
			return false;
		}
	}

	return true;
}

function main() {
	log('Starting CursorClone build environment validation...');

	let allChecks = true;

	// Check Node.js version
	if (!checkNodeVersion()) {
		allChecks = false;
	}

	// Check required files
	const requiredFiles = [
		['package.json', 'Package configuration'],
		['product.json', 'Product configuration'],
		['tsconfig.json', 'TypeScript configuration'],
		['gulpfile.js', 'Gulp build file']
	];

	for (const [file, description] of requiredFiles) {
		if (!checkFile(path.join(__dirname, file), description)) {
			allChecks = false;
		}
	}

	// Check git configuration
	if (!runCommand('git --version', 'Git availability')) {
		allChecks = false;
	}

	if (!runCommand('git remote -v', 'Git remotes')) {
		allChecks = false;
	}

	// Check npm/yarn
	if (!runCommand('npm --version', 'npm availability')) {
		allChecks = false;
	}

	// Check if dependencies are installed
	const nodeModulesPath = path.join(__dirname, 'node_modules');
	if (!checkFile(nodeModulesPath, 'Node modules directory')) {
		log('Run "npm install" to install dependencies', 'warn');
		allChecks = false;
	}

	// Check Python (required for native modules)
	runCommand('python3 --version', 'Python 3 availability');

	// Check build tools based on platform
	if (process.platform === 'darwin') {
		runCommand('xcode-select --version', 'Xcode command line tools');
	} else if (process.platform === 'linux') {
		runCommand('gcc --version', 'GCC compiler');
		runCommand('make --version', 'Make build tool');
	} else if (process.platform === 'win32') {
		runCommand('where cl', 'Visual Studio C++ compiler');
	}

	// Summary
	if (allChecks) {
		log('All environment checks passed! Ready to build CursorClone.');
	} else {
		log('Some environment checks failed. Please fix the issues above.', 'error');
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
