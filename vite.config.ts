import type { Adapter } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
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
		tailwindcss(),
		sveltekit({
			preprocess: [vitePreprocess()],
			adapter: selectedAdapter,
			files: { assets: 'static' }
		})
	]
});
