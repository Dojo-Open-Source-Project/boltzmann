import { TxosAggregatorResult } from "../aggregator/txos-aggregator-result.js";

import type { Txos } from "../utils/interfaces.js";

export class TxosLinkerResult extends TxosAggregatorResult {
	readonly dtrmLnksById: Set<number[]>;
	readonly txos: Txos;

	constructor(
		nbCmbn: number,
		matLnk: number[][] | null,
		dtrmLnksById: Set<number[]>,
		txos: Txos,
	) {
		super(nbCmbn, matLnk);
		this.dtrmLnksById = dtrmLnksById;
		this.txos = txos;
	}
}
