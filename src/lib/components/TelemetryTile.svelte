<script lang="ts">
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
		iconClass = 'text-zinc-400',
		variant = 'default',
		loading = false,
		loadingText = 'Awaiting stream connection...',
		children
	}: Props = $props();

	const variantBorderClasses: Record<string, string> = {
		default: 'border-white/10 hover:border-white/20',
		bleed: 'border-white/10 border-l-2 border-l-amber-400 hover:border-white/20',
		surveillance: 'border-white/10 border-l-2 border-l-orange-500 hover:border-white/20',
		client: 'border-white/10 border-l-2 border-l-blue-500 hover:border-white/20',
		command: 'border-white/10 border-l-2 border-l-cyan-500 hover:border-white/20'
	};
</script>

<div
	class="group relative flex flex-col justify-between rounded-lg border bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/60 {variantBorderClasses[
		variant
	] || variantBorderClasses.default}"
>
	<div>
		<!-- Card Header -->
		<div class="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
			<h4 class="font-mono text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
				{title}
			</h4>
			<IconComponent
				size={18}
				class="{iconClass} transition-transform duration-200 group-hover:scale-110"
			/>
		</div>

		<!-- Card Body -->
		{#if loading}
			<div class="flex items-center gap-2.5 py-4 font-mono text-xs text-zinc-500">
				<span class="relative flex size-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"
					></span>
					<span class="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
				</span>
				<span class="animate-pulse">{loadingText}</span>
			</div>
		{:else if children}
			<div class="flex flex-col gap-2 font-mono text-xs text-zinc-400">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
