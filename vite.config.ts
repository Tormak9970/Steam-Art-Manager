import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import { resolve } from "path";
import { rmdirSync } from "fs";

type ExcludeOptions = {
  directories: string[]
}

/**
 * Removes the provided directories from build.
 * @param config The plugin's configuration options.
 * @returns A Vite plugin.
 */
function excludeDirectories(config?: ExcludeOptions) {
  return {
    name: 'remove-progress-images',
    resolveId (source: string) {
      return source === 'virtual-module' ? source : null;
    },
    renderStart (outputOptions: any, inputOptions: any) {
      const outDir = outputOptions.dir;
      
      if (config) {
        for (const directory of config.directories) {
          const directoryPath = resolve(outDir, directory);
          rmdirSync(directoryPath, { recursive: true });
          console.log(`Deleted ${directoryPath}`);
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    svelte({
      preprocess: [
        sveltePreprocess({
          typescript: true,
        }),
      ],
    }),
    excludeDirectories({
      directories: ["progress-images"]
    })
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari15",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/windows/main/main.html')
      },
      external: [
        "/public/progress-images"
      ],
    },
  },
  define: {
    'APP_VERSION': JSON.stringify(process.env.npm_package_version),
  }
}));
