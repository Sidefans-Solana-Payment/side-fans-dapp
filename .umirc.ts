import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'npm',
  tailwindcss: {},
  hash: true,
  plugins: ['@umijs/plugins/dist/tailwindcss'],
  define: {
    "process.env.UMI_ENV": "dev",
    "process.env.TG_URL": "",
  }
});
