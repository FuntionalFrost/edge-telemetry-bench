import type { Adapter } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
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
		// Pinning to Vercel Edge Runtime for the project, as Vercel's default is Node.js
		selectedAdapter = adapterVercel({ runtime: 'edge' });
		break;
	case 'netlify':
		// Forcing Deno-backed Netlify Edge Functions execution
		selectedAdapter = adapterNetlify({ edge: true });
		break;
	default:
		// Fallback adapter for type evaluation and local development context
		selectedAdapter = adapterCloudflare();
		console.log('⚠️ No DEPLOY_TARGET specified. Defaulting compile pipeline to Cloudflare.');
}

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: selectedAdapter,
			files: {
				assets: 'static'
			}
		})
	]
});
