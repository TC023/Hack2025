// Metro configuration for Expo - extends default to include 3D model extensions
// Allows importing .glb/.gltf/.obj/.mtl assets via require()
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure resolver arrays exist (defensive)
config.resolver.assetExts = config.resolver.assetExts || [];
for (const ext of ['glb','gltf','obj','mtl']) {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
}

module.exports = config;
