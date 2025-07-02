import {
	BoltzmannResult,
	type BoltzmannResultJson,
} from "./beans/boltzmann-result.js";
import {
	type BoltzmannOptions,
	type BoltzmannSettings,
	type LinkerOptions,
	createBoltzmannSettings,
} from "./beans/boltzmann-settings.js";
import { TxProcessor } from "./processor/tx-processor.js";
import { CustomMap, Logger } from "./utils/utils.js";

export { TooManyTxosError, TimeoutError } from "./utils/utils.js";

export type {
	BoltzmannOptions,
	LinkerOptions,
	TxosInput,
	BoltzmannResult,
	BoltzmannResultJson,
};

type TxosInput = { inputs: [string, number][]; outputs: [string, number][] };

export class Boltzmann {
	private readonly Logger: Logger;
	private readonly settings: BoltzmannSettings;
	private readonly txProcessor: TxProcessor;

	constructor(options?: BoltzmannOptions) {
		this.settings = createBoltzmannSettings(options);
		this.Logger = Logger(this.settings.logLevel);
		this.txProcessor = new TxProcessor(
			this.settings.maxDuration,
			this.settings.maxTxos,
			this.Logger,
		);
	}

	/**
	 * @param txos
	 * @throws {TooManyTxosError | TimeoutError}
	 */
	public process(txos: TxosInput): BoltzmannResult {
		return this.processWithOptions(
			txos,
			this.settings.maxCjIntrafeesRatio,
			this.settings.linkerOptions,
		);
	}

	/**
	 * @param txos
	 * @param maxCjIntrafeesRatio
	 * @param linkerOptions
	 * @throws {TooManyTxosError | TimeoutError}
	 */
	public processWithOptions(
		txos: TxosInput,
		maxCjIntrafeesRatio: number,
		linkerOptions: LinkerOptions,
	): BoltzmannResult {
		const t1 = Date.now();

		this.Logger.logDebug("SETTINGS: ", JSON.stringify(this.settings));

		const txosObject = {
			inputs: new CustomMap(txos.inputs),
			outputs: new CustomMap(txos.outputs),
		};

		const txProcessorResult = this.txProcessor.processTx(
			txosObject,
			maxCjIntrafeesRatio,
			linkerOptions,
		);

		const duration = (Date.now() - t1) / 1000;
		return new BoltzmannResult(duration, txProcessorResult);
	}
}
