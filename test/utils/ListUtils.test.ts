import { describe, it, assert } from "vitest";

import { ListsUtils } from "../../src/utils/ListsUtils.js";

describe("ListUtils", () => {
  describe("powerSet", () => {
    it("should properly calculate power set", () => {
      const values = [1, 2, 3];
      const expected = [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]];

      assert.deepStrictEqual(ListsUtils.powerSet(values), expected);
    });

    it("should properly calculate power set of site 10", () => {
      const LEN = 10;
      const values: number[] = Array.from({ length: LEN });

      for (let i = 0; i < LEN; i++) {
        values[i] = i;
      }

      const expectedSize = Math.pow(2, LEN);
      const actual = ListsUtils.powerSet(values);

      assert.strictEqual(actual.length, expectedSize);
    });
    it("should properly calculate power set of site 20", () => {
      const LEN = 20;
      const values: number[] = Array.from({ length: LEN });

      for (let i = 0; i < LEN; i++) {
        values[i] = i;
      }

      const expectedSize = Math.pow(2, LEN);
      const actual = ListsUtils.powerSet(values);

      assert.strictEqual(actual.length, expectedSize);
    });
  });

  describe("mergeSets", () => {
    let toMerge: Set<string>[];
    let expected: Set<string>[];

    it("should merge sets properly #1", () => {
      toMerge = [new Set(["A", "B", "C"]), new Set(["D", "E"]), new Set(["F", "G"])];
      expected = [new Set(["A", "B", "C"]), new Set(["D", "E"]), new Set(["F", "G"])];

      assert.deepStrictEqual(ListsUtils.mergeSets(toMerge), expected);
    });

    it("should merge sets properly #2", () => {
      toMerge = [new Set(["A", "B", "C"]), new Set(["C", "D", "E"]), new Set(["F", "G"])];
      expected = [new Set(["A", "B", "C", "D", "E"]), new Set(["F", "G"])];

      assert.deepStrictEqual(ListsUtils.mergeSets(toMerge), expected);
    });

    it("should merge sets properly #3", () => {
      toMerge = [new Set(["A", "B", "C"]), new Set(["C"]), new Set(["D", "E"])];
      expected = [new Set(["A", "B", "C"]), new Set(["D", "E"])];

      assert.deepStrictEqual(ListsUtils.mergeSets(toMerge), expected);
    });
  });
});
