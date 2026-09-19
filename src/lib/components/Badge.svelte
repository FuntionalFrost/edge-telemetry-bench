<script module lang="ts">
	import { tv, type VariantProps } from 'yaxa-svelte';

	export const badgeVariants = tv({
		base: 'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide backdrop-blur-sm',
		variants: {
			variant: {
				emerald:
					'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.18)]',
				rose: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.18)]',
				amber:
					'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.18)]',
				cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.18)]',
				purple:
					'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.18)]',
				blue: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.18)]',
				zinc: 'bg-zinc-800/90 text-zinc-100 border-zinc-600'
			}
		},
		defaultVariants: {
			variant: 'zinc'
		}
	});

	export type BadgeVariants = VariantProps<typeof badgeVariants>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: BadgeVariants['variant'];
		children?: Snippet;
		class?: string;
	}

	let { variant = 'zinc', children, class: className = '' }: Props = $props();

	let badgeClass = $derived(badgeVariants({ variant, class: className }));
</script>

<span class={badgeClass}>
	{#if children}
		{@render children()}
	{/if}
</span>
