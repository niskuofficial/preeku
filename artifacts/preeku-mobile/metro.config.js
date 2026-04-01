const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Block Metro from watching pnpm tmp directories created/deleted during installs
// This prevents ENOENT crashes when Metro scans dirs that disappear mid-scan
const existingBlockList = config.resolver?.blockList;
const blockListArray = existingBlockList
  ? Array.isArray(existingBlockList)
    ? existingBlockList
    : [existingBlockList]
  : [];

config.resolver = {
  ...config.resolver,
  blockList: [
    ...blockListArray,
    /node_modules\/\.pnpm\/.*_tmp_\d+.*/,
  ],
};

module.exports = config;
