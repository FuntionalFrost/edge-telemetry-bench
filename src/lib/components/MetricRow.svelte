<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import { Tooltip } from 'yaxa-svelte';
	import type { TelemetryTileVariants } from './TelemetryTile.svelte';

	interface Props {
		label: string;
		value?: string | number;
		valueClass?: string;
		tooltip?: string;
		children?: Snippet;
	}

	let {
		label,
		value,
		valueClass = 'text-white font-semibold',
		tooltip,
		children
	}: Props = $props();

	const getDomain = getContext<(() => TelemetryTileVariants['variant']) | undefined>('tileDomain');
	const domain = $derived(getDomain ? (getDomain() ?? 'default') : 'default');

	const domainTriggerMap: Record<string, string> = {
		server: 'decoration-emerald-400/60 hover:text-emerald-300 hover:decoration-emerald-300',
		security: 'decoration-rose-400/60 hover:text-rose-300 hover:decoration-rose-300',
		bleed: 'decoration-amber-400/60 hover:text-amber-300 hover:decoration-amber-300',
		surveillance: 'decoration-orange-400/60 hover:text-orange-300 hover:decoration-orange-300',
		network: 'decoration-indigo-400/60 hover:text-indigo-300 hover:decoration-indigo-300',
		crypto: 'decoration-teal-400/60 hover:text-teal-300 hover:decoration-teal-300',
		client: 'decoration-cyan-400/60 hover:text-cyan-300 hover:decoration-cyan-300',
		command: 'decoration-cyan-300/70 hover:text-cyan-200 hover:decoration-cyan-200',
		default: 'decoration-zinc-400/60 hover:text-zinc-200 hover:decoration-zinc-300'
	};

	const domainBadgeMap: Record<string, string> = {
		server: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
		security: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
		bleed: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
		surveillance: 'text-orange-300 border-orange-500/40 bg-orange-950/60',
		network: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/60',
		crypto: 'text-teal-300 border-teal-500/40 bg-teal-950/60',
		client: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
		command: 'text-cyan-200 border-cyan-400/50 bg-cyan-950/70',
		default: 'text-zinc-300 border-zinc-500/40 bg-zinc-900/60'
	};

	const domainBorderMap: Record<string, string> = {
		server: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
		security: 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]',
		bleed: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
		surveillance: 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]',
		network: 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]',
		crypto: 'border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.3)]',
		client: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
		command: 'border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)]',
		default: 'border-zinc-500/50 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
	};
</script>

<div class="flex items-center justify-between py-0.5 font-mono text-xs">
	{#if tooltip}
		<Tooltip side="top">
			{#snippet trigger()}
				<span
					class="cursor-help text-zinc-300 underline decoration-dotted underline-offset-2 transition-colors {domainTriggerMap[
						domain
					] ?? domainTriggerMap.default}"
				>
					{label}:
				</span>
			{/snippet}
			{#snippet content()}
				<div
					class="-m-3 rounded-md border bg-[#05070c] p-2.5 text-left font-mono {domainBorderMap[
						domain
					] ?? domainBorderMap.default}"
				>
					<div class="mb-1.5 flex items-center justify-between gap-3 border-b border-white/10 pb-1">
						<span class="text-[10px] font-bold tracking-wider text-zinc-100 uppercase">{label}</span
						>
						<span
							class="rounded border px-1.5 py-0.2 text-[9px] font-semibold tracking-wider uppercase {domainBadgeMap[
								domain
							] ?? domainBadgeMap.default}"
						>
							{domain}
						</span>
					</div>
					<p class="text-[11px] leading-relaxed text-zinc-200">{tooltip}</p>
				</div>
			{/snippet}
		</Tooltip>
	{:else}
		<span class="text-zinc-300">{label}:</span>
	{/if}

	{#if children}
		{@render children()}
	{:else}
		<strong class={valueClass}>{value}</strong>
	{/if}
</div>
