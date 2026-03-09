// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import tailwindv4 from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dhanu.letretro.com",

  output: "static",

  integrations: [
    expressiveCode({
      plugins: [pluginLineNumbers()],
    }),
    mdx(),
    sitemap(),
    react(),
  ],

  vite: {
    plugins: [tailwindv4()],
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});