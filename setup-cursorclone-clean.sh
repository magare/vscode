#!/bin/bash
#---------------------------------------------------------------------------------------------
#  Copyright (c) Microsoft Corporation. All rights reserved.
#  Licensed under the MIT License. See License.txt in the project root for license information.
#---------------------------------------------------------------------------------------------

# CursorClone Development Environment Setup Script

set -e

if ! command -v git &> /dev/null; then
	echo "Error: Git is not installed"
	exit 1
fi

if ! command -v node &> /dev/null; then
	echo "Error: Node.js is not installed"
	exit 1
fi

if ! command -v npm &> /dev/null; then
	echo "Error: npm is not installed"
	exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
	echo "Error: Not in a git repository"
	exit 1
fi

# Check if we're in the right repository
if [ ! -f "product.json" ] || [ ! -f "package.json" ]; then
	echo "Error: This doesn't appear to be a VS Code repository"
	exit 1
fi

echo "Setting up CursorClone development environment..."

# Check current Node.js version
CURRENT_NODE_VERSION=$(node --version)
echo "Current Node.js version: $CURRENT_NODE_VERSION"

# Check if .nvmrc exists and compare versions
if [ -f ".nvmrc" ]; then
	EXPECTED_NODE_VERSION=$(cat .nvmrc)
	echo "Expected Node.js version: v$EXPECTED_NODE_VERSION"

	if ! echo "$CURRENT_NODE_VERSION" | grep -q "^v$EXPECTED_NODE_VERSION"; then
		echo "Warning: Node.js version mismatch"
		echo "Consider switching to the expected version using:"
		echo "  nvm use"
		echo "  or"
		echo "  nvm install $EXPECTED_NODE_VERSION"
	fi
fi

# Configure git remotes
echo "Configuring git remotes..."

# Check if upstream remote exists
if ! git remote get-url upstream &> /dev/null; then
	echo "Adding upstream remote for VS Code..."
	git remote add upstream https://github.com/microsoft/vscode.git
else
	echo "Upstream remote already configured"
fi

# Fetch from upstream
echo "Fetching from upstream..."
git fetch upstream

# Install dependencies
echo "Installing dependencies..."
if npm install; then
	echo "Dependencies installed successfully"
else
	echo "Failed to install dependencies normally, trying with --ignore-scripts..."
	if npm install --ignore-scripts; then
		echo "Dependencies installed with --ignore-scripts"
		echo "You may need to build native modules separately"
	else
		echo "Failed to install dependencies"
		exit 1
	fi
fi

# Download built-in extensions
echo "Downloading built-in extensions..."
if npm run download-builtin-extensions; then
	echo "Built-in extensions downloaded"
else
	echo "Warning: Failed to download built-in extensions"
fi

# Run initial compilation
echo "Running initial TypeScript compilation..."
if npm run compile; then
	echo "Initial compilation completed"
else
	echo "Warning: Initial compilation failed"
	echo "This is normal if dependencies aren't fully installed yet"
fi

# Validate branding
echo "Validating CursorClone branding..."
if node validate-branding.js; then
	echo "Branding validation passed"
else
	echo "Warning: Branding validation failed"
fi

# Set up VS Code development settings
echo "Setting up VS Code development configuration..."

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Create or update launch.json for debugging
cat > .vscode/launch.json << 'EOF'
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Launch CursorClone",
			"type": "node",
			"request": "launch",
			"program": "${workspaceFolder}/scripts/code.sh",
			"args": ["--extensionDevelopmentPath=${workspaceFolder}"],
			"outFiles": ["${workspaceFolder}/out/**/*.js"],
			"env": {
				"VSCODE_DEV": "1"
			}
		},
		{
			"name": "Launch CursorClone (Web)",
			"type": "node",
			"request": "launch",
			"program": "${workspaceFolder}/scripts/code-web.sh",
			"args": ["--port=8080"],
			"env": {
				"VSCODE_DEV": "1"
			}
		}
	]
}
EOF

# Create or update tasks.json for build tasks
cat > .vscode/tasks.json << 'EOF'
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "Build CursorClone",
			"type": "shell",
			"command": "npm",
			"args": ["run", "compile"],
			"group": {
				"kind": "build",
				"isDefault": true
			},
			"presentation": {
				"reveal": "always",
				"panel": "new"
			},
			"problemMatcher": ["$tsc"]
		},
		{
			"label": "Watch Build",
			"type": "shell",
			"command": "npm",
			"args": ["run", "watch"],
			"group": "build",
			"isBackground": true,
			"presentation": {
				"reveal": "always",
				"panel": "new"
			},
			"problemMatcher": ["$tsc-watch"]
		},
		{
			"label": "Run Tests",
			"type": "shell",
			"command": "npm",
			"args": ["test"],
			"group": "test",
			"presentation": {
				"reveal": "always",
				"panel": "new"
			}
		},
		{
			"label": "Download Extensions",
			"type": "shell",
			"command": "npm",
			"args": ["run", "download-builtin-extensions"],
			"group": "build"
		},
		{
			"label": "Package CursorClone",
			"type": "shell",
			"command": "node",
			"args": ["build-cursorclone.js", "package"],
			"group": "build",
			"presentation": {
				"reveal": "always",
				"panel": "new"
			}
		}
	]
}
EOF

# Create or update settings.json
cat > .vscode/settings.json << 'EOF'
{
	"typescript.preferences.useAliasesForRenames": false,
	"typescript.suggest.includeCompletionsForImportStatements": false,
	"typescript.validate.enable": true,
	"npm.exclude": "**/node_modules/**",
	"search.exclude": {
		"**/node_modules": true,
		"**/bower_components": true,
		"**/.build": true,
		"**/out": true,
		"**/extensions/**/out": true
	},
	"files.exclude": {
		"**/.git": true,
		"**/node_modules": true,
		"**/.build": true
	},
	"editor.formatOnSave": true,
	"editor.insertSpaces": false,
	"editor.detectIndentation": false,
	"editor.tabSize": 4
}
EOF

echo "Development environment setup completed!"
echo ""
echo "Available commands:"
echo "  npm run compile          - Compile TypeScript"
echo "  npm run watch            - Watch and compile changes"
echo "  npm test                 - Run tests"
echo "  npm run download-builtin-extensions - Download extensions"
echo "  node build-cursorclone.js all - Complete build pipeline"
echo "  ./scripts/code.sh        - Launch CursorClone for development"
echo ""
echo "VS Code is now configured with:"
echo "  - Debug configurations for launching CursorClone"
echo "  - Build tasks for compilation and packaging"
echo "  - Recommended development settings"
echo ""
echo "To start developing:"
echo "  1. Open this folder in VS Code"
echo "  2. Use Ctrl+Shift+P -> 'Tasks: Run Task' -> 'Watch Build'"
echo "  3. Use F5 to launch CursorClone in debug mode"
