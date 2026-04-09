const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo: watch workspace root so Metro can resolve @workspace/* packages
config.watchFolders = [workspaceRoot];

// Monorepo: resolve modules from both local and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Block Metro from watching pnpm tmp directories created/deleted during installs
// This prevents ENOENT crashes when Metro scans dirs that disappear mid-scan
const existingBlockList = config.resolver?.blockList;
const blockListArray = existingBlockList
  ? Array.isArray(existingBlockList)
    ? existingBlockList
    : [existingBlockList]
  : [];

config.resolver.blockList = [
  ...blockListArray,
  /node_modules\/\.pnpm\/.*_tmp_\d+.*/,
  /.*\/.git\/.*/,
];

module.exports = config;
