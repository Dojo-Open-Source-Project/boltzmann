import { TxosAggregator } from "../aggregator/txos-aggregator.js";
import { type LinkerOptions, LogLevel } from "../beans/boltzmann-settings.js";
import { TxProcessorConst } from "../processor/tx-processor-const.js";
import {
	type Pack,
	PackType,
	type Txos,
	type TxosAggregates,
	type TxosAggregatesData,
	type TxosAggregatesMatches,
	type UnpackLinkMatrixResult,
} from "../utils/interfaces.js";
import { ListsUtils } from "../utils/lists-utils.js";
import { CustomMap, type Logger, Utils } from "../utils/utils.js";
import type { IntraFees } from "./intra-fees.js";
import { TxosLinkerResult } from "./txos-linker-result.js";

/** Compute the entropy and the inputs/outputs linkability of a of Bitcoin transaction. */
export class TxosLinker {
	// Default maximum duration in seconds
	private static MAX_DURATION = 180;

	// Max number of inputs (or outputs) which can be processed by this algorithm
	private static MAX_NB_TXOS = 12;

	// Markers
	private static MARKER_FEES = "FEES";
	private static MARKER_PACK = "PACK_I";

	// fees associated to the transaction
	private readonly feesOrig: number;
	private fees: number | undefined;

	private packs: Pack[] = [];

	// max number of txos. Txs with more than max_txos inputs or outputs are not processed.
	maxTxos: number;

	// Maximum duration of the script (in seconds)
	maxDuration = TxosLinker.MAX_DURATION;

	private readonly Logger: Logger;

	/**
	 * Constructor.
	 *
	 * @param fees amount of fees associated to the transaction
	 * @param maxDuration max duration allocated to processing of a single tx (in seconds)
	 * @param maxTxos max number of txos. Txs with more than max_txos inputs or outputs are not
	 *     processed.
	 * @param logger
	 */
	constructor(
		fees: number,
		maxDuration: number,
		maxTxos: number,
		logger: Logger,
	) {
		this.feesOrig = fees;
		this.maxDuration = maxDuration;
		this.maxTxos = maxTxos;
		this.Logger = logger;
	}

	/**
	 * Computes the linkability between a set of input txos and a set of output txos.
	 *
	 * @param txos list of inputs/ouputs txos [(v1_id, v1_amount), ...]
	 * @param linkedTxos list of sets storing linked input txos. Each txo is identified by its id
	 * @param options actions to be applied
	 * @param intraFees tuple (fees_maker, fees_taker) of max "fees" paid among participants used for
	 *     joinmarket transactions fees_maker are potential max "fees" received by a participant from
	 *     another participant fees_taker are potential max "fees" paid by a participant to all others
	 *     participants
	 * @return
	 */
	public process(
		txos: Txos,
		linkedTxos: Set<string>[],
		options: LinkerOptions,
		intraFees: IntraFees,
	): TxosLinkerResult {
		// Packs txos known as being controlled by a same entity
		// It decreases the entropy and speeds-up computations
		if (linkedTxos != null && linkedTxos.length > 0) {
			txos = this.packLinkedTxos(linkedTxos, txos);
		}

		// Manages fees
		if (options.mergeFees && this.feesOrig > 0) {
			// Manages fees as an additional output (case of sharedsend by blockchain.info).
			// Allows to reduce the volume of computations to be done.
			this.fees = 0;
			txos.outputs.set(TxosLinker.MARKER_FEES, this.feesOrig);
		} else {
			this.fees = this.feesOrig;
		}

		const aggregator = new TxosAggregator(this.Logger);

		const nbOuts = txos.outputs.size;
		const nbIns = txos.inputs.size;
		const hasIntraFees = intraFees?.hasFees ?? false;

		// Checks deterministic links
		let nbCmbn = 0;
		let matLnk = ListsUtils.newIntMatrix(nbOuts, nbIns, 0);

		// Prepares the data
		let allAgg: TxosAggregates = this.prepareData(txos);
		txos = { inputs: allAgg.inAgg.txos, outputs: allAgg.outAgg.txos };
		let aggMatches: TxosAggregatesMatches = aggregator.matchAggByVal(
			allAgg,
			this.fees,
			intraFees,
		);

		let dtrmLnks = new Set<number[]>();
		if (options.precheck && this.checkLimitOk(txos) && !hasIntraFees) {
			if (this.Logger.logLevel === LogLevel.DEBUG) {
				Utils.logMemory(this.Logger, "# PRECHECK");
			}

			// Checks deterministic links
			dtrmLnks = aggregator.checkDtrmLinks(txos, allAgg, aggMatches);

			// If deterministic links have been found, fills the linkability matrix
			// (returned as result if linkability is not processed)
			if (dtrmLnks.size > 0) {
				for (const dtrmLnk of dtrmLnks) {
					matLnk[dtrmLnk[0]][dtrmLnk[1]] = 1;
				}
			}
		}

		// Checks if all inputs and outputs have already been merged
		if (nbIns === 0 || nbOuts === 0) {
			nbCmbn = 1;
			for (const line of matLnk) {
				ListsUtils.fill(line, 1, line.length);
			}
		} else if (options.linkability && this.checkLimitOk(txos)) {
			if (this.Logger.logLevel === LogLevel.DEBUG) {
				Utils.logMemory(this.Logger, "# LINKABILITY");
			}

			// Packs deterministic links if needed
			if (dtrmLnks.size > 0) {
				Utils.logMemory(
					this.Logger,
					`PACK·${dtrmLnks.size}·deterministic·links`,
				);
				const txosFinal = txos;
				const dtrmCoordsList: Set<string>[] = [];
				for (const array of dtrmLnks) {
					const set = new Set<string>();
					set.add(String([...txosFinal.outputs.keys()][array[0]]));
					set.add(String([...txosFinal.inputs.keys()][array[1]]));
					dtrmCoordsList.push(set);
				}
				txos = this.packLinkedTxos(dtrmCoordsList, txos);

				// txos changed, recompute allAgg
				allAgg = this.prepareData(txos);
				txos = { inputs: allAgg.inAgg.txos, outputs: allAgg.outAgg.txos };
				aggMatches = aggregator.matchAggByVal(allAgg, this.fees, intraFees);
			}

			// Computes a matrix storing a tree composed of valid pairs of input aggregates
			const matInAggCmbn = aggregator.computeInAggCmbn(aggMatches);

			// Builds the linkability matrix
			const result = aggregator.computeLinkMatrix(
				txos,
				allAgg,
				aggMatches,
				matInAggCmbn,
				this.maxDuration,
			);
			nbCmbn = result.nbCmbn;
			matLnk = result.matLnkCombinations!;

			// Refresh deterministical links
			dtrmLnks = aggregator.findDtrmLinks(matLnk, nbCmbn);
		}

		if (this.packs.length > 0) {
			if (this.Logger.logLevel === LogLevel.DEBUG) {
				Utils.logMemory(this.Logger, `#·UNPACK·${this.packs.length}·packs`);
			}

			// Unpacks the matrix
			const unpackResult = this.unpackLinkMatrix(matLnk, txos);
			txos = unpackResult.txos;
			matLnk = unpackResult.matLnk;

			// Refresh deterministical links
			dtrmLnks = aggregator.findDtrmLinks(matLnk, nbCmbn);
		}

		return new TxosLinkerResult(nbCmbn, matLnk, dtrmLnks, txos);
	}

	/**
	 * Packs input txos which are known as being controlled by a same entity
	 *
	 * @return Txos
	 */
	protected packLinkedTxos(linkedTxos: Set<string>[], txos: Txos): Txos {
		let idx = this.packs.length;

		const packedTxos = {
			inputs: new CustomMap([...txos.inputs.entries()]),
			outputs: new CustomMap([...txos.outputs.entries()]),
		} satisfies Txos;

		// Merges packs sharing common elements
		// Assuming ListsUtils.mergeSets exists and is a method that merges an array of sets
		const newPacks = ListsUtils.mergeSets(linkedTxos);

		for (const pack of newPacks) {
			const ins: [string, number][] = [];
			let valIns = 0;

			for (const inPack of pack) {
				if (inPack.startsWith(TxProcessorConst.MARKER_INPUT)) {
					const inPackValue = packedTxos.inputs.get(inPack)!;
					ins.push([inPack, inPackValue]);
					valIns += inPackValue;
					packedTxos.inputs.delete(inPack);
				}
			}

			idx++;

			if (ins.length > 0) {
				const lbl = `${TxosLinker.MARKER_PACK}${idx}`;
				packedTxos.inputs.set(lbl, valIns);
				this.packs.push({ lbl, packType: PackType.INPUTS, ins, outs: [] }); // Check the Pack constructor in your actual code.
			}
		}

		// Inferred type of object to be returned
		return packedTxos;
	}

	/**
	 * Unpacks linked txos in the linkability matrix.
	 *
	 * @param matLnk linkability matrix to be unpacked
	 * @param txos packed txos containing the pack
	 * @return UnpackLinkMatrixResult
	 */
	protected unpackLinkMatrix(
		matLnk: number[][],
		txos: Txos,
	): UnpackLinkMatrixResult {
		let matRes: number[][] = [...matLnk]; // copies array
		let newTxos: Txos = {
			inputs: new CustomMap([...txos.inputs.entries()]),
			outputs: new CustomMap([...txos.outputs.entries()]),
		};

		const reversedPacks: Pack[] = [...this.packs].reverse();

		for (let i = this.packs.length - 1; i >= 0; i--) {
			const pack: Pack = this.packs[i];
			const result: UnpackLinkMatrixResult = this.unpackLinkMatrix2(
				matRes,
				newTxos,
				pack,
			);
			matRes = result.matLnk;
			newTxos = result.txos;
		}
		return { txos: newTxos, matLnk: matRes };
	}

	/**
	 * Unpacks txos in the linkability matrix for one pack.
	 *
	 * @param matLnk linkability matrix to be unpacked
	 * @param txos packed txos containing the pack
	 * @param pack pack to unpack
	 * @return UnpackLinkMatrixResult
	 */
	protected unpackLinkMatrix2(
		matLnk: number[][],
		txos: Txos,
		pack: Pack,
	): UnpackLinkMatrixResult {
		let newMatLnk: number[][] = [];
		let newTxos: Txos = txos;

		if (matLnk.length > 0) {
			if (pack.packType === PackType.INPUTS) {
				// unpack txos
				const newInputs = new CustomMap<string, number>([...txos.inputs]);
				const idx: number = this.unpackTxos(txos.inputs, pack, newInputs);
				newTxos = {
					inputs: new CustomMap([...newInputs]),
					outputs: new CustomMap([...txos.outputs]),
				};

				// unpack matLnk
				const nbIns: number = txos.inputs.size + pack.ins.length - 1;
				const nbOuts: number = txos.outputs.size;
				const newMatLnkFinal: number[][] = Array.from(
					{ length: nbOuts },
					() => [],
				);

				for (let i = 0; i < nbOuts; i++) {
					const line: number[] = Array.from<number>({ length: nbIns }).fill(0);
					for (let j = 0; j < nbIns; j++) {
						if (j < idx) {
							// keep values before pack
							line[j] = matLnk[i][j];
						} else if (j >= idx + pack.ins.length) {
							// keep values after pack
							line[j] = matLnk[i][j - pack.ins.length + 1];
						} else {
							// insert values for unpacked txos
							line[j] = matLnk[i][idx];
						}
					}
					newMatLnkFinal[i] = line;
				}
				newMatLnk = newMatLnkFinal;
			}
		}

		return { txos: newTxos, matLnk: newMatLnk };
	}

	/**
	 * Unpack txos for one pack.
	 *
	 * @param currentTxos packed txos containing the pack
	 * @param unpackedTxos map to return unpacked txos
	 * @param pack pack to unpack
	 * @return idx pack indice in txos
	 */
	protected unpackTxos(
		currentTxos: CustomMap<string, number>,
		pack: Pack,
		unpackedTxos: CustomMap<string, number>,
	): number {
		const txoKeys: string[] = [...currentTxos.keys()];
		let idx: number;
		for (idx = 0; idx < txoKeys.length; idx++) {
			if (pack.lbl === txoKeys[idx]) {
				break;
			}
		}

		unpackedTxos.clear();
		const keysIterator: IterableIterator<string> = currentTxos.keys();

		// keep txos before pack
		for (let i = 0; i < idx; i++) {
			const key: string = keysIterator.next().value;
			unpackedTxos.set(key, currentTxos.get(key)!);
		}

		// insert packed txos
		for (const [key, val] of pack.ins) {
			unpackedTxos.set(key, val);
		}

		keysIterator.next(); // skip packed txo

		// keep txos after pack
		let next = keysIterator.next();
		while (!next.done) {
			unpackedTxos.set(next.value, currentTxos.get(next.value)!);
			next = keysIterator.next();
		}

		return idx;
	}

	/** Computes several data structures which will be used later */
	private prepareData(txos: Txos): TxosAggregates {
		const allInAgg: TxosAggregatesData = this.prepareTxos(txos.inputs);
		const allOutAgg: TxosAggregatesData = this.prepareTxos(txos.outputs);
		return { inAgg: allInAgg, outAgg: allOutAgg };
	}

	/**
	 * Computes several data structures related to a list of txos
	 *
	 * @param initialTxos list of txos (list of tuples (id, value))
	 * @return list of txos sorted by decreasing values array of aggregates (combinations of txos) in
	 *     binary format array of values associated to the aggregates
	 */
	private prepareTxos(initialTxos: Map<string, number>): TxosAggregatesData {
		const txos = new CustomMap<string, number>();

		// Sorts the map by values in decreasing order.
		const sortedEntries: [string, number][] = [...initialTxos.entries()].sort(
			(a, b) => b[1] - a[1],
		);

		for (const [key, value] of sortedEntries) {
			if (value > 0) {
				txos.set(key, value);
			}
		}

		const allVal: number[] = [...txos.values()];
		const allIndexes: number[] = Array.from({ length: txos.size }, (_, i) => i);

		const nbAggregates: number = 2 ** allIndexes.length;

		// Below line is converted from `ObjectBigList<long[]> allAggIndexes = ListsUtils.powerSet(allIndexes.toArray(new Long[] {}));`
		// because there's nothing comparable in JavaScript. It implies the need to convert `powerSet` method as well.
		const allAggIndexes: number[][] = ListsUtils.powerSet(
			allIndexes,
			this.Logger,
		);

		const allAggVal: number[] = [];
		const PROGRESS_ID = "prepareTxos";
		for (const array of allAggIndexes) {
			allAggVal.push(array.reduce((acc, val) => acc + allVal[val], 0));
			Utils.logProgress(
				this.Logger,
				PROGRESS_ID,
				allAggVal.length,
				nbAggregates,
			);
		}

		Utils.logProgressDone(this.Logger, PROGRESS_ID, nbAggregates);
		return { txos, allAggIndexes, allAggVal } satisfies TxosAggregatesData;
	}

	// LIMITS
	private checkLimitOk(txos: Txos): boolean {
		const lenIn: number = txos.inputs.size;
		const lenOut: number = txos.outputs.size;
		const maxCard: number = Math.max(lenIn, lenOut);
		if (this.maxTxos !== null && maxCard > this.maxTxos) {
			this.Logger.logInfo("maxTxos limit reached!");
			return false;
		}
		return true;
	}
}
