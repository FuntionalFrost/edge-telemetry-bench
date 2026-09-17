// src/hooks.server.ts
import { createYaxaHook } from 'yaxa-svelte';
import { siteConfig } from './site.config';

export const handle = createYaxaHook(siteConfig);
