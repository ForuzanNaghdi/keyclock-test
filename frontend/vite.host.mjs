import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = loadEnv('development', root, 'SSO_');
if (!env.SSO_REALM || !env.SSO_CLIENT || !/^https:\/\/[^/\s?#\[\]()]+$/.test(env.SSO_URL ?? '')) {
  throw new Error('Check SSO_URL (plain HTTPS origin without trailing slash), SSO_REALM and SSO_CLIENT in ../.env.local');
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_KEYCLOAK_URL': JSON.stringify(env.SSO_URL),
    'import.meta.env.VITE_KEYCLOAK_REALM': JSON.stringify(env.SSO_REALM),
    'import.meta.env.VITE_KEYCLOAK_CLIENT': JSON.stringify(env.SSO_CLIENT),
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
});
