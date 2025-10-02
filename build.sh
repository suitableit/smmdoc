#!/bin/bash

# Force npm usage and prevent pnpm detection
export PACKAGE_MANAGER=npm
export NPM_CONFIG_PACKAGE_MANAGER=npm
export DISABLE_PNPM=true
export FORCE_NPM=true

# Remove any pnpm lock files if they exist
rm -f pnpm-lock.yaml
rm -f .pnpmrc

# Ensure npm is used
which npm
npm --version

# Install dependencies with npm
npm ci --legacy-peer-deps

# Build the project
npm run build