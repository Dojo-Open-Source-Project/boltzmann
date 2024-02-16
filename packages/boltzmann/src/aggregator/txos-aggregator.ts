import type { IntraFees } from "../linker/intra-fees.js";
import type {
	Txos,
	TxosAggregates,
	TxosAggregatesMatches,
} from "../utils/interfaces.js";
import { type Logger, Utils } from "../utils/utils.js";
import { TxosAggregatorResult } from "./txos-aggregator-result.js";

class ComputeLinkMatrixTask {
	idxIl: number;
	readonly il: number;
	readonly ir: number;
	readonly dOut: Map<number, Map<number, number[]>>;

	constructor(
		idxIl: number,
		il: number,
		ir: number,
		dOut: Map<number, Map<number, number[]>>,
	) {
		this.idxIl = idxIl;
		this.il = il;
		this.ir = ir;
		this.dOut = dOut;
	}
}

export class TxosAggregator {
	private readonly Logger: Logger;

	constructor(logger: Logger) {
		this.Logger = logger;
	}
	/**
	 * Matches input/output aggregates by values and returns a bunch of data structs
	 *
	 * @param allAgg
	 * @param fees
	 * @param intraFees
	 * @return
	 */
	public matchAggByVal(
		allAgg: TxosAggregates,
		fees: number,
		intraFees: IntraFees,
	): TxosAggregatesMatches {
		const allInAggVal: number[] = allAgg.inAgg.allAggVal;
		const allOutAggVal: number[] = allAgg.outAgg.allAggVal;

		const allUniqueInAggVal: number[] = [...new Set(allInAggVal)].sort(
			(a, b) => a - b,
		);
		const allUniqueOutAggVal: number[] = [...new Set(allOutAggVal)].sort(
			(a, b) => a - b,
		);

		const allMatchInAgg: number[] = [];
		const matchInAggToVal: Map<number, number> = new Map<number, number>();
		const valToMatchOutAgg: Map<number, number[]> = new Map<number, number[]>();

		const hasIntraFees: boolean = intraFees?.hasFees ?? false;
		const feesTaker: number = hasIntraFees ? fees + intraFees.feesTaker : 0;
		const feesMaker: number = hasIntraFees ? -intraFees.feesMaker : 0;

		const PROGRESS_ID = "matchAggByVal";

		for (let i = 0; i < allUniqueInAggVal.length; i++) {
			const inAggVal: number = allUniqueInAggVal[i];

			Utils.logProgress(this.Logger, PROGRESS_ID, i, allUniqueInAggVal.length);

			for (const outAggVal of allUniqueOutAggVal) {
				const diff: number = inAggVal - outAggVal;

				if (!hasIntraFees && diff < 0) {
					break;
				} else {
					const condNoIntrafees: boolean = !hasIntraFees && diff <= fees;
					const condIntraFees: boolean =
						hasIntraFees &&
						((diff <= 0 && diff >= feesMaker) ||
							(diff >= 0 && diff <= feesTaker));

					if (condNoIntrafees || condIntraFees) {
						for (const [inIdx, element] of allInAggVal.entries()) {
							if (element === inAggVal && !allMatchInAgg.includes(inIdx)) {
								allMatchInAgg.push(inIdx);
								matchInAggToVal.set(inIdx, inAggVal);
							}
						}

						if (!valToMatchOutAgg.has(inAggVal)) {
							valToMatchOutAgg.set(inAggVal, [] as number[]);
						}
						const keysMatchOutAgg: number[] = valToMatchOutAgg.get(inAggVal)!;

						for (const [idx, element] of allOutAggVal.entries()) {
							if (element === outAggVal) {
								keysMatchOutAgg.push(idx);
							}
						}
					}
				}
			}
		}

		Utils.logProgressDone(this.Logger, PROGRESS_ID, allUniqueInAggVal.length);
		return {
			allMatchInAgg,
			matchInAggToVal,
			valToMatchOutAgg,
		} satisfies TxosAggregatesMatches;
	}

	/**
	 * Computes a matrix of valid combinations (pairs) of input aggregates Returns a dictionary
	 * (parent_agg => (child_agg1, child_agg2)) We have a valid combination (agg1, agg2) if: R1/
	 * child_agg1 & child_agg2 = 0 (no bitwise overlap) R2/ child_agg1 > child_agg2 (matrix is
	 * symmetric)
	 */
	public computeInAggCmbn(
		aggMatches: TxosAggregatesMatches,
	): Map<number, number[][]> {
		const aggs: number[] = [...aggMatches.allMatchInAgg];
		aggs.shift();

		const mat: Map<number, number[][]> = new Map<number, number[][]>();
		if (aggs.length > 0) {
			const tgt: number = aggs.pop() || 0;

			const PROGRESS_ID = "computeInAggCmbn";

			for (let i = 0; i <= tgt; i++) {
				if (aggs.includes(i)) {
					const jMax: number = Math.min(i, tgt - i + 1);

					for (let j = 0; j < jMax; j++) {
						if ((i & j) === 0 && aggs.includes(j)) {
							const aggChilds: number[][] = this.createLine(mat, i + j);
							aggChilds.push([i, j]);
						}
					}
				}
				Utils.logProgress(
					this.Logger,
					PROGRESS_ID,
					i,
					tgt,
					`${mat.size} matches`,
				);
			}
			Utils.logProgressDone(
				this.Logger,
				PROGRESS_ID,
				tgt,
				`${mat.size} matches`,
			);
		}
		return mat;
	}

	private createLine(mat: Map<number, number[][]>, i: number): number[][] {
		let line = mat.get(i);
		if (!line) {
			line = [];
			mat.set(i, line);
		}
		return line;
	}

	/**
	 * Checks the existence of deterministic links between inputs and outputs
	 *
	 * @return list of deterministic links as tuples (idx_output, idx_input)
	 */
	public checkDtrmLinks(
		txos: Txos,
		allAgg: TxosAggregates,
		aggMatches: TxosAggregatesMatches,
	): Set<number[]> {
		const nbIns: number = txos.inputs.size;
		const nbOuts: number = txos.outputs.size;

		const matCmbn: number[][] = Array.from(new Array(nbOuts), () =>
			new Array(nbIns).fill(0),
		);
		const inCmbn: number[] = Array.from<number>({ length: nbIns }).fill(0);

		for (const inEntry of aggMatches.matchInAggToVal.entries()) {
			const inIdx: number = inEntry[0];
			const val: number = inEntry[1];
			const outIdxArr: number[] = aggMatches.valToMatchOutAgg.get(val)!;

			for (const outIdx of outIdxArr) {
				this.updateLinkCmbn(matCmbn, inIdx, outIdx, allAgg);

				const inIndexes: number[] = allAgg.inAgg.allAggIndexes[inIdx];
				for (const inIndex of inIndexes) {
					const currentValue: number = inCmbn[inIndex];
					inCmbn[inIndex] = currentValue + 1;
				}
			}
		}

		const nbCmbn: number = inCmbn[0];
		return this.findDtrmLinks(matCmbn, nbCmbn);
	}

	/**
	 * Computes the linkability matrix Returns the number of possible combinations and the links
	 * matrix Implements a depth-first traversal of the inputs combinations tree (right to left) For
	 * each input combination we compute the matching output combinations. This is a basic brute-force
	 * solution. Will have to find a better method later.
	 *
	 */
	public computeLinkMatrix(
		txos: Txos,
		allAgg: TxosAggregates,
		aggMatches: TxosAggregatesMatches,
		matInAggCmbn: Map<number, number[][]>,
		maxDuration: number,
	): TxosAggregatorResult {
		let nbTxCmbn = 0;
		const itGt: number = 2 ** txos.inputs.size - 1;
		const otGt: number = 2 ** txos.outputs.size - 1;

		const dLinks = new Map<number, Map<number, number>>();
		const dOutInitial = new Map<number, Map<number, number[]>>();
		const dOutEntry = new Map<number, number[]>();
		dOutEntry.set(0, [1, 0]);
		dOutInitial.set(otGt, dOutEntry);

		const stack: Array<ComputeLinkMatrixTask> = [];

		const rootTask = new ComputeLinkMatrixTask(0, 0, itGt, dOutInitial);
		stack.push(rootTask);
		const rootIrcs = matInAggCmbn.get(rootTask.ir);
		const rootLenIrcs = rootIrcs ? rootIrcs.length : 0;

		const startTime = Date.now();

		let totalIterations = 0;
		let iterations = 0;
		const PROGRESS_ID = "computeLinkMatrix";
		// Iterates over all valid inputs combinations (top->down)
		while (stack.length > 0) {
			// Checks duration
			const currTime = Date.now();
			const deltaTimeSeconds = (currTime - startTime) / 1000;

			if (maxDuration && deltaTimeSeconds >= maxDuration) {
				this.Logger.logInfo("maxDuration limit reached!");
				return new TxosAggregatorResult(0, []);
			}

			// Gets data from task
			let t = stack.at(-1)!;
			let nIdxIl = t.idxIl;

			// Gets all valid decompositions of right input aggregate
			const ircs: number[][] = matInAggCmbn.get(t.ir)!;
			const lenIrcs: number = ircs ? ircs.length : 0;

			// biome-ignore lint/correctness/noUnreachable:
			for (let i = t.idxIl; i < lenIrcs; i++) {
				iterations++;
				nIdxIl = i;
				// Gets left input sub-aggregate (column from ircs)
				const nIl = ircs[i][1];

				// Checks if we must process this pair (columns from ircs are sorted in decreasing order)
				if (nIl > t.il) {
					// Gets the right input sub-aggregate (row from ircs)
					const nIr = ircs[i][0];

					Utils.logProgress(
						this.Logger,
						PROGRESS_ID,
						rootTask.idxIl,
						rootLenIrcs,
						`${iterations}/${totalIterations}, ${dLinks.size} dlinks`,
					);

					// Run task
					const ndOut = this.runTask(nIl, nIr, aggMatches, otGt, t.dOut);

					// Updates idx_il for the current task
					t.idxIl = i + 1;
					iterations++;

					// Pushes a new task which will decompose the right input aggregate
					stack.push(new ComputeLinkMatrixTask(0, nIl, nIr, ndOut));
					const newIrcs: number[][] | undefined = matInAggCmbn.get(nIr);
					const newLenIrcs: number = newIrcs ? newIrcs.length : 0;
					totalIterations += newLenIrcs;

					// Executes the new task (depth-first)
					break;
				} else {
					// No more results for il, triggers a break and a pop
					nIdxIl = ircs.length;
					break;
				}
			}
			if (nIdxIl > lenIrcs - 1) {
				t = stack.pop()!;
				if (stack.length === 0) {
					nbTxCmbn = t.dOut.get(otGt)!.get(0)![1];
				} else {
					const pt = stack.at(-1)!;
					this.onTaskCompleted(t, pt, dLinks);
				}
			}
		}

		Utils.logProgressDone(
			this.Logger,
			PROGRESS_ID,
			rootLenIrcs,
			`${dLinks.size} dlinks`,
		);
		return this.finalizeLinkMatrix(allAgg, itGt, otGt, dLinks, nbTxCmbn);
	}

	private finalizeLinkMatrix(
		allAgg: TxosAggregates,
		itGt: number,
		otGt: number,
		dLinks: Map<number, Map<number, number>>,
		nbTxCmbn: number,
	): TxosAggregatorResult {
		// clone from this map for better performances
		const linksClear: number[][] = this.newLinkCmbn(allAgg);

		// Fills the matrix
		const links: number[][] = JSON.parse(JSON.stringify(linksClear)); // Deep copy
		this.updateLinkCmbn(links, itGt, otGt, allAgg);
		nbTxCmbn++;

		const linksX: number = links.length;
		const linksY: number = links[0].length;

		// iterate dLinks key0
		const PROGRESS_ID = "finalizeLinkMatrix";
		let i = 0;
		for (const firstKeyEntry of dLinks.entries()) {
			const key0: number = firstKeyEntry[0];

			Utils.logProgress(
				this.Logger,
				PROGRESS_ID,
				i++,
				dLinks.size,
				`Processing dLink... ${firstKeyEntry[1].size} x (${linksX}x${linksY})`,
			);

			// iterate dLinks key1
			for (const secondKeyEntry of firstKeyEntry[1].entries()) {
				const key1: number = secondKeyEntry[0];
				const mult: number = secondKeyEntry[1];

				const linkCmbn: number[][] = JSON.parse(JSON.stringify(linksClear)); // Deep copy
				this.updateLinkCmbn(linkCmbn, key0, key1, allAgg);

				for (let i1 = 0; i1 < linksX; i1++) {
					for (let j = 0; j < linksY; j++) {
						links[i1][j] = links[i1][j] + linkCmbn[i1][j] * mult;
					}
				}
			}

			i++;
		}

		Utils.logProgressDone(this.Logger, PROGRESS_ID, dLinks.size);
		return new TxosAggregatorResult(nbTxCmbn, links);
	}

	private onTaskCompleted(
		t: ComputeLinkMatrixTask,
		pt: ComputeLinkMatrixTask,
		dLinks: Map<number, Map<number, number>>,
	): void {
		const il: number = t.il;
		const ir: number = t.ir;

		for (const doutEntry of t.dOut.entries()) {
			const or: number = doutEntry[0];
			const lOl: Map<number, number[]> = doutEntry[1];
			const rKey: [number, number] = [ir, or];

			for (const olEntry of lOl.entries()) {
				const ol: number = olEntry[0];
				const nbPrnt: number = olEntry[1][0];
				const nbChld: number = olEntry[1][1];

				const lKey: [number, number] = [il, ol];

				// Updates the dictionary of links for the pair of aggregates
				const nbOccur: number = nbChld + 1;
				this.addDLinkLine(rKey, nbPrnt, dLinks);
				this.addDLinkLine(lKey, nbPrnt * nbOccur, dLinks);

				// Updates parent d_out by back-propagating number of child combinations
				const pOr: number = ol + or;
				const plOl: Map<number, number[]> = pt.dOut.get(pOr)!;
				for (const plOlEntry of plOl.entries()) {
					plOlEntry[1][1] += nbOccur;
				}
			}
		}
	}

	private addDLinkLine(
		key: number[],
		addValue: number,
		dLinks: Map<number, Map<number, number>>,
	): void {
		let subMap: Map<number, number> | undefined = dLinks.get(key[0]);
		if (!subMap) {
			subMap = new Map<number, number>();
			dLinks.set(key[0], subMap);
		}

		const currentValue: number = subMap.get(key[1]) || 0;
		subMap.set(key[1], currentValue + addValue);
	}

	private runTask(
		nIl: number,
		nIr: number,
		aggMatches: TxosAggregatesMatches,
		otGt: number,
		dOut: Map<number, Map<number, number[]>>,
	): Map<number, Map<number, number[]>> {
		const ndOut: Map<number, Map<number, number[]>> = new Map<
			number,
			Map<number, number[]>
		>();

		// Iterates over outputs combinations previously found
		for (const oREntry of dOut.entries()) {
			const oR: number = oREntry[0];
			const sol: number = otGt - oR;
			// Computes the number of parent combinations
			let nbPrt = 0;
			for (const value of oREntry[1].values()) {
				nbPrt += value[0];
			}

			// Iterates over output sub-aggregates matching with left input sub-aggregate
			const valIl: number = aggMatches.matchInAggToVal.get(nIl)!;
			for (const nOl of aggMatches.valToMatchOutAgg.get(valIl)!) {
				// Checks compatibility of output sub-aggregate with left part of output combination
				if ((sol & nOl) === 0) {
					// Computes:
					// the sum corresponding to the left part of the output combination
					// the complementary right output sub-aggregate
					const nSol: number = sol + nOl;
					const nOr: number = otGt - nSol;

					// Checks if the right output sub-aggregate is valid
					const valIr: number = aggMatches.matchInAggToVal.get(nIr)!;
					const matchOutAgg: number[] = aggMatches.valToMatchOutAgg.get(valIr)!;

					// Adds this output combination into n_d_out if all conditions met
					if ((nSol & nOr) === 0 && matchOutAgg.includes(nOr)) {
						const ndOutVal: Map<number, number[]> = this.ndOutLine(ndOut, nOr);
						ndOutVal.set(nOl, [nbPrt, 0]);
					}
				}
			}
		}

		return ndOut;
	}

	private ndOutLine(
		ndOut: Map<number, Map<number, number[]>>,
		idx: number,
	): Map<number, number[]> {
		let ndOutVal: Map<number, number[]> | undefined = ndOut.get(idx);
		if (!ndOutVal) {
			ndOutVal = new Map<number, number[]>();
			ndOut.set(idx, ndOutVal);
		}
		return ndOutVal;
	}

	/**
	 * Creates a new linkability matrix.
	 *
	 * @param allAgg
	 */
	private newLinkCmbn(allAgg: TxosAggregates): number[][] {
		let maxOutIndex = 0;
		for (const indexes of allAgg.outAgg.allAggIndexes) {
			const max: number = Math.max(...indexes);
			if (max > maxOutIndex) {
				maxOutIndex = max;
			}
		}

		let maxInIndex = 0;
		for (const indexes of allAgg.inAgg.allAggIndexes) {
			const max: number = Math.max(...indexes);
			if (max > maxInIndex) {
				maxInIndex = max;
			}
		}

		// let matCmbn = ListsUtils.newIntMatrix(maxOutIndex + 1, maxInIndex + 1, 0);
		return Array.from({ length: maxOutIndex + 1 })
			.fill(null)
			.map(() => new Array(maxInIndex + 1).fill(0));
	}

	/**
	 * Updates the linkability matrix for aggregate designated by inAgg/outAgg.
	 *
	 * @param matCmbn linkability matrix
	 * @param inAgg input aggregate
	 * @param outAgg output aggregate
	 * @param allAgg
	 */
	private updateLinkCmbn(
		matCmbn: number[][],
		inAgg: number,
		outAgg: number,
		allAgg: TxosAggregates,
	): number[][] {
		const outIndexes: number[] = allAgg.outAgg.allAggIndexes[outAgg];
		const inIndexes: number[] = allAgg.inAgg.allAggIndexes[inAgg];

		for (const inIndex of inIndexes) {
			for (const outIndex of outIndexes) {
				const value = matCmbn[outIndex][inIndex];
				matCmbn[outIndex][inIndex] = value + 1;
			}
		}

		return matCmbn;
	}

	/**
	 * Builds a list of sets storing inputs having a deterministic link with an output
	 *
	 * @param matCmbn linkability matrix
	 * @param nbCmbn number of combination
	 * @return
	 */
	public findDtrmLinks(matCmbn: number[][], nbCmbn: number): Set<number[]> {
		const dtrmCoords = new Set<number[]>();
		for (const [i, element] of matCmbn.entries()) {
			for (const [j, element_] of element.entries()) {
				if (element_ === nbCmbn) {
					dtrmCoords.add([i, j]);
				}
			}
		}

		return dtrmCoords;
	}
}
