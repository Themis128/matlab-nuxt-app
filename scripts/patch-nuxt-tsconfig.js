const fs = require('fs');
const path = require('path');

const nuxtTsPath = path.resolve(process.cwd(), '.nuxt', 'tsconfig.json');

try {
  if (!fs.existsSync(nuxtTsPath)) {
    console.warn(`[patch-nuxt-tsconfig] ${nuxtTsPath} not found`);
    process.exit(0);
  }

  const content = fs.readFileSync(nuxtTsPath, 'utf8');
  const fixed = content.replace(/"module"\s*:\s*"preserve"/g, '"module": "ESNext"');

  if (content !== fixed) {
    fs.writeFileSync(nuxtTsPath, fixed, 'utf8');
    console.warn(`[patch-nuxt-tsconfig] Patched module option in ${nuxtTsPath}`);
  } else {
    console.warn(`[patch-nuxt-tsconfig] No change required; module is not set to "preserve"`);
  }
} catch (err) {
  console.error('[patch-nuxt-tsconfig] Error patching tsconfig:', err);
  process.exit(1);
}
