<script lang="ts">
	import 'yaxa-svelte/yaxa.css';
	import '../app.css';
	import { YaxaApp } from 'yaxa-svelte';
	import { siteConfig } from '../site.config';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<YaxaApp config={siteConfig}>
	{@render children()}
</YaxaApp>
