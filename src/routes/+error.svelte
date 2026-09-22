<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Error {page.status} — Edge Telemetry Bench</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="scanline-bg flex min-h-screen items-center justify-center px-4 text-zinc-100">
	<div class="text-center font-mono">
		<div class="mb-6 flex items-center justify-center gap-3">
			<span
				class="inline-block size-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]"
			></span>
			<span class="text-xs tracking-widest text-zinc-500 uppercase">System Fault</span>
		</div>

		<h1 class="mb-2 text-7xl font-bold text-rose-400 tabular-nums">
			{page.status}
		</h1>

		<p class="mb-8 text-sm text-zinc-400">
			{page.error?.message ?? 'An unexpected error occurred.'}
		</p>

		<a
			href={resolve('/')}
			class="inline-block rounded border border-cyan-500/40 px-5 py-2 text-xs tracking-wider text-cyan-300 transition-all hover:border-cyan-400/70 hover:bg-cyan-950/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
		>
			RETURN TO INTERROGATOR
		</a>
	</div>
</main>
