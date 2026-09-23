<!-- src/lib/components/CyberMeter.svelte -->
<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		min?: number;
		segments?: number;
		variant?:
			'emerald' | 'rose' | 'amber' | 'cyan' | 'teal' | 'indigo' | 'orange' | 'purple' | 'default';
		showValue?: boolean;
		label?: string;
		unit?: string;
		class?: string;
	}

	let {
		value = 0,
		max = 100,
		min = 0,
		segments = 14,
		variant = 'cyan',
		showValue = false,
		label,
		unit = '',
		class: className = ''
	}: Props = $props();

	let percentage = $derived(
		Math.max(0, Math.min(100, max > min ? ((value - min) / (max - min)) * 100 : 0))
	);

	let activeSegments = $derived(Math.round((percentage / 100) * segments));

	const segmentColorMap: Record<string, { on: string; glow: string; text: string }> = {
		emerald: {
			on: 'bg-emerald-400',
			glow: 'shadow-[0_0_8px_rgba(52,211,153,0.85)]',
			text: 'text-emerald-300'
		},
		rose: {
			on: 'bg-rose-400',
			glow: 'shadow-[0_0_8px_rgba(251,113,133,0.85)]',
			text: 'text-rose-300'
		},
		amber: {
			on: 'bg-amber-400',
			glow: 'shadow-[0_0_8px_rgba(251,191,36,0.85)]',
			text: 'text-amber-300'
		},
		cyan: {
			on: 'bg-cyan-400',
			glow: 'shadow-[0_0_8px_rgba(34,211,238,0.85)]',
			text: 'text-cyan-300'
		},
		teal: {
			on: 'bg-teal-400',
			glow: 'shadow-[0_0_8px_rgba(45,212,191,0.85)]',
			text: 'text-teal-300'
		},
		indigo: {
			on: 'bg-indigo-400',
			glow: 'shadow-[0_0_8px_rgba(129,140,248,0.85)]',
			text: 'text-indigo-300'
		},
		orange: {
			on: 'bg-orange-400',
			glow: 'shadow-[0_0_8px_rgba(251,146,60,0.85)]',
			text: 'text-orange-300'
		},
		purple: {
			on: 'bg-purple-400',
			glow: 'shadow-[0_0_8px_rgba(192,132,252,0.85)]',
			text: 'text-purple-300'
		},
		default: {
			on: 'bg-cyan-400',
			glow: 'shadow-[0_0_8px_rgba(34,211,238,0.85)]',
			text: 'text-cyan-300'
		}
	};

	let resolved = $derived(segmentColorMap[variant] ?? segmentColorMap.default);
</script>

<div class="mt-auto flex flex-col gap-1.5 pt-2 pb-0.5 font-mono {className}">
	{#if label || showValue}
		<div class="flex items-center justify-between text-[10.5px] tracking-wide text-zinc-300">
			{#if label}
				<span class="font-medium text-zinc-300">{label}</span>
			{/if}
			{#if showValue}
				<span class="{resolved.text} font-bold font-mono">
					{typeof value === 'number'
						? Number.isInteger(value)
							? value
							: value.toFixed(1)
						: value}{unit}
				</span>
			{:else}
				<span class="text-[10px] font-mono text-zinc-400 font-medium">
					{Math.round(percentage)}%
				</span>
			{/if}
		</div>
	{/if}

	<!-- Segmented LED Bar -->
	<div
		class="flex h-2 w-full items-center gap-1 rounded bg-black/80 p-0.5 border border-white/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
	>
		{#each Array.from({ length: segments }, (_, i) => i) as idx (idx)}
			{@const isOn = idx < activeSegments}
			<div
				class="h-full flex-1 rounded-[1px] transition-all duration-300 {isOn
					? `${resolved.on} ${resolved.glow} border-t border-white/40`
					: 'bg-zinc-800/40 border-t border-black/80'}"
			></div>
		{/each}
	</div>
</div>
