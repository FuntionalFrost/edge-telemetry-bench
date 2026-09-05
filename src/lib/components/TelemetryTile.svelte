<script lang="ts">
	import { Column, InlineLoading, Tile } from 'carbon-components-svelte';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		title: string;
		icon: Component<{ size?: number; class?: string }>;
		iconClass?: string;
		variant?: 'default' | 'bleed' | 'surveillance' | 'client' | 'command';
		loading?: boolean;
		loadingText?: string;
		children?: Snippet;
	}

	let {
		title,
		icon: IconComponent,
		iconClass = '',
		variant = 'default',
		loading = false,
		loadingText = 'Awaiting stream connection...',
		children
	}: Props = $props();
</script>

<Column lg={4} md={4} sm={4}>
	<Tile class="telemetry-tile {variant !== 'default' ? `tile-${variant}` : ''}">
		<div class="tile-header">
			<h4>{title}</h4>
			<IconComponent size={20} class={iconClass} />
		</div>
		{#if loading}
			<InlineLoading description={loadingText} />
		{:else if children}
			{@render children()}
		{/if}
	</Tile>
</Column>
