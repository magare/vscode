#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * CursorClone Build Automation Script
 *
 * This script automates the entire CursorClone build process including:
 * - Syncing with upstream VS Code
 * - Building the application
 * - Packaging for different platforms
 * - Creating releases
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const PLATFORMS = {
	darwin: ['x64', 'arm64'],
	linux: ['x64', 'arm64'],
	win32: ['x64', 'arm64']
};

class CursorCloneBuildManager {
	constructor() {
		this.rootDir = __dirname;
		this.isVerbose = process.argv.includes('--verbose');
		this.skipSync = process.argv.includes('--skip-sync');
		this.targetPlatform = this.getPlatformArg();
		this.targetArch = this.getArchArg();
	}

	log(message, level = 'info') {
		const timestamp = new Date().toISOString();
		const prefix = level === 'error' ? '[ERROR]' : level === 'warn' ? '[WARN]' : '[INFO]';
		console.log(`[${timestamp}] ${prefix} ${message}`);
	}

	execCommand(command, options = {}) {
		this.log(`Executing: ${command}`, 'info');
		try {
			const result = execSync(command, {
				cwd: this.rootDir,
				stdio: this.isVerbose ? 'inherit' : 'pipe',
				encoding: 'utf8',
				...options
			});
			return result;
		} catch (error) {
			this.log(`Command failed: ${error.message}`, 'error');
			throw error;
		}
	}

	getPlatformArg() {
		const platformIndex = process.argv.indexOf('--platform');
		if (platformIndex !== -1 && process.argv[platformIndex + 1]) {
			return process.argv[platformIndex + 1];
		}
		return process.platform;
	}

	getArchArg() {
		const archIndex = process.argv.indexOf('--arch');
		if (archIndex !== -1 && process.argv[archIndex + 1]) {
			return process.argv[archIndex + 1];
		}
		return process.arch === 'arm64' ? 'arm64' : 'x64';
	}

	async syncWithUpstream() {
		if (this.skipSync) {
			this.log('Skipping upstream sync as requested');
			return;
		}

		this.log('Syncing with upstream VS Code...');

		try {
			// Fetch latest from upstream
			this.execCommand('git fetch upstream');

			// Get current branch
			const currentBranch = this.execCommand('git branch --show-current').trim();

			// Create backup branch
			const backupBranch = `backup-${Date.now()}`;
			this.execCommand(`git checkout -b ${backupBranch}`);
			this.execCommand(`git checkout ${currentBranch}`);

			// Merge upstream/main
			this.log('Merging upstream changes...');
			this.execCommand('git merge upstream/main --no-edit');

			this.log('Successfully synced with upstream');
		} catch (error) {
			this.log('Failed to sync with upstream. Please resolve conflicts manually.', 'error');
			throw error;
		}
	}

	async installDependencies() {
		this.log('Installing dependencies...');
		this.execCommand('npm install');
		this.log('Dependencies installed');
	}

	async buildCursorClone() {
		this.log('Building CursorClone...');

		// Clean previous builds
		this.execCommand('npm run clean');

		// Compile TypeScript
		this.execCommand('npm run compile');

		// Build extensions
		this.execCommand('npm run compile-extensions');

		// Download built-in extensions
		this.execCommand('npm run download-builtin-extensions');

		this.log('CursorClone build completed');
	}

	async packageApplication() {
		this.log('Packaging application...');

		const platform = this.targetPlatform;
		const arch = this.targetArch;

		if (!PLATFORMS[platform] || !PLATFORMS[platform].includes(arch)) {
			this.log(`Unsupported platform/arch combination: ${platform}/${arch}`, 'error');
			return;
		}

		// Set platform-specific environment variables
		process.env.VSCODE_PLATFORM = platform;
		process.env.VSCODE_ARCH = arch;

		// Package based on platform
		if (platform === 'darwin') {
			this.execCommand(`npm run gulp -- vscode-darwin-${arch}`);
		} else if (platform === 'linux') {
			this.execCommand(`npm run gulp -- vscode-linux-${arch}`);
		} else if (platform === 'win32') {
			this.execCommand(`npm run gulp -- vscode-win32-${arch}`);
		}

		this.log('Application packaged successfully');
	}

	async createArchive() {
		this.log('Creating archive...');

		const platform = this.targetPlatform;
		const arch = this.targetArch;
		const version = require('./package.json').version;

		const buildDir = path.join(this.rootDir, '.build');
		let archiveName;
		let sourceDir;

		if (platform === 'darwin') {
			archiveName = `CursorClone-${version}-darwin-${arch}.zip`;
			sourceDir = path.join(buildDir, 'VSCode-darwin');
		} else if (platform === 'linux') {
			archiveName = `CursorClone-${version}-linux-${arch}.tar.gz`;
			sourceDir = path.join(buildDir, 'VSCode-linux-x64');
		} else if (platform === 'win32') {
			archiveName = `CursorClone-${version}-win32-${arch}.zip`;
			sourceDir = path.join(buildDir, 'VSCode-win32-x64');
		}

		if (fs.existsSync(sourceDir)) {
			const archivePath = path.join(this.rootDir, 'releases', archiveName);

			// Ensure releases directory exists
			fs.mkdirSync(path.dirname(archivePath), { recursive: true });

			if (platform === 'linux') {
				this.execCommand(`tar -czf "${archivePath}" -C "${path.dirname(sourceDir)}" "${path.basename(sourceDir)}"`);
			} else {
				this.execCommand(`cd "${path.dirname(sourceDir)}" && zip -r "${archivePath}" "${path.basename(sourceDir)}"`);
			}

			this.log(`Archive created: ${archiveName}`);
		} else {
			this.log('Build directory not found. Please run build first.', 'error');
		}
	}

	async runTests() {
		this.log('Running tests...');
		this.execCommand('npm test');
		this.log('All tests passed');
	}

	async validateBuild() {
		this.log('Validating build...');

		// Check if required files exist
		const requiredFiles = [
			'package.json',
			'product.json',
			'.build'
		];

		for (const file of requiredFiles) {
			const filePath = path.join(this.rootDir, file);
			if (!fs.existsSync(filePath)) {
				this.log(`Required file missing: ${file}`, 'error');
				return false;
			}
		}

		// Validate product.json
		const productJson = JSON.parse(fs.readFileSync(path.join(this.rootDir, 'product.json'), 'utf8'));
		if (productJson.applicationName !== 'cursorclone') {
			this.log('Product configuration validation failed', 'error');
			return false;
		}

		this.log('Build validation passed');
		return true;
	}

	async showHelp() {
		console.log(`
CursorClone Build Tool

Usage: node build-cursorclone.js [command] [options]

Commands:
	sync        Sync with upstream VS Code
	install     Install dependencies
	build       Build CursorClone
	package     Package application for distribution
	archive     Create distribution archive
	test        Run tests
	validate    Validate build
	all         Run complete build pipeline
	help        Show this help

Options:
	--platform <platform>   Target platform (darwin, linux, win32)
	--arch <arch>          Target architecture (x64, arm64)
	--skip-sync            Skip upstream sync
	--verbose              Verbose output

Examples:
	node build-cursorclone.js all
	node build-cursorclone.js package --platform darwin --arch arm64
	node build-cursorclone.js build --verbose
		`);
	}

	async run() {
		const command = process.argv[2] || 'help';

		try {
			switch (command) {
				case 'sync':
					await this.syncWithUpstream();
					break;
				case 'install':
					await this.installDependencies();
					break;
				case 'build':
					await this.buildCursorClone();
					break;
				case 'package':
					await this.packageApplication();
					break;
				case 'archive':
					await this.createArchive();
					break;
				case 'test':
					await this.runTests();
					break;
				case 'validate':
					await this.validateBuild();
					break;
				case 'all':
					await this.syncWithUpstream();
					await this.installDependencies();
					await this.buildCursorClone();
					await this.packageApplication();
					await this.createArchive();
					await this.validateBuild();
					this.log('Complete build pipeline finished');
					break;
				case 'help':
				default:
					await this.showHelp();
					break;
			}
		} catch (error) {
			this.log(`Build failed: ${error.message}`, 'error');
			process.exit(1);
		}
	}
}

// Run the build manager
if (require.main === module) {
	const buildManager = new CursorCloneBuildManager();
	buildManager.run();
}

module.exports = CursorCloneBuildManager;
