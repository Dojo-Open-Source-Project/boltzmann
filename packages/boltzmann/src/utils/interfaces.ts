import type { CustomMap } from "./utils.js";

export interface TxosAggregatesData {
	readonly txos: CustomMap<string, number>;
	readonly allAggIndexes: number[][]; // each entry value contains array of txos indexes for corresponding allAggVal[entry.key]
	readonly allAggVal: number[];
}

export interface TxosAggregates {
	readonly inAgg: TxosAggregatesData;
	readonly outAgg: TxosAggregatesData;
}

export interface TxosAggregatesMatches {
	readonly allMatchInAgg: number[];
	readonly matchInAggToVal: Map<number, number>;
	readonly valToMatchOutAgg: Map<number, number[]>;
}

export interface Txos {
	readonly inputs: CustomMap<string, number>;
	readonly outputs: CustomMap<string, number>;
}

export enum PackType {
	INPUTS = 0,
}

type IEntry = [string, number];

export interface Pack {
	readonly lbl: string;
	readonly packType: PackType;
	readonly ins: IEntry[];
	readonly outs: string[];
}

export interface UnpackLinkMatrixResult {
	readonly txos: Txos;
	readonly matLnk: number[][];
}

export interface CoinjoinPattern {
	readonly nbPtcpts: number;
	readonly cjAmount: number;
}

export interface FilteredTxos {
	readonly txos: CustomMap<string, number>;
	readonly mapIdAddr: Map<string, string>;
}

export interface NbTxos {
	readonly nbIns: number;
	readonly nbOuts: number;
}
