import type { IntraFees } from "../linker/intra-fees.js";
import { TxosLinkerResult } from "../linker/txos-linker-result.js";
import type { NbTxos, Txos } from "../utils/interfaces.js";

export class TxProcessorResult extends TxosLinkerResult {
	readonly matLnkProbabilities: number[][] | null;
	readonly entropy: number;
	readonly fees: number;
	readonly intraFees: IntraFees;
	readonly efficiency: number | null;
	readonly nbCmbnPrfctCj: bigint | null;
	readonly nbTxosPrfctCj: NbTxos;

	constructor(
		nbCmbn: number,
		matLnkCombinations: number[][] | null,
		matLnkProbabilities: number[][] | null,
		entropy: number,
		dtrmLnksById: Set<Array<number>>,
		txos: Txos,
		fees: number,
		intraFees: IntraFees,
		efficiency: number | null,
		nbCmbnPrfctCj: bigint | null,
		nbTxosPrfctCj: NbTxos,
	) {
		super(nbCmbn, matLnkCombinations, dtrmLnksById, txos);
		this.matLnkProbabilities = matLnkProbabilities;
		this.entropy = entropy;
		this.fees = fees;
		this.intraFees = intraFees;
		this.efficiency = efficiency;
		this.nbCmbnPrfctCj = nbCmbnPrfctCj;
		this.nbTxosPrfctCj = nbTxosPrfctCj;
	}

	get nbLinks(): number {
		return this.txos.inputs.size * this.txos.outputs.size;
	}

	get density(): number {
		return this.entropy / (this.txos.inputs.size + this.txos.outputs.size);
	}

	get nbDL(): number {
		return this.dtrmLnksById.size;
	}

	get ratioDL(): number {
		return this.nbDL / this.nbLinks;
	}

	get nRatioDL(): number {
		return 1 - this.ratioDL;
	}
}
