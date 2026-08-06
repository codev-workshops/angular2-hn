import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const legacyHeadUrlRewrites = [
    ['meta', 'name', 'twitter:image', 'content', '/assets/images/logo-loading.png', 'assets/images/logo-loading.png'],
    ['meta', 'property', 'og:image', 'content', '/assets/images/logo-loading.png', 'assets/images/logo-loading.png'],
    [
        'meta',
        'name',
        'msapplication-TileImage',
        'content',
        '/assets/icons/mstile-150x150.png',
        'assets/icons/mstile-150x150.png',
    ],
    [
        'meta',
        'name',
        'msapplication-config',
        'content',
        '/assets/icons/browserconfig.xml',
        'assets/icons/browserconfig.xml',
    ],
    ['link', 'rel', 'mask-icon', 'href', '/assets/icons/safari-pinned-tab.svg', 'assets/icons/safari-pinned-tab.svg'],
    ['link', 'rel', 'icon', 'href', '/favicon.ico', 'favicon.ico'],
    ['link', 'rel', 'icon', 'href', '/assets/icons/favicon-32x32.png', 'assets/icons/favicon-32x32.png'],
    ['link', 'rel', 'icon', 'href', '/assets/icons/favicon-16x16.png', 'assets/icons/favicon-16x16.png'],
    [
        'link',
        'rel',
        'apple-touch-icon',
        'href',
        '/assets/icons/apple-touch-icon.png',
        'assets/icons/apple-touch-icon.png',
    ],
    [
        'link',
        'rel',
        'apple-touch-icon',
        'href',
        '/assets/icons/apple-touch-icon-120x120.png',
        'assets/icons/apple-touch-icon-120x120.png',
    ],
    [
        'link',
        'rel',
        'apple-touch-icon',
        'href',
        '/assets/icons/apple-touch-icon-152x152.png',
        'assets/icons/apple-touch-icon-152x152.png',
    ],
    [
        'link',
        'rel',
        'apple-touch-icon',
        'href',
        '/assets/icons/apple-touch-icon-180x180.png',
        'assets/icons/apple-touch-icon-180x180.png',
    ],
    ['link', 'rel', 'manifest', 'href', '/manifest.webmanifest', 'manifest.webmanifest'],
] as const;

function preserveLegacyHeadUrls() {
    return {
        name: 'preserve-legacy-head-urls',
        enforce: 'post' as const,
        transformIndexHtml(html: string) {
            // Vite 6's dev middleware rewrites these exact legacy-relative URLs; build output does not.
            return legacyHeadUrlRewrites.reduce((transformed, [tag, key, keyValue, attribute, from, to]) => {
                const escapedKeyValue = keyValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(
                    `(<${tag}\\b(?=[^>]*\\b${key}="${escapedKeyValue}")(?=[^>]*\\b${attribute}=")[^>]*\\b${attribute}=")${escapedFrom}(")`,
                    'gi'
                );
                return transformed.replace(pattern, `$1${to}$2`);
            }, html);
        },
    };
}

export default defineConfig({
    root: 'web',
    plugins: [react(), preserveLegacyHeadUrls()],
    server: {
        port: 4200,
        strictPort: true,
    },
    build: {
        outDir: '../dist-react',
        emptyOutDir: true,
    },
});
