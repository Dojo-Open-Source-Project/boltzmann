import { TxProcessorResult } from "../processor/tx-processor-result.js";
import { Utils } from "../utils/utils.js";

import type { Txos } from "../utils/interfaces.js";

export class BoltzmannResult extends TxProcessorResult {
	readonly dtrmLnks: string[][];
	readonly duration: number;

	constructor(duration: number, r: TxProcessorResult) {
		super(
			r.nbCmbn,
			r.matLnkCombinations,
			r.matLnkProbabilities,
			r.entropy,
			r.dtrmLnksById,
			r.txos,
			r.fees,
			r.intraFees,
			r.efficiency,
			r.nbCmbnPrfctCj,
			r.nbTxosPrfctCj,
		);
		this.dtrmLnks =
			r.dtrmLnksById == null
				? [[""]]
				: this.replaceDtrmLinks(r.dtrmLnksById, r.txos);
		this.duration = duration;
	}

	private replaceDtrmLinks(dtrmLinks: Set<number[]>, txos: Txos): string[][] {
		const result: string[][] = Array.from<string[]>({
			length: dtrmLinks.size,
		}).fill([]);

		const outs: string[] = [...txos.outputs.keys()];
		const ins: string[] = [...txos.inputs.keys()];

		let i = 0;
		for (const dtrmLink of dtrmLinks) {
			const out = outs[dtrmLink[0]];
			const n = ins[dtrmLink[1]];
			result[i] = [out, n];
			i++;
		}

		return result;
	}

	public toJSON() {
		return {
			nbCmbn: this.nbCmbn,
			matLnkCombinations: this.matLnkCombinations,
			matLnkProbabilities: this.matLnkProbabilities,
			entropy: this.entropy,
			dtrmLnksById: [...this.dtrmLnksById.values()] as [number, number][],
			dtrmLnks: this.dtrmLnks as [string, string][],
			txos: {
				inputs: [...this.txos.inputs.entries()],
				outputs: [...this.txos.outputs.entries()],
			},
			fees: this.fees,
			intraFees: {
				feesMaker: this.intraFees.feesMaker,
				feesTaker: this.intraFees.feesTaker,
				hasFees: this.intraFees.hasFees,
			},
			efficiency: this.efficiency,
			nbCmbnPrfctCj: this.nbCmbnPrfctCj?.toString() ?? null,
			nbTxosPrfctCj: this.nbTxosPrfctCj,
		};
	}

	public print(): void {
		console.log(`Inputs = ${JSON.stringify([...this.txos.inputs.entries()])}`);
		console.log(
			`Outputs = ${JSON.stringify([...this.txos.outputs.entries()])}`,
		);
		console.log(`Fees = ${this.fees} satoshis`);

		if (
			this.intraFees != null &&
			this.intraFees.feesMaker > 0 &&
			this.intraFees.feesTaker > 0
		) {
			console.log(
				`Hypothesis: Max intrafees received by a participant = ${this.intraFees.feesMaker} satoshis`,
			);
			console.log(
				`Hypothesis: Max intrafees paid by a participant = ${this.intraFees.feesTaker} satoshis`,
			);
		}

		if (this.nbCmbnPrfctCj != null) {
			console.log(
				`Perfect coinjoin = ${this.nbCmbnPrfctCj} combinations (for ${this.nbTxosPrfctCj.nbIns}x${this.nbTxosPrfctCj.nbOuts})`,
			);
		}
		console.log(`Nb combinations = ${this.nbCmbn}`);

		if (this.entropy != null) {
			console.log(`Tx entropy = ${this.entropy} bits`);
			console.log(`Entropy density = ${this.density}`);
		}

		if (this.efficiency != null) {
			console.log(
				`Wallet efficiency = ${(this.efficiency ?? 0) * 100}% (${Math.log2(this.efficiency ?? 0)} bits)`,
			);
		}

		if (this.matLnkCombinations == null) {
			if (this.nbCmbn === 0) {
				console.log(
					"Skipped processing of this transaction (too many inputs and/or outputs)",
				);
			}
		} else {
			if (this.matLnkProbabilities != null) {
				console.log("Linkability Matrix (probabilities):");
				console.log(JSON.stringify(this.matLnkProbabilities));
			}
			if (this.matLnkCombinations != null) {
				console.log("Linkability Matrix (#combinations with link):");
				console.log(JSON.stringify(this.matLnkCombinations));
			}
		}

		if (this.dtrmLnks == null) {
			console.log("Deterministic links: all");
		} else if (this.dtrmLnks.length > 0) {
			console.log("Deterministic links:");
			for (const dtrmLink of this.dtrmLnks) {
				const output = dtrmLink[0];
				const input = dtrmLink[1];
				console.log(`${input} & ${output} are deterministically linked`);
			}
		} else {
			console.log("Deterministic links: none");
		}

		console.log("Benchmarks:");

		// biome-ignore lint/suspicious/noExplicitAny:
		const benchmarks: any[] = [];

		benchmarks.push(["duration", this.duration]);
		console.log(`Duration = ${Utils.duration(this.duration)}`);

		const maxMem = Utils.getMaxMemUsed();
		benchmarks.push(["maxMem", maxMem]);
		console.log(`Max mem used: ${maxMem}M`);

		for (const progress of Utils.getProgressResult()) {
			console.log(progress.getResult());
			benchmarks.push([
				progress.name,
				progress.target,
				progress.computeElapsed() / 1000,
				progress.rate,
				progress.msg,
			]);
		}

		// biome-ignore lint/suspicious/noExplicitAny:
		const exportObj: any = {};
		exportObj.ins = [...this.txos.inputs.entries()];
		exportObj.outs = [...this.txos.outputs.entries()];
		exportObj.nbCmbn = this.nbCmbn;
		exportObj.mat =
			this.matLnkCombinations == null
				? null
				: JSON.stringify(this.matLnkCombinations);

		exportObj.benchmarks = benchmarks;

		try {
			const exportStr = JSON.stringify(exportObj);
			console.log(`Export: ${exportStr}`);
		} catch (error) {
			console.error(error);
		}
	}
}
