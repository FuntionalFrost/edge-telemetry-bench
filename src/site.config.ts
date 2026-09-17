// src/site.config.ts
import { defineSiteConfig } from 'yaxa-svelte';

export const siteConfig = defineSiteConfig({
	name: 'Edge Telemetry Bench',
	title: 'Edge Telemetry Bench — Isolate Interrogator // Sec.Surveillance.Mesh',
	description:
		'Adversarial benchmarking suite and real-time telemetry interrogator for serverless JavaScript isolates and edge runtimes.',
	url: 'https://edge-telemetry-bench.vercel.app',
	version: '0.1.0',
	project: {
		license: 'MIT',
		type: 'open-source',
		repositoryUrl: 'https://github.com/FuntionalFrost/edge-telemetry-bench',
		isAccessibleForFree: true,
		badge: 'MIT Open Source'
	},
	theme: {
		defaultMode: 'dark',
		primaryColor: 'cyan',
		neutralColor: 'zinc'
	},
	seo: {
		keywords: [
			'sveltekit',
			'svelte5',
			'vercel-edge',
			'isolate',
			'telemetry',
			'benchmark',
			'spectre',
			'webassembly',
			'security'
		],
		twitterCard: 'summary_large_image'
	},
	robots: {
		rules: [
			{
				userAgent: '*',
				allow: ['/'],
				disallow: ['/api/']
			}
		]
	}
});
