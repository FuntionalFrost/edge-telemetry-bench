<script module lang="ts">
	import { tv, type VariantProps } from 'yaxa-svelte';

	export const telemetryTileVariants = tv({
		base: 'group relative flex flex-col justify-between rounded-lg border border-white/12 bg-[#06080e]/92 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl border-l-2 cursor-pointer active:scale-[0.985] active:brightness-125 select-none',
		variants: {
			variant: {
				default:
					'border-l-zinc-400 hover:border-white/30 hover:border-l-zinc-300 hover:bg-zinc-900/60 hover:shadow-zinc-950/80',
				server:
					'border-l-emerald-400 hover:border-emerald-500/50 hover:border-l-emerald-300 hover:bg-emerald-950/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.22)]',
				security:
					'border-l-rose-400 hover:border-rose-500/50 hover:border-l-rose-300 hover:bg-rose-950/25 hover:shadow-[0_0_30px_rgba(244,63,94,0.22)]',
				bleed:
					'border-l-amber-400 hover:border-amber-500/50 hover:border-l-amber-300 hover:bg-amber-950/25 hover:shadow-[0_0_30px_rgba(245,158,11,0.22)]',
				surveillance:
					'border-l-orange-400 hover:border-orange-500/50 hover:border-l-orange-300 hover:bg-orange-950/25 hover:shadow-[0_0_30px_rgba(249,115,22,0.22)]',
				network:
					'border-l-indigo-400 hover:border-indigo-500/50 hover:border-l-indigo-300 hover:bg-indigo-950/25 hover:shadow-[0_0_30px_rgba(99,102,241,0.22)]',
				crypto:
					'border-l-teal-400 hover:border-teal-500/50 hover:border-l-teal-300 hover:bg-teal-950/25 hover:shadow-[0_0_30px_rgba(20,184,166,0.22)]',
				client:
					'border-l-cyan-400 hover:border-cyan-500/50 hover:border-l-cyan-300 hover:bg-cyan-950/25 hover:shadow-[0_0_30px_rgba(6,182,212,0.22)]',
				command:
					'border-l-cyan-300 hover:border-cyan-300/70 hover:border-l-cyan-200 hover:bg-cyan-950/35 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type TelemetryTileVariants = VariantProps<typeof telemetryTileVariants>;

	export const tileIconColorMap = {
		default: 'text-zinc-300',
		server: 'text-emerald-300',
		security: 'text-rose-300',
		bleed: 'text-amber-300',
		surveillance: 'text-orange-300',
		network: 'text-indigo-300',
		crypto: 'text-teal-300',
		client: 'text-cyan-300',
		command: 'text-cyan-200'
	} as const;

	export const tileIconPodMap = {
		default:
			'border-white/15 bg-white/[0.04] text-zinc-300 group-hover:border-zinc-300/50 group-hover:bg-zinc-800/80 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.12)]',
		server:
			'border-emerald-500/35 bg-emerald-950/40 text-emerald-300 group-hover:border-emerald-400/70 group-hover:bg-emerald-900/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
		security:
			'border-rose-500/35 bg-rose-950/40 text-rose-300 group-hover:border-rose-400/70 group-hover:bg-rose-900/50 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]',
		bleed:
			'border-amber-500/35 bg-amber-950/40 text-amber-300 group-hover:border-amber-400/70 group-hover:bg-amber-900/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
		surveillance:
			'border-orange-500/35 bg-orange-950/40 text-orange-300 group-hover:border-orange-400/70 group-hover:bg-orange-900/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]',
		network:
			'border-indigo-500/35 bg-indigo-950/40 text-indigo-300 group-hover:border-indigo-400/70 group-hover:bg-indigo-900/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
		crypto:
			'border-teal-500/35 bg-teal-950/40 text-teal-300 group-hover:border-teal-400/70 group-hover:bg-teal-900/50 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]',
		client:
			'border-cyan-500/35 bg-cyan-950/40 text-cyan-300 group-hover:border-cyan-400/70 group-hover:bg-cyan-900/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]',
		command:
			'border-cyan-400/45 bg-cyan-950/50 text-cyan-200 group-hover:border-cyan-300/80 group-hover:bg-cyan-900/60 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
	} as const;
</script>

<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { setContext } from 'svelte';

	interface Props {
		title: string;
		icon: Component<{ size?: number; class?: string }>;
		iconClass?: string;
		variant?: TelemetryTileVariants['variant'];
		loading?: boolean;
		loadingText?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		icon: IconComponent,
		variant = 'default',
		iconClass,
		loading = false,
		loadingText = 'Awaiting stream connection...',
		class: className = '',
		children
	}: Props = $props();

	// Provide domain category to all nested MetricRows
	setContext('tileDomain', () => variant);

	let isClicked = $state(false);
	let clickTimer: ReturnType<typeof setTimeout> | undefined;

	function handleTileClick() {
		isClicked = true;
		if (clickTimer) clearTimeout(clickTimer);
		clickTimer = setTimeout(() => {
			isClicked = false;
		}, 450);
	}

	let tileClass = $derived(telemetryTileVariants({ variant, class: className }));
	let resolvedIconClass = $derived(iconClass ?? tileIconColorMap[variant ?? 'default']);
	let resolvedPodClass = $derived(tileIconPodMap[variant ?? 'default']);
</script>

<div
	role="button"
	tabindex="0"
	aria-label={title}
	class="{tileClass} {isClicked ? 'ring-1 ring-white/40 ring-offset-1 ring-offset-black' : ''}"
	onclick={handleTileClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleTileClick();
		}
	}}
>
	<!-- Card Header -->
	<div class="mb-3 flex items-center justify-between border-b border-white/8 pb-2.5">
		<h4 class="font-mono text-[11px] font-semibold tracking-wider text-zinc-100 uppercase">
			{title}
		</h4>
		<div
			class="relative flex size-8 items-center justify-center rounded-md border shadow-inner backdrop-blur-md transition-all duration-300 group-hover:scale-105 {resolvedPodClass}"
		>
			<!-- Subtle corner cyber notches -->
			<span
				class="pointer-events-none absolute -top-px -left-px size-1 rounded-tl-sm border-t border-l border-current opacity-80"
			></span>
			<span
				class="pointer-events-none absolute -bottom-px -right-px size-1 rounded-br-sm border-b border-r border-current opacity-80"
			></span>

			<IconComponent
				size={16}
				class="{resolvedIconClass} transition-transform duration-300 group-hover:rotate-6"
			/>
		</div>
	</div>

	<!-- Card Body -->
	{#if loading}
		<div class="flex flex-1 items-center gap-2.5 py-4 font-mono text-xs text-zinc-400">
			<span class="relative flex size-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"
				></span>
				<span class="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
			</span>
			<span class="animate-pulse font-medium">{loadingText}</span>
		</div>
	{:else if children}
		<div class="flex flex-1 flex-col justify-between gap-2 font-mono text-xs text-zinc-300">
			{@render children()}
		</div>
	{/if}
</div>
