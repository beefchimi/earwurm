# This script is useful for NPM only.

function nukeNpm() {
  rm -rf node_modules &&
  rm -rf package-lock.json &&
  find ./packages -name "node_modules" -type d -maxdepth 2 -exec rm -rf {} + &&
  find ./packages -name "package-lock.json" -type f -maxdepth 2 -exec rm {} + &&
  npm cache clean --force
}

nukeNpm
