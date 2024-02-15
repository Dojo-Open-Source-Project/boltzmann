import { describe, it, assert } from "vitest";

import { TxosLinker } from "../../src/linker/TxosLinker.js";
import { Pack } from "../../src/linker/Pack.js";
import { PackType } from "../../src/linker/PackType.js";
import { Txos } from "../../src/beans/Txos.js";

describe("TxosLinker", () => {
  const txosLinker = new TxosLinker(0, 300, 12);

  describe("testUnpackTxos", () => {
    const processUnpackTxos = (currentTxos: Map<string, number>, pack: Pack, expectedTxos: Map<string, number>, expectedPackIdx: number) => {
      const unpackedTxos = new Map<string, number>();
      // @ts-expect-error Necessary call of protected method
      const packIdx: number = txosLinker.unpackTxos(currentTxos, pack, unpackedTxos);
      assert.deepStrictEqual(unpackedTxos, expectedTxos);
      assert.deepStrictEqual(packIdx, expectedPackIdx);
    };

    describe("onePackAlone", () => {
      const ins = new Map<string, number>();
      ins.set("PACK_I1", 25029376106);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedIns = new Map<string, number>();
      expectedIns.set("I0", 5300000000);
      expectedIns.set("I3", 5000000000);
      expectedIns.set("I1", 2020000000);
      expectedIns.set("I2", 3376106);

      const expectedPackIdx = 0;

      it("properly unpacks utxos", () => {
        processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
      });
    });

    describe("onePackFollowedByOtherInputs", () => {
      const ins = new Map<string, number>();
      ins.set("PACK_I1", 25029376106);
      ins.set("I4", 123);
      ins.set("I5", 456);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedIns = new Map<string, number>();
      expectedIns.set("I0", 5300000000);
      expectedIns.set("I3", 5000000000);
      expectedIns.set("I1", 2020000000);
      expectedIns.set("I2", 3376106);
      expectedIns.set("I4", 123);
      expectedIns.set("I5", 456);

      const expectedPackIdx = 0;

      it("properly unpacks utxos", () => {
        processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
      });
    });

    describe("onePackPreceededByOtherInputs", () => {
      const ins = new Map<string, number>();
      ins.set("I4", 123);
      ins.set("I5", 456);
      ins.set("PACK_I1", 25029376106);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedIns = new Map<string, number>();
      expectedIns.set("I4", 123);
      expectedIns.set("I5", 456);
      expectedIns.set("I0", 5300000000);
      expectedIns.set("I3", 5000000000);
      expectedIns.set("I1", 2020000000);
      expectedIns.set("I2", 3376106);

      const expectedPackIdx = 2;

      it("properly unpacks utxos", () => {
        processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
      });
    });

    describe("onePackSurroundedByOtherInputs", () => {
      const ins = new Map<string, number>();
      ins.set("I4", 123);
      ins.set("I5", 456);
      ins.set("PACK_I1", 25029376106);
      ins.set("I6", 666);
      ins.set("I7", 777);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedIns = new Map<string, number>();
      expectedIns.set("I4", 123);
      expectedIns.set("I0", 5300000000);
      expectedIns.set("I3", 5000000000);
      expectedIns.set("I1", 2020000000);
      expectedIns.set("I2", 3376106);
      expectedIns.set("I5", 456);
      expectedIns.set("I6", 666);
      expectedIns.set("I7", 777);

      const expectedPackIdx = 2;

      it("properly unpacks utxos", () => {
        processUnpackTxos(ins, pack, expectedIns, expectedPackIdx);
      });
    });
  });

  describe("testUnpackLinkMatrix", () => {
    const unpackLinkMatrix = (matLnkInt: number[][], txos: Txos, pack: Pack, expectedMatLnk: number[][], expectedTxos: Txos) => {
      const matLnk: number[][] = [...matLnkInt];
      // @ts-expect-error Necessary call of protected method
      const result = txosLinker.unpackLinkMatrix2(matLnk, txos, pack);

      assert.deepStrictEqual(result.getTxos().getInputs(), expectedTxos.getInputs());
      assert.deepStrictEqual(result.getTxos().getOutputs(), expectedTxos.getOutputs());
      assert.deepStrictEqual(result.getMatLnk(), expectedMatLnk);
    };

    describe("onePackAlone", () => {
      const txos = new Txos();
      txos.getInputs().set("PACK_I1", 25029376106);

      txos.getOutputs().set("O1", 111111);
      txos.getOutputs().set("O2", 222222);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedTxos = new Txos();
      expectedTxos.getInputs().set("I0", 5300000000);
      expectedTxos.getInputs().set("I3", 5000000000);
      expectedTxos.getInputs().set("I1", 2020000000);
      expectedTxos.getInputs().set("I2", 3376106);

      expectedTxos.getOutputs().set("O1", 111111);
      expectedTxos.getOutputs().set("O2", 222222);

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
      const txos = new Txos();
      txos.getInputs().set("PACK_I1", 25029376106);
      txos.getInputs().set("I4", 123);
      txos.getInputs().set("I5", 456);

      txos.getOutputs().set("O1", 111111);
      txos.getOutputs().set("O2", 222222);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedTxos = new Txos();
      expectedTxos.getInputs().set("I0", 5300000000);
      expectedTxos.getInputs().set("I3", 5000000000);
      expectedTxos.getInputs().set("I1", 2020000000);
      expectedTxos.getInputs().set("I2", 3376106);
      expectedTxos.getInputs().set("I4", 123);
      expectedTxos.getInputs().set("I5", 456);

      expectedTxos.getOutputs().set("O1", 111111);
      expectedTxos.getOutputs().set("O2", 222222);

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
      const txos = new Txos();
      txos.getInputs().set("I4", 123);
      txos.getInputs().set("I5", 456);
      txos.getInputs().set("PACK_I1", 25029376106);

      txos.getOutputs().set("O1", 111111);
      txos.getOutputs().set("O2", 222222);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedTxos = new Txos();
      expectedTxos.getInputs().set("I4", 123);
      expectedTxos.getInputs().set("I5", 456);
      expectedTxos.getInputs().set("I0", 5300000000);
      expectedTxos.getInputs().set("I3", 5000000000);
      expectedTxos.getInputs().set("I1", 2020000000);
      expectedTxos.getInputs().set("I2", 3376106);

      expectedTxos.getOutputs().set("O1", 111111);
      expectedTxos.getOutputs().set("O2", 222222);

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
      const txos = new Txos();
      txos.getInputs().set("I4", 123);
      txos.getInputs().set("I5", 456);
      txos.getInputs().set("PACK_I1", 25029376106);
      txos.getInputs().set("I6", 666);
      txos.getInputs().set("I7", 777);

      txos.getOutputs().set("O1", 111111);
      txos.getOutputs().set("O2", 222222);

      const entries: [string, number][] = [];
      entries.push(["I0", 5300000000], ["I3", 5000000000], ["I1", 2020000000], ["I2", 3376106]);

      const pack = new Pack("PACK_I1", PackType.INPUTS, entries, []);

      const expectedTxos = new Txos();
      expectedTxos.getInputs().set("I4", 123);
      expectedTxos.getInputs().set("I5", 456);
      expectedTxos.getInputs().set("I0", 5300000000);
      expectedTxos.getInputs().set("I3", 5000000000);
      expectedTxos.getInputs().set("I1", 2020000000);
      expectedTxos.getInputs().set("I2", 3376106);
      expectedTxos.getInputs().set("I6", 666);
      expectedTxos.getInputs().set("I7", 777);

      expectedTxos.getOutputs().set("O1", 111111);
      expectedTxos.getOutputs().set("O2", 222222);

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
