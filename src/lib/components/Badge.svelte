<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'emerald' | 'rose' | 'amber' | 'cyan' | 'purple' | 'blue' | 'zinc';
		children?: Snippet;
		class?: string;
	}

	let { variant = 'zinc', children, class: className = '' }: Props = $props();

	const variantStyles: Record<string, string> = {
		emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
		rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
		amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
		cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
		purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
		blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
		zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide {variantStyles[
		variant
	] || variantStyles.zinc} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</span>
