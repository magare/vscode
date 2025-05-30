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
	const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
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
		const result = execSync(command, { 
			encoding: 'utf8', 
			stdio: 'pipe',
			cwd: __dirname 
		});
		log(`${description} - SUCCESS`);
		return true;
	} catch (error) {
		log(`${description} - FAILED: ${error.message}`, 'error');
		return false;
	}
}

function main() {
	log('🧪 Testing CursorClone Build Environment');
	
	let passed = 0;
	let total = 0;
	
	// Check core files
	const coreFiles = [
		['product.json', 'Product configuration'],
		['package.json', 'Package configuration'],
		['build-cursorclone.js', 'Build script'],
		['setup-cursorclone.sh', 'Setup script'],
		['.github/workflows/build.yml', 'CI/CD pipeline']
	];
	
	coreFiles.forEach(([file, desc]) => {
		total++;
		if (checkFile(file, desc)) passed++;
	});
	
	// Check product.json content
	total++;
	try {
		const product = JSON.parse(fs.readFileSync('product.json', 'utf8'));
		if (product.nameShort === 'CursorClone' && product.applicationName === 'cursorclone') {
			log('Product configuration properly branded');
			passed++;
		} else {
			log('Product configuration not properly branded', 'error');
		}
	} catch (error) {
		log(`Error reading product.json: ${error.message}`, 'error');
	}
	
	// Check package.json content
	total++;
	try {
		const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
		if (pkg.name === 'cursorclone' && pkg.author.name === 'CursorClone Team') {
			log('Package configuration properly branded');
			passed++;
		} else {
			log('Package configuration not properly branded', 'error');
		}
	} catch (error) {
		log(`Error reading package.json: ${error.message}`, 'error');
	}
	
	// Check git remotes
	total++;
	if (runCommand('git remote -v', 'Git remote configuration')) {
		passed++;
	}
	
	// Check Node.js version
	total++;
	if (runCommand('node --version', 'Node.js version')) {
		passed++;
	}
	
	// Summary
	log('');
	log(`📊 Test Results: ${passed}/${total} passed`);
	
	if (passed === total) {
		log('🎉 All tests passed! CursorClone build environment is ready.', 'info');
		return 0;
	} else {
		log(`⚠️  ${total - passed} tests failed. Please check the errors above.`, 'warn');
		return 1;
	}
}

process.exit(main());
