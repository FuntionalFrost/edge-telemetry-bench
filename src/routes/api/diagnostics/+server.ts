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
				// Stop probe execution immediately if client disconnected or aborted
				if (request.signal.aborted) {
					break;
				}

				try {
					const data = await probe.run({ request });
					if (request.signal.aborted) {
						break;
					}

					const chunk = { type: probe.type, data };
					const validation = diagnosticStreamChunkSchema.safeParse(chunk);
					if (!validation.success) {
						console.error(
							`Server side probe [${probe.type}] schema violation bypassed:`,
							z.treeifyError(validation.error)
						);
						continue;
					}

					if (request.signal.aborted) {
						break;
					}

					await writer.write(encoder.encode(JSON.stringify(validation.data) + '\n'));
				} catch (probeError) {
					// Check if error is due to stream cancellation / client abort
					if (
						request.signal.aborted ||
						(probeError &&
							typeof probeError === 'object' &&
							'name' in probeError &&
							(probeError as { name: string }).name === 'AbortError')
					) {
						break;
					}
					// Only log unexpected probe errors when stream is healthy
					if (probeError !== undefined) {
						console.error(
							`Probe execution [${probe.type}] failed:`,
							probeError instanceof Error ? probeError.stack || probeError.message : probeError
						);
					}
				}
			}
		} catch (streamError) {
			if (!request.signal.aborted) {
				console.error('Fatal diagnostic stream failure:', streamError);
			}
		} finally {
			// Ensure writer cleanup on stream completion or client abort
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
