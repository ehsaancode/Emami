import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const normalizePublicUrl = (value = '') => {
  const trimmed = String(value || '').trim();
  if (!trimmed || trimmed === '/') return '';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicUrl = normalizePublicUrl(env.PUBLIC_URL);
  const base = publicUrl ? `${publicUrl}/` : '/';

  return {
    base,
    plugins: [
      react({
        include: /\.(jsx|tsx|js|ts)$/, // allow JSX in .js/.ts too
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    esbuild: {
      loader: 'jsx',
      include: /src[\\/].*\.[jt]sx?$/,
    },
    build: {
      outDir: 'build',
    },
    define: {
      'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
      'process.env.REACT_APP_IS_DEV_Env': JSON.stringify(env.REACT_APP_IS_DEV_Env),
      'process.env.REACT_APP_Env': JSON.stringify(env.REACT_APP_Env),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
  };
});
