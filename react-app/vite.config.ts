import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { emulatedEncapsulation } from './build/emulated-encapsulation';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
    },
    css: {
        postcss: {
            // `.browserslistrc` is a copy of the Angular app's `browserslist`, so
            // both apps emit the same vendor prefixes.
            plugins: [emulatedEncapsulation(), autoprefixer()],
        },
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'mixed-decls', 'legacy-js-api', 'color-functions'],
            },
        },
    },
});
