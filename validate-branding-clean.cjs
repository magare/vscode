#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Branding validation script for CursorClone
 */

const fs = require('fs');
const path = require('path');

function log(message, isError = false) {
	const prefix = isError ? '[ERROR]' : '[INFO]';
	console.log(`${prefix} ${message}`);
}

function validateProductJson() {
	const productPath = path.join(__dirname, 'product.json');

	if (!fs.existsSync(productPath)) {
		log('product.json not found', true);
		return false;
	}

	try {
		const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));

		const expectedValues = {
			nameShort: 'CursorClone',
			applicationName: 'cursorclone',
			dataFolderName: '.cursorclone',
			serverDataFolderName: '.cursorclone-server'
		};

		let isValid = true;

		for (const [key, expectedValue] of Object.entries(expectedValues)) {
			if (product[key] !== expectedValue) {
				log(`product.json ${key}: expected '${expectedValue}', got '${product[key]}'`, true);
				isValid = false;
			} else {
				log(`product.json ${key}: correct`);
			}
		}

		return isValid;
	} catch (error) {
		log(`Failed to parse product.json: ${error.message}`, true);
		return false;
	}
}

function validatePackageJson() {
	const packagePath = path.join(__dirname, 'package.json');

	if (!fs.existsSync(packagePath)) {
		log('package.json not found', true);
		return false;
	}

	try {
		const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

		const expectedValues = {
			name: 'cursorclone',
			author: 'CursorClone Team'
		};

		let isValid = true;

		for (const [key, expectedValue] of Object.entries(expectedValues)) {
			if (pkg[key] !== expectedValue) {
				log(`package.json ${key}: expected '${expectedValue}', got '${pkg[key]}'`, true);
				isValid = false;
			} else {
				log(`package.json ${key}: correct`);
			}
		}

		return isValid;
	} catch (error) {
		log(`Failed to parse package.json: ${error.message}`, true);
		return false;
	}
}

function validateReadme() {
	const readmePath = path.join(__dirname, 'README.md');

	if (!fs.existsSync(readmePath)) {
		log('README.md not found', true);
		return false;
	}

	try {
		const content = fs.readFileSync(readmePath, 'utf8');

		const requiredContent = [
			'CursorClone',
			'AI-powered code editor',
			'build-cursorclone.js'
		];

		let isValid = true;

		for (const required of requiredContent) {
			if (!content.includes(required)) {
				log(`README.md missing required content: '${required}'`, true);
				isValid = false;
			} else {
				log(`README.md contains: '${required}'`);
			}
		}

		return isValid;
	} catch (error) {
		log(`Failed to read README.md: ${error.message}`, true);
		return false;
	}
}

function main() {
	log('Starting branding validation...');

	const validations = [
		validateProductJson(),
		validatePackageJson(),
		validateReadme()
	];

	const allValid = validations.every(result => result);

	if (allValid) {
		log('All branding validations passed!');
		process.exit(0);
	} else {
		log('Some branding validations failed!', true);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
