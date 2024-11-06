import { defineConfig } from 'umi';

export default defineConfig({
  define: {
    'process.env.UMI_ENV': 'uat',
    "process.env.TG_URL": "",
  },
});
