# Cloudflare Pages Deployment Guide

This project is built with **Astro 5** and **Tailwind CSS 4**. Due to Tailwind 4's high-performance architecture, it requires specific native bindings that can sometimes be missed in the Cloudflare Pages build environment.

## 🚀 Recommended Project Settings

When setting up your project on the Cloudflare Pages dashboard, use the following configurations:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |

## 🛠️ Environment Variables

Ensure your build uses a modern Node.js version. In the Cloudflare Pages dashboard, go to **Settings > Builds & deployments > Environment variables** and add:

- `NODE_VERSION`: `20` (or higher)

## 🐛 Common Issues & Fixes

### 1. Missing Native Bindings (`lightningcss` or `oxide`)
If you see errors like:
- `Cannot find module '../lightningcss.linux-x64-gnu.node'`
- `Cannot find module '@tailwindcss/oxide-linux-x64-gnu'`

**Fix**: These are already addressed in `package.json` by adding `lightningcss` and `@tailwindcss/oxide` as explicit dependencies. This forces the package manager to download the correct platform-specific binaries for Cloudflare's Linux environment.

### 2. Output Configuration
Ensure `astro.config.mjs` is set to `output: "static"` for standard Pages deployment.
```javascript
export default defineConfig({
  output: 'static',
  // ...
});
```

## 📦 Deployment Workflow

1. Commit your changes: `git commit -m "fix: deployment configuration"`
2. Push to GitHub: `git push`
3. Cloudflare will automatically detect the push and start the build.
