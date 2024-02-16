import { request } from "undici";
import { socksDispatcher } from "./fetch-socks.js";

interface Vout {
	scriptpubkey: string;
	scriptpubkey_address?: string;
	value: number;
}

interface ValidResponse {
	vin: {
		prevout: Vout;
	}[];
	vout: Vout[];
}

function isValidResponse(body: unknown): body is ValidResponse {
	return (
		typeof body === "object" &&
		body !== null &&
		"vin" in body &&
		"vout" in body &&
		Array.isArray(body.vin) &&
		Array.isArray(body.vout)
	);
}

const apis = {
	mempool: "https://mempool.space/api",
	blockstream: "https://blockstream.info/api",
} as const;

export const fetcher = async (
	txId: string,
	api: keyof typeof apis,
	socks?: { host: string; port: number },
) => {
	const response = await request(`${apis[api]}/tx/${txId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		dispatcher: socks
			? socksDispatcher({
					type: 5,
					host: socks.host,
					port: socks.port,
				})
			: undefined,
	});

	if (response.statusCode !== 200) {
		throw new Error(`Received invalid status code: ${response.statusCode}`);
	}

	const body = await response.body.json();

	if (!isValidResponse(body)) {
		throw new Error(`Received invalid response: ${JSON.stringify(body)}`);
	}

	const inputs: [string, number][] = body.vin.map((input) => [
		input.prevout.scriptpubkey_address ?? input.prevout.scriptpubkey,
		input.prevout.value,
	]);

	const outputs: [string, number][] = body.vout.map((output) => [
		output.scriptpubkey_address ?? output.scriptpubkey,
		output.value,
	]);

	return { inputs, outputs };
};
