<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		value?: string | number;
		valueClass?: string;
		children?: Snippet;
	}

	let { label, value, valueClass = 'text-white', children }: Props = $props();
</script>

<div class="flex items-center justify-between py-0.5 font-mono text-xs">
	<span class="text-zinc-400">{label}:</span>
	{#if children}
		{@render children()}
	{:else}
		<strong class={valueClass}>{value}</strong>
	{/if}
</div>
