<script lang="ts">
	import { DOMAIN_FILTERS, type DomainFilter } from '$lib/config/telemetry-registry';
	import { Filter } from '@lucide/svelte';

	interface Props {
		activeDomain: DomainFilter;
		onselect?: (domain: DomainFilter) => void;
	}

	let { activeDomain = $bindable('all'), onselect }: Props = $props();

	function handleSelect(domain: DomainFilter) {
		activeDomain = domain;
		onselect?.(domain);
	}
</script>

<nav
	class="mb-6 flex flex-wrap items-center gap-2 border-b border-white/8 pb-4"
	aria-label="Filter vectors by domain"
>
	<span class="mr-2 flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-400">
		<Filter size={13} class="text-cyan-400" /> DOMAIN:
	</span>
	{#each DOMAIN_FILTERS as filter (filter.id)}
		<button
			aria-pressed={activeDomain === filter.id}
			onclick={() => handleSelect(filter.id)}
			class="cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition-all {activeDomain ===
			filter.id
				? 'border border-cyan-500/60 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
				: 'border border-white/10 bg-zinc-900/70 text-zinc-400 hover:border-white/25 hover:text-zinc-200'}"
		>
			{filter.label} <span class="text-[10px] opacity-75">({filter.count})</span>
		</button>
	{/each}
</nav>
