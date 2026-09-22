// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';
import { createYaxaHook } from 'yaxa-svelte';
import { siteConfig } from './site.config';

export const handle = createYaxaHook(siteConfig);

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	// Log full error server-side; return only the sanitized message to the client
	console.error(`[handleError] ${status} on ${event.url.pathname}:`, error);
	return { message };
};
