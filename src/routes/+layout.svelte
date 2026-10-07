<script lang="ts">
	import 'yaxa-svelte/yaxa.css';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { YaxaApp, Toaster, themeInitScript } from 'yaxa-svelte';
	import { siteConfig } from '../site.config';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html themeInitScript}
</svelte:head>

<YaxaApp config={siteConfig}>
	{@render children()}
	<Toaster position="bottom-right" richColors />
</YaxaApp>
