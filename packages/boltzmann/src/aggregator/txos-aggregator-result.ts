export class TxosAggregatorResult {
	readonly nbCmbn: number;
	readonly matLnkCombinations: number[][] | null;

	constructor(nbCmbn: number, matLnk: number[][] | null) {
		this.nbCmbn = nbCmbn;
		this.matLnkCombinations = matLnk;
	}

	computeMatLnkProbabilities(): number[][] | null {
		if (this.matLnkCombinations == null) return null;

		const matLnkProbabilities = Array.from<number[]>({
			length: this.matLnkCombinations.length,
		});
		if (this.nbCmbn > 0) {
			for (let i = 0; i < this.matLnkCombinations.length; i++) {
				const line = this.matLnkCombinations[i];
				const values = Array.from<number>({ length: line.length });
				for (const [j, val] of line.entries()) {
					values[j] = val / this.nbCmbn;
				}
				matLnkProbabilities[i] = values;
			}
		} else {
			// TODO ???
			/*for (let i = 0; i < this.matLnkCombinations.length; i++) {
        const line = new Array<number>(0);
        matLnkProbabilities[i] = line;
      }*/
			console.error("nbCmbn=0");
		}
		return matLnkProbabilities;
	}

	computeEntropy(): number {
		let entropy = 0;
		if (this.nbCmbn > 0) {
			entropy = Math.log2(this.nbCmbn);
		}
		return entropy;
	}
}
