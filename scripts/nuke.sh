function pnpmNuke() {
  rm -rf node_modules &&
  rm -rf pnpm-lock.yaml &&
  find ./app -name "node_modules" -type d -maxdepth 2 -exec rm -rf {} + &&
  find ./pkg -name "node_modules" -type d -maxdepth 2 -exec rm -rf {} + &&
  pnpm store prune
}

pnpmNuke
