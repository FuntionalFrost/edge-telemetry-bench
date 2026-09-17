import { PROBE_REGISTRY } from '$lib/server/probes';
import { diagnosticStreamChunkSchema } from '$lib/types';
import { z } from 'zod';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const encoder = new TextEncoder();

	// Asynchronously execute probes in background and stream NDJSON chunks
	(async () => {
		try {
			for (const probe of PROBE_REGISTRY) {
				try {
					const data = await probe.run({ request });
					const chunk = { type: probe.type, data };

					const validation = diagnosticStreamChunkSchema.safeParse(chunk);
					if (!validation.success) {
						console.error(
							`Server side probe [${probe.type}] schema violation bypassed:`,
							z.treeifyError(validation.error)
						);
						continue;
					}

					await writer.write(encoder.encode(JSON.stringify(validation.data) + '\n'));
				} catch (probeError) {
					console.error(`Probe execution [${probe.type}] failed:`, probeError);
				}
			}
		} catch (streamError) {
			console.error('Fatal diagnostic stream failure:', streamError);
		} finally {
			// CRITICAL: Ensure stream closure even on client disconnect
			try {
				await writer.close();
			} catch {
				// Writer already closed / aborted by client
			}
		}
	})();

	return new Response(readable, {
		headers: {
			'Content-Type': 'application/x-ndjson',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
			Connection: 'keep-alive'
		}
	});
};
