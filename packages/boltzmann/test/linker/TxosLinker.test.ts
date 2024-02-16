import { assert, describe, it } from "vitest";

import { LogLevel } from "../../src/beans/boltzmann-settings.js";
import { TxosLinker } from "../../src/linker/txos-linker.js";
import { type Pack, PackType, type Txos } from "../../src/utils/interfaces.js";
import { CustomMap, Logger } from "../../src/utils/utils.js";

const logger = Logger(LogLevel.NONE);

describe("TxosLinker", () => {
	const txosLinker = new TxosLinker(0, 300, 12, logger);

	describe("testUnpackTxos", () => {
		const processUnpackTxos = (
			currentTxos: CustomMap<string, number>,
			pack: Pack,
			expectedTxos: CustomMap<string, number>,
			expectedPackIdx: number,
		) => {
			const unpackedTxos = new CustomMap<string, number>();
			// @ts-expect-error Necessary call of protected method
			const packIdx: number = txosLinker.unpackTxos(
				currentTxos,
				pack,
				unpackedTxos,
			);
			assert.sameDeepMembers([...unpackedTxos], [...expectedTxos]);
			assert.strictEqual(packIdx, expectedPackIdx);
		};

		describe("onePackAlone", () => {
			const ins = new CustomMap<string, number>();
			ins.set("PACK_I1", 25029376106);

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedIns = new CustomMap<string, number>([
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			]);

			const expectedPackIdx = 0;

			it("properly unpacks utxos", () => {
				processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
			});
		});

		describe("onePackFollowedByOtherInputs", () => {
			const ins = new CustomMap<string, number>([
				["PACK_I1", 25029376106],
				["I4", 123],
				["I5", 456],
			]);

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedIns = new CustomMap<string, number>([
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
				["I4", 123],
				["I5", 456],
			]);

			const expectedPackIdx = 0;

			it("properly unpacks utxos", () => {
				processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
			});
		});

		describe("onePackPreceededByOtherInputs", () => {
			const ins = new CustomMap<string, number>([
				["I4", 123],
				["I5", 456],
				["PACK_I1", 25029376106],
			]);

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedIns = new CustomMap<string, number>([
				["I4", 123],
				["I5", 456],
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			]);

			const expectedPackIdx = 2;

			it("properly unpacks utxos", () => {
				processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
			});
		});

		describe("onePackSurroundedByOtherInputs", () => {
			const ins = new CustomMap<string, number>([
				["I4", 123],
				["I5", 456],
				["PACK_I1", 25029376106],
				["I6", 666],
				["I7", 777],
			]);

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedIns = new CustomMap<string, number>([
				["I4", 123],
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
				["I5", 456],
				["I6", 666],
				["I7", 777],
			]);

			const expectedPackIdx = 2;

			it("properly unpacks utxos", () => {
				processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
			});
		});
	});

	describe("testUnpackLinkMatrix", () => {
		const unpackLinkMatrix = (
			matLnkInt: number[][],
			txos: Txos,
			pack: Pack,
			expectedMatLnk: number[][],
			expectedTxos: Txos,
		) => {
			const matLnk: number[][] = [...matLnkInt];
			// @ts-expect-error Necessary call of protected method
			const result = txosLinker.unpackLinkMatrix2(matLnk, txos, pack);

			assert.deepStrictEqual(result.txos.inputs, expectedTxos.inputs);
			assert.deepStrictEqual(result.txos.outputs, expectedTxos.outputs);
			assert.deepStrictEqual(result.matLnk, expectedMatLnk);
		};

		describe("onePackAlone", () => {
			const txos: Txos = {
				inputs: new CustomMap([["PACK_I1", 25029376106]]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedTxos: Txos = {
				inputs: new CustomMap([
					["I0", 5300000000],
					["I3", 5000000000],
					["I1", 2020000000],
					["I2", 3376106],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const matLnk: number[][] = [[1], [11]];

			const expectedMatLnk: number[][] = [
				[1, 1, 1, 1],
				[11, 11, 11, 11],
			];

			it("properly unpacks link matrix", () => {
				unpackLinkMatrix(matLnk, txos, pack, expectedMatLnk, expectedTxos);
			});
		});

		describe("onePackFollowedByOtherInputs", () => {
			const txos: Txos = {
				inputs: new CustomMap([
					["PACK_I1", 25029376106],
					["I4", 123],
					["I5", 456],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedTxos: Txos = {
				inputs: new CustomMap([
					["I0", 5300000000],
					["I3", 5000000000],
					["I1", 2020000000],
					["I2", 3376106],
					["I4", 123],
					["I5", 456],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const matLnk: number[][] = [
				[1, 4, 5],
				[11, 44, 55],
			];

			const expectedMatLnk: number[][] = [
				[1, 1, 1, 1, 4, 5],
				[11, 11, 11, 11, 44, 55],
			];

			it("properly unpacks link matrix", () => {
				unpackLinkMatrix(matLnk, txos, pack, expectedMatLnk, expectedTxos);
			});
		});

		describe("onePackPreceededByOtherInputs", () => {
			const txos: Txos = {
				inputs: new CustomMap([
					["I4", 123],
					["I5", 456],
					["PACK_I1", 25029376106],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedTxos: Txos = {
				inputs: new CustomMap([
					["I4", 123],
					["I5", 456],
					["I0", 5300000000],
					["I3", 5000000000],
					["I1", 2020000000],
					["I2", 3376106],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const matLnk: number[][] = [
				[4, 5, 1],
				[44, 55, 11],
			];

			const expectedMatLnk: number[][] = [
				[4, 5, 1, 1, 1, 1],
				[44, 55, 11, 11, 11, 11],
			];

			it("properly unpacks link matrix", () => {
				unpackLinkMatrix(matLnk, txos, pack, expectedMatLnk, expectedTxos);
			});
		});

		describe("onePackSurroundedByOtherInputs", () => {
			const txos: Txos = {
				inputs: new CustomMap([
					["I4", 123],
					["I5", 456],
					["PACK_I1", 25029376106],
					["I6", 666],
					["I7", 777],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const entries: [string, number][] = [];
			entries.push(
				["I0", 5300000000],
				["I3", 5000000000],
				["I1", 2020000000],
				["I2", 3376106],
			);

			const pack: Pack = {
				lbl: "PACK_I1",
				packType: PackType.INPUTS,
				ins: entries,
				outs: [],
			};

			const expectedTxos: Txos = {
				inputs: new CustomMap([
					["I4", 123],
					["I5", 456],
					["I0", 5300000000],
					["I3", 5000000000],
					["I1", 2020000000],
					["I2", 3376106],
					["I6", 666],
					["I7", 777],
				]),
				outputs: new CustomMap([
					["O1", 111111],
					["O2", 222222],
				]),
			};

			const matLnk: number[][] = [
				[4, 5, 1, 6, 7],
				[44, 55, 11, 66, 77],
			];

			const expectedMatLnk: number[][] = [
				[4, 5, 1, 1, 1, 1, 6, 7],
				[44, 55, 11, 11, 11, 11, 66, 77],
			];

			it("properly unpacks link matrix", () => {
				unpackLinkMatrix(matLnk, txos, pack, expectedMatLnk, expectedTxos);
			});
		});
	});
});
