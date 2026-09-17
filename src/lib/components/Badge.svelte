<script module lang="ts">
	import { tv, type VariantProps } from 'yaxa-svelte';

	export const badgeVariants = tv({
		base: 'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide',
		variants: {
			variant: {
				emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
				rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
				amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
				cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
				purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
				blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
				zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700'
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
