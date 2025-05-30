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
		const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
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
			this.log(`Command failed: ${command}`, 'error');
			this.log(error.message, 'error');
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

		this.log('🔄 Syncing with upstream VS Code...');
		
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
			
			this.log('✅ Successfully synced with upstream');
		} catch (error) {
			this.log('Failed to sync with upstream. Please resolve conflicts manually.', 'error');
			throw error;
		}
	}

	async installDependencies() {
		this.log('📦 Installing dependencies...');
		this.execCommand('npm install');
		this.log('✅ Dependencies installed');
	}

	async buildCursorClone() {
		this.log('🔨 Building CursorClone...');
		
		// Clean previous builds
		this.execCommand('npm run clean');
		
		// Compile TypeScript
		this.execCommand('npm run compile');
		
		// Build extensions
		this.execCommand('npm run compile-extensions');
		
		this.log('✅ CursorClone compiled successfully');
	}

	async packageForPlatform(platform, arch) {
		this.log(`📦 Packaging CursorClone for ${platform}-${arch}...`);
		
		const gulpTask = `vscode-${platform}-${arch}`;
		
		try {
			this.execCommand(`npx gulp ${gulpTask}`);
			this.log(`✅ Successfully packaged for ${platform}-${arch}`);
		} catch (error) {
			this.log(`Failed to package for ${platform}-${arch}`, 'error');
			throw error;
		}
	}

	async packageAll() {
		if (this.targetPlatform && this.targetArch) {
			await this.packageForPlatform(this.targetPlatform, this.targetArch);
			return;
		}

		const platforms = this.targetPlatform ? [this.targetPlatform] : Object.keys(PLATFORMS);
		
		for (const platform of platforms) {
			const archs = this.targetArch ? [this.targetArch] : PLATFORMS[platform];
			
			for (const arch of archs) {
				await this.packageForPlatform(platform, arch);
			}
		}
	}

	async createRelease() {
		this.log('🚀 Creating release...');
		
		const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
		const tagName = `v${version}`;
		
		// Create git tag
		try {
			this.execCommand(`git tag -a ${tagName} -m "Release ${version}"`);
			this.log(`✅ Created tag ${tagName}`);
		} catch (error) {
			this.log(`Tag ${tagName} might already exist`, 'warn');
		}
		
		// Push to origin
		this.execCommand('git push origin main --tags');
		
		this.log(`✅ Release ${version} created and pushed`);
	}

	async validateBuild() {
		this.log('🔍 Validating build...');
		
		// Check if product.json has correct branding
		const product = JSON.parse(fs.readFileSync('product.json', 'utf8'));
		
		if (product.nameShort !== 'CursorClone') {
			throw new Error('Product name is not correctly set to CursorClone');
		}
		
		if (product.applicationName !== 'cursorclone') {
			throw new Error('Application name is not correctly set to cursorclone');
		}
		
		this.log('✅ Build validation passed');
	}

	async run() {
		try {
			this.log('🚀 Starting CursorClone build process...');
			
			await this.validateBuild();
			await this.syncWithUpstream();
			await this.installDependencies();
			await this.buildCursorClone();
			await this.packageAll();
			
			if (process.argv.includes('--release')) {
				await this.createRelease();
			}
			
			this.log('🎉 CursorClone build completed successfully!');
			
		} catch (error) {
			this.log('❌ Build failed!', 'error');
			this.log(error.message, 'error');
			process.exit(1);
		}
	}

	static printHelp() {
		console.log(`
CursorClone Build Automation Script

Usage: node build-cursorclone.js [options]

Options:
  --platform <platform>    Target platform (darwin, linux, win32)
  --arch <arch>            Target architecture (x64, arm64)
  --skip-sync              Skip syncing with upstream VS Code
  --release                Create and push a release tag
  --verbose                Show detailed output
  --help                   Show this help message

Examples:
  node build-cursorclone.js                           # Build for current platform
  node build-cursorclone.js --platform linux --arch x64  # Build for specific platform/arch
  node build-cursorclone.js --release --verbose           # Create release with verbose output
  node build-cursorclone.js --skip-sync                   # Skip upstream sync

Environment Variables:
  CURSORCLONE_SKIP_TESTS=1    Skip running tests during build
  CURSORCLONE_QUALITY=stable  Set the quality/release channel
		`);
	}
}

// Main execution
if (require.main === module) {
	if (process.argv.includes('--help')) {
		CursorCloneBuildManager.printHelp();
		process.exit(0);
	}
	
	const buildManager = new CursorCloneBuildManager();
	buildManager.run();
}

module.exports = CursorCloneBuildManager;
