#!/usr/bin/env node
import { Boltzmann, type LinkerOptions } from "@samouraiwallet/boltzmann";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import { fetcher } from "./fetcher/api.js";

const getHostPort = (val: string): { host: string; port: number } => {
	// Regex pattern for IPv4 or hostname, followed by [optional]:port.
	const pattern = /^([\w.-]+):?(\d+)?$/;
	const match = val.match(pattern);

	if (!match) {
		throw new Error("Invalid format. Expected <host>:<port>");
	}

	const [, host, portStr] = match;

	if (!portStr) {
		throw new Error("No port provided.");
	}

	const port = Number(portStr);

	if (Number.isNaN(port)) {
		throw new TypeError("Invalid port number.");
	}

	if (port <= 0 || port > 65535) {
		throw new Error("Port number out of range. Valid range is 1-65535.");
	}

	return { host, port };
};

const apiOptions = ["mempool", "blockstream"] as const;

const linkabilityOptions = [
	"PRECHECK",
	"LINKABILITY",
	"MERGE_FEES",
	"MERGE_INPUTS",
	"MERGE_OUTPUTS",
] as const;

const main = async () => {
	const argv = await yargs(hideBin(process.argv), process.cwd())
		.scriptName("boltzmann")
		.usage("$0 [options]")
		.option("maxDuration", {
			alias: "m",
			describe: "Max duration in seconds",
			default: Number.POSITIVE_INFINITY,
			number: true,
		})
		.option("maxTxos", {
			alias: "x",
			describe: "Max number of txos",
			default: Number.POSITIVE_INFINITY,
			number: true,
		})
		.option("intraFees", {
			alias: "i",
			describe: "Max infrafees ratio",
			number: true,
			default: 0.005,
		})
		.option("linkerOpts", {
			alias: "l",
			describe: "Linker options",
			array: true,
			choices: linkabilityOptions,
		})
		.option("txId", {
			alias: "t",
			describe: "Transaction ID",
			string: true,
			demandOption: true,
		})
		.option("api", {
			alias: "a",
			describe: "Source API",
			choices: apiOptions,
			demandOption: true,
		})
		.option("socks", {
			alias: "s",
			describe:
				"Connection string to socks proxy. Must be of the form <host>:<port>",
			string: true,
			coerce: getHostPort,
		})
		.option("debug", {
			describe: "Enable debug mode",
			boolean: true,
		})
		.help()
		.parse();

	// coerce doesn't work with array, so we need to manually parse the linker options
	// https://github.com/yargs/yargs/issues/1379
	const linkerOptions: LinkerOptions | undefined = argv.linkerOpts
		? {
				precheck: argv.linkerOpts.includes("PRECHECK"),
				linkability: argv.linkerOpts.includes("LINKABILITY"),
				mergeInputs: argv.linkerOpts.includes("MERGE_INPUTS"),
				mergeOutputs: argv.linkerOpts.includes("MERGE_OUTPUTS"),
				mergeFees: argv.linkerOpts.includes("MERGE_FEES"),
			}
		: undefined;

	const boltzmann = new Boltzmann({
		maxDuration: argv.maxDuration,
		maxTxos: argv.maxTxos,
		maxCjIntrafeesRatio: argv.intraFees,
		linkerOptions: linkerOptions,
		logLevel: argv.debug ? "DEBUG" : "INFO",
	});

	const txos = await fetcher(argv.txId, argv.api, argv.socks);

	return boltzmann.process(txos).print();
};

main();
