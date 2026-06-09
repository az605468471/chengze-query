import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      // 启用快速刷新
      fastRefresh: true,
    }),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 启用压缩
    compress: true,
    // 优化热更新
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // 启用压缩
    compress: true,
  },
  build: {
    outDir: 'dist',
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库分离
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将工具库分离
          'utils': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        // 移除 debugger
        drop_debugger: true,
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 source map（生产环境可关闭）
    sourcemap: false,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['jspdf', 'jspdf-autotable'],
  },
  base: '/chengze-query/',
})
