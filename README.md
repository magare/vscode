# CursorClone - AI-Powered Code Editor

[![Build Status](https://github.com/magare/vscode/actions/workflows/build.yml/badge.svg)](https://github.com/magare/vscode/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/magare/vscode.svg)](https://github.com/magare/vscode/releases)

## About CursorClone

CursorClone is a modern, AI-powered code editor built on the foundation of Visual Studio Code. It combines the robust editing capabilities of VS Code with advanced AI features designed to enhance developer productivity.

<p align="center">
  <img alt="CursorClone in action" src="https://user-images.githubusercontent.com/35271042/118224532-3842c400-b438-11eb-923d-a5f66fa6785a.png">
</p>

## Key Features

- 🤖 **AI-Powered Code Completion** - Intelligent code suggestions and auto-completion
- 🔍 **Smart Code Analysis** - Advanced code understanding and refactoring suggestions  
- 🚀 **Enhanced Productivity** - AI-assisted development workflows
- 🌍 **Multi-Platform Support** - Available for Windows, macOS, and Linux
- 🔧 **Extensible Architecture** - Full compatibility with VS Code extensions
- 📦 **Automated Builds** - Continuous integration and automated releases

## Quick Start

### Installation

Download the latest release for your platform:
- [Windows (x64)](https://github.com/magare/vscode/releases/latest)
- [macOS (Intel)](https://github.com/magare/vscode/releases/latest)
- [macOS (Apple Silicon)](https://github.com/magare/vscode/releases/latest)
- [Linux (x64)](https://github.com/magare/vscode/releases/latest)
- [Linux (ARM64)](https://github.com/magare/vscode/releases/latest)

### Development Build

To build CursorClone from source:

```bash
# Clone the repository
git clone https://github.com/magare/vscode.git
cd vscode

# Setup development environment
chmod +x setup-cursorclone.sh
./setup-cursorclone.sh

# Build the application
chmod +x build-cursorclone.js
./build-cursorclone.js
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Python 3.x (for native modules)

### Platform-specific Requirements

**Linux:**
```bash
sudo apt-get install build-essential pkg-config libx11-dev libxkbfile-dev libsecret-1-dev
```

**macOS:**
- Xcode Command Line Tools

**Windows:**
- Visual Studio Build Tools or Visual Studio Community

### Building

```bash
# Install dependencies
npm ci

# Compile TypeScript
npm run compile

# Build extensions
npm run compile-extensions

# Package for your platform
./build-cursorclone.js --platform $(uname -s | tr '[:upper:]' '[:lower:]')
```

### Automated Build Commands

The build system supports various automation commands:

```bash
# Full build with upstream sync
./build-cursorclone.js

# Build specific platform
./build-cursorclone.js --platform linux --arch x64

# Skip upstream sync
./build-cursorclone.js --skip-sync

# Verbose output
./build-cursorclone.js --verbose

# Release build
./build-cursorclone.js --release
```

## Contributing

We welcome contributions to CursorClone! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports** - Report issues and bugs
- 💡 **Feature Requests** - Suggest new AI-powered features  
- 🔧 **Code Contributions** - Submit pull requests
- 📖 **Documentation** - Improve documentation and examples
- 🧪 **Testing** - Help test new features and releases

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-ai-feature`
3. **Setup development environment**: `./setup-cursorclone.sh`
4. **Make your changes**
5. **Test your changes**: `npm test`
6. **Build locally**: `./build-cursorclone.js --skip-sync`
7. **Submit a pull request**

### Code Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed
- Use tabs for indentation (following VS Code conventions)

## Architecture

CursorClone is built on the VS Code architecture with the following enhancements:

```
CursorClone Architecture
├── Core Editor (VS Code Base)
├── AI Integration Layer
│   ├── Code Completion Engine
│   ├── Smart Analysis Service
│   └── AI Model Interface
├── Enhanced Extensions
│   ├── AI-Powered IntelliSense
│   ├── Smart Refactoring Tools
│   └── Productivity Enhancers
└── Build & Release Automation
    ├── Multi-platform CI/CD
    ├── Automated Testing
    └── Release Management
```

## Roadmap

### Current Focus (v1.x)
- ✅ Complete VS Code fork and rebranding
- ✅ Automated build system
- ⏳ Basic AI code completion
- ⏳ Enhanced IntelliSense

### Upcoming (v2.x)
- 🔄 Advanced AI code analysis
- 🔄 Smart refactoring suggestions
- 🔄 Natural language code generation
- 🔄 AI-powered debugging assistance

### Future (v3.x+)
- 📋 Multi-model AI support
- 📋 Custom AI model integration
- 📋 Collaborative AI features
- 📋 Advanced productivity workflows

## License

CursorClone is licensed under the [MIT License](LICENSE.txt), the same as the underlying VS Code project.

## Acknowledgments

- **Microsoft VS Code Team** - For creating the amazing foundation
- **Open Source Community** - For continuous contributions and feedback
- **Contributors** - Everyone who helps make CursorClone better

## Support

- 📧 **Issues**: [GitHub Issues](https://github.com/magare/vscode/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/magare/vscode/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/magare/vscode/wiki)

---

**Note**: CursorClone is an independent project and is not affiliated with Microsoft or the official Visual Studio Code product.
please see the document [How to Contribute](https://github.com/microsoft/vscode/wiki/How-to-Contribute), which covers the following:

* [How to build and run from source](https://github.com/microsoft/vscode/wiki/How-to-Contribute)
* [The development workflow, including debugging and running tests](https://github.com/microsoft/vscode/wiki/How-to-Contribute#debugging)
* [Coding guidelines](https://github.com/microsoft/vscode/wiki/Coding-Guidelines)
* [Submitting pull requests](https://github.com/microsoft/vscode/wiki/How-to-Contribute#pull-requests)
* [Finding an issue to work on](https://github.com/microsoft/vscode/wiki/How-to-Contribute#where-to-contribute)
* [Contributing to translations](https://aka.ms/vscodeloc)

## Feedback

* Ask a question on [Stack Overflow](https://stackoverflow.com/questions/tagged/vscode)
* [Request a new feature](CONTRIBUTING.md)
* Upvote [popular feature requests](https://github.com/microsoft/vscode/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)
* [File an issue](https://github.com/microsoft/vscode/issues)
* Connect with the extension author community on [GitHub Discussions](https://github.com/microsoft/vscode-discussions/discussions) or [Slack](https://aka.ms/vscode-dev-community)
* Follow [@code](https://twitter.com/code) and let us know what you think!

See our [wiki](https://github.com/microsoft/vscode/wiki/Feedback-Channels) for a description of each of these channels and information on some other available community-driven channels.

## Related Projects

Many of the core components and extensions to VS Code live in their own repositories on GitHub. For example, the [node debug adapter](https://github.com/microsoft/vscode-node-debug) and the [mono debug adapter](https://github.com/microsoft/vscode-mono-debug) repositories are separate from each other. For a complete list, please visit the [Related Projects](https://github.com/microsoft/vscode/wiki/Related-Projects) page on our [wiki](https://github.com/microsoft/vscode/wiki).

## Bundled Extensions

VS Code includes a set of built-in extensions located in the [extensions](extensions) folder, including grammars and snippets for many languages. Extensions that provide rich language support (code completion, Go to Definition) for a language have the suffix `language-features`. For example, the `json` extension provides coloring for `JSON` and the `json-language-features` extension provides rich language support for `JSON`.

## Development Container

This repository includes a Visual Studio Code Dev Containers / GitHub Codespaces development container.

* For [Dev Containers](https://aka.ms/vscode-remote/download/containers), use the **Dev Containers: Clone Repository in Container Volume...** command which creates a Docker volume for better disk I/O on macOS and Windows.
  * If you already have VS Code and Docker installed, you can also click [here](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/vscode) to get started. This will cause VS Code to automatically install the Dev Containers extension if needed, clone the source code into a container volume, and spin up a dev container for use.

* For Codespaces, install the [GitHub Codespaces](https://marketplace.visualstudio.com/items?itemName=GitHub.codespaces) extension in VS Code, and use the **Codespaces: Create New Codespace** command.

Docker / the Codespace should have at least **4 Cores and 6 GB of RAM (8 GB recommended)** to run full build. See the [development container README](.devcontainer/README.md) for more information.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) license.
