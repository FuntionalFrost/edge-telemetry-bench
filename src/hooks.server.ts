import type { HandleServerError } from '@sveltejs/kit/hooks';

// src/hooks.server.ts
import { createYaxaHook } from 'yaxa-svelte';
import { siteConfig } from './site.config';

export const handle = createYaxaHook(siteConfig);

export const handleError: HandleServerError = ({ error, event, kind }) => {
	// Log full error server-side; SvelteKit 3 automatically sanitizes client error payloads
	console.error(`[handleError] (${kind}) on ${event.url.pathname}:`, error);
};
