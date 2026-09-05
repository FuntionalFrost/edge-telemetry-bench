import type { Adapter } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeCss, optimizeImports } from 'carbon-preprocess-svelte';
import { defineConfig } from 'vite';

import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterVercel from '@sveltejs/adapter-vercel';

// Default to Cloudflare Workers (primary isolate target), or switch to Vercel when specified
const selectedAdapter: Adapter =
	process.env.DEPLOY_TARGET === 'vercel'
		? adapterVercel({
				runtime: (process.env.VERCEL_RUNTIME as 'edge' | 'nodejs22.x') || 'edge'
			})
		: adapterCloudflare();

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			preprocess: [
				vitePreprocess(), // Transpiles TS into safe vanilla primitives first
				optimizeImports() // Rewrites barrel imports to lean, direct component source paths
			],
			adapter: selectedAdapter,
			files: { assets: 'static' }
		}),

		optimizeCss()
	]
});
