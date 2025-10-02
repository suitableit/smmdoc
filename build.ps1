# Force npm usage and prevent pnpm detection
$env:PACKAGE_MANAGER = "npm"
$env:NPM_CONFIG_PACKAGE_MANAGER = "npm"
$env:DISABLE_PNPM = "true"
$env:FORCE_NPM = "true"

# Remove any pnpm lock files if they exist
if (Test-Path "pnpm-lock.yaml") { Remove-Item "pnpm-lock.yaml" -Force }
if (Test-Path ".pnpmrc") { Remove-Item ".pnpmrc" -Force }

# Ensure npm is used
Write-Host "Using npm version:"
npm --version

# Install dependencies with npm
Write-Host "Installing dependencies with npm..."
npm ci --legacy-peer-deps

# Build the project
Write-Host "Building the project..."
npm run build