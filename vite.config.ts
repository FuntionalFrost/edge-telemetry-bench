import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Core structural type tokens from SvelteKit
import type { Adapter, Config } from '@sveltejs/kit';

// Concrete adapter implementations
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNetlify from '@sveltejs/adapter-netlify';
import adapterVercel from '@sveltejs/adapter-vercel';

// Statically assign the abstract Adapter contract
let selectedAdapter: Adapter;
const target = process.env.DEPLOY_TARGET;

switch (target) {
	case 'cloudflare':
		selectedAdapter = adapterCloudflare();
		break;
	case 'vercel':
		// Pinning to the Vercel Edge Runtime platform environment
		selectedAdapter = adapterVercel({ runtime: 'edge' });
		break;
	case 'netlify':
		// Forcing Deno-backed Netlify Edge Functions execution
		selectedAdapter = adapterNetlify({ edge: true, split: false });
		break;
	default:
		// Fallback adapter for type evaluation and local development context
		selectedAdapter = adapterCloudflare();
		console.log('⚠️ No DEPLOY_TARGET specified. Defaulting compile pipeline to Cloudflare.');
}

// Assemble the configuration object using explicit type assertions
const svelteKitConfig: Config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: selectedAdapter,
		files: {
			assets: 'static'
		}
	}
};

export default defineConfig({
	plugins: [
		// Pass the validated, type-safe config directly to the SvelteKit plugin
		sveltekit(svelteKitConfig)
	],
	server: {
		// Ensuring deterministic network binds for telemetry/scraping setups
		host: true,
		port: 5173
	}
});
