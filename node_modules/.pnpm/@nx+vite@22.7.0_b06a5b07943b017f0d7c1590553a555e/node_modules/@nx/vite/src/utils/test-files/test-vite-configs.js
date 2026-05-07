"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugins = exports.imports = exports.testOptionObject = exports.testOption = exports.buildOptionObject = exports.buildOption = exports.hasEverything = exports.someBuildOptionsSomeTestOption = exports.noBuildOptionsHasTestOption = exports.configNoDefineConfig = exports.conditionalConfig = exports.noContentDefineConfig = exports.someBuildOptions = exports.noBuildOptions = void 0;
exports.noBuildOptions = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

    export default defineConfig({
      cacheDir: '../../node_modules/.vitest',
      plugins: [
        react(),
        nxViteTsPaths(),
      ],

      test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      },

    });
    `;
exports.someBuildOptions = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

    export default defineConfig({
      cacheDir: '../../node_modules/.vitest',
      plugins: [
        react(),
        nxViteTsPaths(),
      ],

      test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      },

      build: {
        my: 'option',
      }

    });
    `;
exports.noContentDefineConfig = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

    export default defineConfig({});
    `;
exports.conditionalConfig = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    export default defineConfig(({ command, mode, ssrBuild }) => {
      if (command === 'serve') {
        return {
          port: 4200,
          host: 'localhost',
        }
      } else {
        // command === 'build'
        return {
          my: 'option',
        }
      }
    })
    `;
exports.configNoDefineConfig = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

    export default {
      plugins: [
        react(),
        nxViteTsPaths(),
      ],
    };
    `;
exports.noBuildOptionsHasTestOption = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

    export default defineConfig({
    
      cacheDir: '../../node_modules/.vitest',
      plugins: [
        react(),
        nxViteTsPaths(),
      ],

      test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      },

    });
    `;
exports.someBuildOptionsSomeTestOption = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

    export default defineConfig({
      plugins: [
        react(),
        nxViteTsPaths(),
      ],

      test: {
        my: 'option',
      },

      build: {
        my: 'option',
      }

    });
    `;
exports.hasEverything = `
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
    import dts from 'vite-plugin-dts';
    import { joinPathFragments } from '@nx/devkit';

    export default defineConfig({
      cacheDir: '../../node_modules/.vitest',
      plugins: [
        dts({ entryRoot: 'src', tsConfigFilePath: joinPathFragments(__dirname, 'tsconfig.lib.json'), skipDiagnostics: true }),
        react(),
        nxViteTsPaths(),
      ],
    
      // Configuration for building your library.
      // See: https://vite.dev/guide/build.html#library-mode
      build: {
        lib: {
          // Could also be a dictionary or array of multiple entry points.
          entry: 'src/index.ts',
          name: 'pure-libs-react-vite',
          fileName: 'index',
          // Change this to the formats you want to support.
          // Don't forget to update your package.json as well.
          formats: ['es'],
        },
        rollupOptions: {
          // External packages that should not be bundled into your library.
          external: ['react', 'react-dom', 'react/jsx-runtime'],
        },
      },
    
      test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      },
    });
    `;
exports.buildOption = `
    // Configuration for building your library.
    // See: https://vite.dev/guide/build.html#library-mode
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: 'src/index.ts',
        name: 'my-app',
        fileName: 'index',
        // Change this to the formats you want to support.
        // Don't forget to update your package.json as well.
        formats: ['es']
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: ['react', 'react-dom', 'react/jsx-runtime']
      }
    },`;
exports.buildOptionObject = {
    lib: {
        entry: 'src/index.ts',
        name: 'my-app',
        fileName: 'index',
        formats: ['es'],
    },
    rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
};
exports.testOption = `test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },`;
exports.testOptionObject = {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
};
exports.imports = [
    `import dts from 'vite-plugin-dts'`,
    `import { joinPathFragments } from '@nx/devkit'`,
];
exports.plugins = [`react()`, `nxViteTsPaths()`];
