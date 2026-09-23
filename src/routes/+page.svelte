<script lang="ts">
	import { telemetryEngine } from '$lib/client/telemetry.svelte';
	import DomainFilterNav from '$lib/components/DomainFilterNav.svelte';
	import TelemetryHeader from '$lib/components/TelemetryHeader.svelte';
	import TelemetryHUD from '$lib/components/TelemetryHUD.svelte';
	import TelemetryTileRenderer from '$lib/components/TelemetryTileRenderer.svelte';
	import ControllerTile from '$lib/components/tiles/ControllerTile.svelte';
	import { STANDARD_VECTORS, type DomainFilter } from '$lib/config/telemetry-registry';
	import { TriangleAlert } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let activeDomain = $state<DomainFilter>('all');

	onMount(() => {
		void telemetryEngine.launch();
	});
</script>

<main class="scanline-bg min-h-screen px-4 py-8 text-zinc-100 sm:px-6 lg:px-12">
	<div class="mx-auto max-w-7xl">
		<!-- Tactical Header -->
		<TelemetryHeader />

		<!-- Executive Summary HUD Banner -->
		<TelemetryHUD />

		<!-- Domain Category Filters -->
		<DomainFilterNav bind:activeDomain />

		<!-- Telemetry Matrix Grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each STANDARD_VECTORS as def (def.id)}
				{#if activeDomain === 'all' || activeDomain === def.domain}
					<TelemetryTileRenderer {def} state={telemetryEngine.telemetry} />
				{/if}
			{/each}

			<!-- [27] TELEMETRY CORE CONTROLLER (Interactive Cockpit Tile) -->
			{#if activeDomain === 'all' || activeDomain === 'command'}
				<ControllerTile />
			{/if}
		</div>

		<!-- Failure Banner -->
		{#if telemetryEngine.streamHaltedUnexpectedly}
			<div
				class="mt-8 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 font-mono text-xs text-rose-400"
			>
				<TriangleAlert size={18} class="mt-0.5 shrink-0 text-rose-400" />
				<div>
					<h5 class="font-semibold text-rose-300">Isolate Execution Halted</h5>
					<p class="mt-0.5 text-rose-400/80">
						{telemetryEngine.errorMessage ||
							'Container memory limit breached, execution runtime hit a fatal uncaught exception, or CPU limits were enforced by the hypervisor.'}
					</p>
				</div>
			</div>
		{/if}
	</div>
</main>
