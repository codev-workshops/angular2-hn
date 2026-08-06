import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function preserveLegacyHeadUrls() {
    return {
        name: 'preserve-legacy-head-urls',
        enforce: 'post' as const,
        transformIndexHtml(html: string) {
            let transformed = html.replace(
                /(<meta\b[^>]*(?:name="(?:twitter:image|msapplication-TileImage|msapplication-config)"|property="og:image[^"]*")[^>]*\bcontent=")\/([^"]*)(")/gi,
                '$1$2$3'
            );

            // Preserve the frozen legacy head contract against Vite's asset-URL rewriting.
            transformed = transformed.replace(/<link\b[^>]*>/gi, (tag) => {
                const isLegacyRelativeLink =
                    /\brel="(?:mask-icon|icon|apple-touch-icon|manifest)"/i.test(tag) &&
                    !/\bhref="\/manifest\.json"/i.test(tag);
                return isLegacyRelativeLink ? tag.replace(/\bhref="\/([^"]*)"/i, 'href="$1"') : tag;
            });

            return transformed;
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
