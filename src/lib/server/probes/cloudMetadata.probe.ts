// src/lib/server/probes/cloudMetadata.probe.ts
import type { DiagnosticProbe } from '../types';

export const cloudMetadataProbe: DiagnosticProbe<'cloudMetadata'> = {
	type: 'cloudMetadata',
	async run({ request }) {
		const headers = request.headers;
		const env =
			typeof process !== 'undefined' ? process.env : ({} as Record<string, string | undefined>);

		let platform = 'Standard V8 / Node.js Runtime';
		let region = 'Local / Unknown';
		const environment =
			env.NODE_ENV || (env.VERCEL_ENV ? `Vercel (${env.VERCEL_ENV})` : 'Development');

		if (env.VERCEL || headers.has('x-vercel-id')) {
			platform = 'Vercel Serverless / Edge Platform';
			region =
				env.VERCEL_REGION || headers.get('x-vercel-id')?.split('::')[0] || 'Auto Edge Region';
		} else if (env.AWS_REGION || env.AWS_EXECUTION_ENV) {
			platform = 'AWS Lambda / Hypervisor';
			region = env.AWS_REGION || 'aws-global';
		} else if (headers.has('cf-ray') || 'WebSocketPair' in globalThis) {
			platform = 'Cloudflare Workers / v8 Isolate';
			region = headers.get('cf-ray')?.split('-')[1] || 'cf-edge';
		} else if ('Deno' in globalThis) {
			platform = 'Deno Deploy Subhosting';
			region = env.DENO_REGION || 'deno-global';
		}

		const nodeVersion =
			typeof process !== 'undefined' && process.version ? process.version : 'Edge V8 Engine';
		const architecture =
			typeof process !== 'undefined' && process.arch
				? `${process.platform} (${process.arch})`
				: 'Isolate WebAssembly sandbox';

		return {
			platform,
			region,
			environment,
			nodeVersion,
			architecture
		};
	}
};
