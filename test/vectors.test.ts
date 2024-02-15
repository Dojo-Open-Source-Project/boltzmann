import { describe, it } from "vitest";

import { Boltzmann } from "../src/Boltzmann.js";
import { TxProcessorResult } from "../src/processor/TxProcessorResult.js";
import { Txos } from "../src/beans/Txos.js";
import { TxosLinkerOptionEnum } from "../src/linker/TxosLinkerOptionEnum.js";
import { IntraFees } from "../src/linker/IntraFees.js";
import { NbTxos } from "../src/processor/NbTxos.js";

const processTest = (
  inputs: Map<string, number>,
  outputs: Map<string, number>,
  maxCjIntrafeesRatio: number,
  expected: TxProcessorResult,
  expectedReadableDtrmLnks: string[][],
) => {
  const boltzmann = new Boltzmann();
  const txos = new Txos(inputs, outputs);
  const result = boltzmann.processWithOptions(txos, maxCjIntrafeesRatio, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

  it("matches nbCmbn", ({ expect }) => {
    expect(result.getNbCmbn()).toStrictEqual(expected.getNbCmbn());
  });

  it("matches matLnkCombinations", ({ expect }) => {
    expect(result.getMatLnkCombinations()).toStrictEqual(expected.getMatLnkCombinations());
  });

  it("matches matLnkProbabilities", ({ expect }) => {
    expect(result.getMatLnkProbabilities()).toStrictEqual(expected.getMatLnkProbabilities());
  });

  it("matches dtrmLnks", ({ expect }) => {
    expect(result.getDtrmLnks()).toStrictEqual(expectedReadableDtrmLnks);
  });

  it("matches inputs", ({ expect }) => {
    expect(result.getTxos().getInputs()).toStrictEqual(expected.getTxos().getInputs());
  });

  it("matches outputs", ({ expect }) => {
    expect(result.getTxos().getOutputs()).toStrictEqual(expected.getTxos().getOutputs());
  });

  it("matches fees", ({ expect }) => {
    expect(result.getFees()).toStrictEqual(expected.getFees());
  });

  it("matches maker intrafees", ({ expect }) => {
    expect(result.getIntraFees().getFeesMaker()).toStrictEqual(expected.getIntraFees().getFeesMaker());
  });

  it("matches takes intrafees", ({ expect }) => {
    expect(result.getIntraFees().getFeesTaker()).toStrictEqual(expected.getIntraFees().getFeesTaker());
  });

  it("matches efficiency", ({ expect }) => {
    expect(result.getEfficiency()).toStrictEqual(expected.getEfficiency());
  });

  it("matches nbCmbnPrfctCj", ({ expect }) => {
    expect(result.getNbCmbnPrfctCj()).toStrictEqual(expected.getNbCmbnPrfctCj());
  });

  it("matches nbTxosPrfctCj inputs", ({ expect }) => {
    expect(result.getNbTxosPrfctCj().getNbIns()).toStrictEqual(expected.getNbTxosPrfctCj().getNbIns());
  });

  it("matches nbTxosPrfctCj outputs", ({ expect }) => {
    expect(result.getNbTxosPrfctCj().getNbOuts()).toStrictEqual(expected.getNbTxosPrfctCj().getNbOuts());
  });

  it("matches entropy", ({ expect }) => {
    expect(result.getEntropy()).toStrictEqual(expected.getEntropy());
  });
};

describe("Vectors", () => {
  describe("testProcess_dcba20fdfe34fe240fa6eacccfb2e58468ba2feafcfff99706145800d09a09a6", () => {
    describe("#1", () => {
      const inputs = new Map<string, number>();
      inputs.set("1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS", 5300000000);
      inputs.set("1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG", 2020000000);
      inputs.set("1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K", 4975000000);
      inputs.set("16h7kaoG82k8DFhUgodf4BozYSA5zLNRma", 5000000000);
      inputs.set("16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T", 5556000000);
      inputs.set("1KVry787zTL42uZinmpyqW9umC4PbKxPCa", 7150000000);

      const outputs = new Map<string, number>();
      outputs.set("1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", 1000000);
      outputs.set("1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", 30000000000);

      const nbCmbn = 1;
      const matLnkCombinations: number[][] = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
      ];
      const entropy = 0;
      const expectedReadableDtrmLnks = [
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1KVry787zTL42uZinmpyqW9umC4PbKxPCa"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "16h7kaoG82k8DFhUgodf4BozYSA5zLNRma"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1KVry787zTL42uZinmpyqW9umC4PbKxPCa"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "16h7kaoG82k8DFhUgodf4BozYSA5zLNRma"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG"],
      ];
      const fees = 0;
      const efficiency = 0;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        21n,
        new NbTxos(2, 6),
      );

      processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
    });

    describe("#2", () => {
      const inputs = new Map<string, number>();
      inputs.set("1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS", 5300000000);
      inputs.set("1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG", 2020000000);
      inputs.set("1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K", 4975000000);
      inputs.set("16h7kaoG82k8DFhUgodf4BozYSA5zLNRma", 5000000000);
      inputs.set("16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T", 5556000000);
      inputs.set("1KVry787zTL42uZinmpyqW9umC4PbKxPCa", 7150000000);

      const outputs = new Map<string, number>();
      outputs.set("1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", 1000000);
      outputs.set("1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", 30000000000);

      const nbCmbn = 1;
      const matLnkCombinations: number[][] = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
      ];
      const entropy = 0;
      const expectedReadableDtrmLnks = [
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1KVry787zTL42uZinmpyqW9umC4PbKxPCa"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "16h7kaoG82k8DFhUgodf4BozYSA5zLNRma"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K"],
        ["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", "1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1KVry787zTL42uZinmpyqW9umC4PbKxPCa"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "16h7kaoG82k8DFhUgodf4BozYSA5zLNRma"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K"],
        ["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", "1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG"],
      ];
      const fees = 0;
      const efficiency = 0;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        21n,
        new NbTxos(2, 6),
      );
      processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
    });
  });

  describe("testProcess_8c5feb901f3983b0f28d996f9606d895d75136dbe8d77ed1d6c7340a403a73bf", () => {
    describe("#1", () => {
      const inputs = new Map<string, number>();
      inputs.set("1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR", 4900000000);
      inputs.set("15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000);

      const outputs = new Map<string, number>();
      outputs.set("1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq", 4900000000);
      outputs.set("15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000);

      const nbCmbn = 2;
      const matLnkCombinations: number[][] = [
        [2, 1],
        [1, 2],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 0.5],
        [0.5, 1],
      ];
      const entropy = 1;
      const expectedReadableDtrmLnks = [
        ["1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq", "1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR"],
        ["15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", "15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX"],
      ];
      const fees = 0;
      const efficiency = 0.6666666666666666;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        3n,
        new NbTxos(2, 2),
      );

      processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
    });

    describe("#2", () => {
      const inputs = new Map<string, number>();
      inputs.set("1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR", 4900000000);
      inputs.set("15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000);

      const outputs = new Map<string, number>();
      outputs.set("1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq", 4900000000);
      outputs.set("15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000);

      const nbCmbn = 2;
      const matLnkCombinations: number[][] = [
        [2, 1],
        [1, 2],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 0.5],
        [0.5, 1],
      ];
      const entropy = 1;
      const expectedReadableDtrmLnks = [
        ["1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq", "1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR"],
        ["15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", "15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX"],
      ];
      const fees = 0;
      const efficiency = 0.6666666666666666;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        3n,
        new NbTxos(2, 2),
      );
      processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
    });
  });

  describe("testProcess_coinJoin_8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8", () => {
    describe("#1", () => {
      const inputs = new Map<string, number>();
      inputs.set("1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000);
      inputs.set("1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000);

      const outputs = new Map<string, number>();
      outputs.set("1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000);
      outputs.set("18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000);
      outputs.set("1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000);
      outputs.set("1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000);

      const nbCmbn = 3;
      const matLnkCombinations: number[][] = [
        [3, 1],
        [1, 3],
        [2, 2],
        [2, 2],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 0.3333333333333333],
        [0.3333333333333333, 1],
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
      ];
      const entropy = 1.584962500721156;
      const expectedReadableDtrmLnks = [
        ["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", "1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7"],
        ["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", "1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH"],
      ];
      const fees = 60000;
      const efficiency = 0.42857142857142855;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        7n,
        new NbTxos(2, 4),
      );

      processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
    });

    describe("#2", () => {
      const inputs = new Map<string, number>();
      inputs.set("1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000);
      inputs.set("1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000);

      const outputs = new Map<string, number>();
      outputs.set("1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000);
      outputs.set("18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000);
      outputs.set("1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000);
      outputs.set("1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000);

      const nbCmbn = 3;
      const matLnkCombinations: number[][] = [
        [3, 1],
        [1, 3],
        [2, 2],
        [2, 2],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 0.3333333333333333],
        [0.3333333333333333, 1],
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
      ];
      const entropy = 1.584962500721156;
      const expectedReadableDtrmLnks = [
        ["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", "1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7"],
        ["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", "1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH"],
      ];
      const fees = 60000;
      const efficiency = 0.42857142857142855;

      const intraFees = new IntraFees(500, 500);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        7n,
        new NbTxos(2, 4),
      );
      processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
    });
  });

  describe("testProcess_coinJoin_7d588d52d1cece7a18d663c977d6143016b5b326404bbf286bc024d5d54fcecb", () => {
    describe("#1", () => {
      const inputs = new Map<string, number>();
      inputs.set("1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG", 260994463);
      inputs.set("1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF", 98615817);
      inputs.set("1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A", 84911243);
      inputs.set("14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw", 20112774);
      inputs.set("1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP", 79168410);

      const outputs = new Map<string, number>();
      outputs.set("13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", 14868890);
      outputs.set("1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", 84077613);
      outputs.set("1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", 84077613);
      outputs.set("1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", 15369204);
      outputs.set("1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", 177252160);
      outputs.set("1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", 84077613);
      outputs.set("1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", 84077613);

      const fees = 2001;

      const expectedReadableDtrmLnks: string[][] = [
        ["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
        ["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
        ["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
        ["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
        ["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
        ["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
        ["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"],
        ["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", "1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF"],
        ["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", "1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A"],
        ["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", "1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP"],
        ["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", "14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw"],
      ];

      const nbCmbn = 1;
      const matLnkCombinations: number[][] = [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
      ];
      const entropy = 0;
      const efficiency = 0;
      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        364576n,
        new NbTxos(5, 10),
      );

      processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
    });

    describe("#2", () => {
      const inputs = new Map<string, number>();
      inputs.set("1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG", 260994463);
      inputs.set("1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF", 98615817);
      inputs.set("1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A", 84911243);
      inputs.set("14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw", 20112774);
      inputs.set("1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP", 79168410);

      const outputs = new Map<string, number>();
      outputs.set("13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", 14868890);
      outputs.set("1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", 84077613);
      outputs.set("1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", 84077613);
      outputs.set("1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", 15369204);
      outputs.set("1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", 177252160);
      outputs.set("1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", 84077613);
      outputs.set("1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", 84077613);

      const fees = 2001;

      const efficiency = 0.00026057666988501715;
      const nbCmbn = 95;
      const matLnkCombinations: number[][] = [
        [95, 9, 25, 11, 11],
        [35, 38, 46, 33, 33],
        [35, 38, 46, 33, 33],
        [35, 38, 46, 33, 33],
        [35, 38, 46, 33, 33],
        [9, 27, 43, 73, 73],
        [11, 73, 21, 27, 27],
      ];
      const matLnkProbabilities: number[][] = [
        [1, 0.09473684210526316, 0.2631578947368421, 0.11578947368421053, 0.11578947368421053],
        [0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316, 0.3473684210526316],
        [0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316, 0.3473684210526316],
        [0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316, 0.3473684210526316],
        [0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316, 0.3473684210526316],
        [0.09473684210526316, 0.28421052631578947, 0.45263157894736844, 0.7684210526315789, 0.7684210526315789],
        [0.11578947368421053, 0.7684210526315789, 0.22105263157894736, 0.28421052631578947, 0.28421052631578947],
      ];
      const entropy = 6.569855608330948;
      const expectedReadableDtrmLnks = [["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", "1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG"]];
      const intraFees = new IntraFees(420388, 1261164);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        // FIXME nbCmbnPrfctJc does not match
        364576n,
        new NbTxos(5, 10),
      );
      processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
    });
  });

  describe("testProcess_testCaseA", () => {
    describe("#1", () => {
      const inputs = new Map<string, number>();
      inputs.set("a", 10);
      inputs.set("b", 10);

      const outputs = new Map<string, number>();
      outputs.set("A", 8);
      outputs.set("B", 2);
      outputs.set("C", 3);
      outputs.set("D", 7);

      const nbCmbn = 3;
      const matLnkCombinations: number[][] = [
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
      ];
      const matLnkProbabilities: number[][] = [
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
      ];

      // FIXME entropy does not match
      const entropy = 1.584962500721156;
      const expectedReadableDtrmLnks: string[][] = [];
      const fees = 0;
      const efficiency = 0.42857142857142855;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        7n,
        new NbTxos(2, 4),
      );
      processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
    });

    describe("#2", () => {
      const inputs = new Map<string, number>();
      inputs.set("a", 10);
      inputs.set("b", 10);

      const outputs = new Map<string, number>();
      outputs.set("A", 8);
      outputs.set("B", 2);
      outputs.set("C", 3);
      outputs.set("D", 7);

      const nbCmbn = 3;
      const matLnkCombinations: number[][] = [
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
      ];
      const matLnkProbabilities: number[][] = [
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
        [0.6666666666666666, 0.6666666666666666],
      ];

      // FIXME entropy does not match
      const entropy = 1.584962500721156;
      const expectedReadableDtrmLnks: string[][] = [];
      const fees = 0;
      const efficiency = 0.42857142857142855;

      const intraFees = new IntraFees(0, 0);
      const expected = new TxProcessorResult(
        nbCmbn,
        matLnkCombinations,
        matLnkProbabilities,
        entropy,
        new Set(),
        new Txos(inputs, outputs),
        fees,
        intraFees,
        efficiency,
        7n,
        new NbTxos(2, 4),
      );
      processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
    });
  });

  describe("testProcess_testCaseB", () => {
    const inputs = new Map<string, number>();
    inputs.set("a", 10);
    inputs.set("b", 10);

    const outputs = new Map<string, number>();
    outputs.set("A", 8);
    outputs.set("B", 2);
    outputs.set("C", 2);
    outputs.set("D", 8);

    const nbCmbn = 5;
    const matLnkCombinations: number[][] = [
      [3, 3],
      [3, 3],
      [3, 3],
      [3, 3],
    ];
    const matLnkProbabilities: number[][] = [
      [0.6, 0.6],
      [0.6, 0.6],
      [0.6, 0.6],
      [0.6, 0.6],
    ];
    const entropy = 2.321928094887362;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees = 0;
    const efficiency = 0.7142857142857143;

    const intraFees = new IntraFees(0, 0);
    const expected = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      7n,
      new NbTxos(2, 4),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseB2", () => {
    const inputs = new Map<string, number>();
    inputs.set("a", 10);
    inputs.set("b", 10);

    const outputs = new Map<string, number>();
    outputs.set("A", 10);
    outputs.set("C", 2);
    outputs.set("D", 8);

    const nbCmbn = 3;
    const matLnkCombinations: number[][] = [
      [2, 2],
      [2, 2],
      [2, 2],
    ];
    const matLnkProbabilities: number[][] = [
      [0.6666666666666666, 0.6666666666666666],
      [0.6666666666666666, 0.6666666666666666],
      [0.6666666666666666, 0.6666666666666666],
    ];
    const entropy = 1.584962500721156;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees = 0;
    // FIXME entropy does not match
    const efficiency = 0.42857142857142855;

    const intraFees = new IntraFees(0, 0);
    const expected = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      7n,
      new NbTxos(2, 4),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseC", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 10);
    inputs.set("b", 10);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);

    const nbCmbn: number = 7;

    const matLnkCombinations: number[][] = [
      [4, 4],
      [4, 4],
      [4, 4],
      [4, 4],
    ];

    const matLnkProbabilities: number[][] = [
      [0.5714285714285714, 0.5714285714285714],
      [0.5714285714285714, 0.5714285714285714],
      [0.5714285714285714, 0.5714285714285714],
      [0.5714285714285714, 0.5714285714285714],
    ];

    const entropy = 2.807354922057604;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees: number = 0;
    const efficiency = 1;
    const intraFees: IntraFees = new IntraFees(0, 0);
    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      7n,
      new NbTxos(2, 4),
    );

    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseC2", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 10);
    inputs.set("b", 10);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 10);
    outputs.set("C", 5);
    outputs.set("D", 5);

    const nbCmbn: number = 3;
    const matLnkCombinations: number[][] = [
      [2, 2],
      [2, 2],
      [2, 2],
    ];
    const matLnkProbabilities: number[][] = [
      [0.6666666666666666, 0.6666666666666666],
      [0.6666666666666666, 0.6666666666666666],
      [0.6666666666666666, 0.6666666666666666],
    ];

    // FIXME entropy does not match
    const entropy = 1.584962500721156;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees: number = 0;
    const efficiency = 0.42857142857142855;
    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      7n,
      new NbTxos(2, 4),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseD", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 10);
    inputs.set("b", 10);
    inputs.set("c", 2);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 8);
    outputs.set("B", 2);
    outputs.set("C", 2);
    outputs.set("D", 8);
    outputs.set("E", 2);

    const nbCmbn: number = 28;
    const matLnkCombinations: number[][] = [
      [16, 16, 7],
      [16, 16, 7],
      [13, 13, 14],
      [13, 13, 14],
      [13, 13, 14],
    ];
    const matLnkProbabilities: number[][] = [
      [0.5714285714285714, 0.5714285714285714, 0.25],
      [0.5714285714285714, 0.5714285714285714, 0.25],
      [0.4642857142857143, 0.4642857142857143, 0.5],
      [0.4642857142857143, 0.4642857142857143, 0.5],
      [0.4642857142857143, 0.4642857142857143, 0.5],
    ];

    const entropy = 4.807354922057604;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees: number = 0;
    const efficiency = 0.20588235294117645;
    const intraFees: IntraFees = new IntraFees(0, 0);
    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      136n,
      new NbTxos(3, 6),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP2", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);

    const nbCmbn: number = 3;

    const matLnkCombinations: number[][] = [
      [2, 2],
      [2, 2],
    ];

    const matLnkProbabilities: number[][] = [
      [0.6666666666666666, 0.6666666666666666],
      [0.6666666666666666, 0.6666666666666666],
    ];

    // FIXME entropy does not match
    const entropy = 1.584962500721156;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      3n,
      new NbTxos(2, 2),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP3", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);

    const nbCmbn: number = 16;

    const matLnkCombinations: number[][] = [
      [8, 8, 8],
      [8, 8, 8],
      [8, 8, 8],
    ];

    const matLnkProbabilities: number[][] = [
      [0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5],
    ];

    const entropy = 4;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      16n,
      new NbTxos(3, 3),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP3WithFees", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 3);
    outputs.set("C", 2);

    const nbCmbn: number = 28;

    const matLnkCombinations: number[][] = [
      [14, 14, 14],
      [13, 13, 13],
      [13, 13, 13],
    ];

    const matLnkProbabilities: number[][] = [
      [0.5, 0.5, 0.5],
      [0.4642857142857143, 0.4642857142857143, 0.4642857142857143],
      [0.4642857142857143, 0.4642857142857143, 0.4642857142857143],
    ];

    const entropy = 4.807354922057604;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 5;

    const efficiency = 1.75;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      16n,
      new NbTxos(3, 3),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP3b", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 10);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 10);

    const nbCmbn: number = 9;

    const matLnkCombinations: number[][] = [
      [8, 4, 4],
      [4, 5, 5],
      [4, 5, 5],
    ];

    const matLnkProbabilities: number[][] = [
      [0.8888888888888888, 0.4444444444444444, 0.4444444444444444],
      [0.4444444444444444, 0.5555555555555556, 0.5555555555555556],
      [0.4444444444444444, 0.5555555555555556, 0.5555555555555556],
    ];

    const entropy = 3.169925001442312;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency = 0.5625;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      16n,
      new NbTxos(3, 3),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP4", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);

    const nbCmbn: number = 131;

    const matLnkCombinations: number[][] = [
      [53, 53, 53, 53],
      [53, 53, 53, 53],
      [53, 53, 53, 53],
      [53, 53, 53, 53],
    ];

    const matLnkProbabilities: number[][] = [
      [0.40458015267175573, 0.40458015267175573, 0.40458015267175573, 0.40458015267175573],
      [0.40458015267175573, 0.40458015267175573, 0.40458015267175573, 0.40458015267175573],
      [0.40458015267175573, 0.40458015267175573, 0.40458015267175573, 0.40458015267175573],
      [0.40458015267175573, 0.40458015267175573, 0.40458015267175573, 0.40458015267175573],
    ];

    const entropy = 7.03342300153745;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency: number = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      131n,
      new NbTxos(4, 4),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP5", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);
    inputs.set("e", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);
    outputs.set("E", 5);

    const nbCmbn: number = 1496;

    const matLnkCombinations: number[][] = [
      [512, 512, 512, 512, 512],
      [512, 512, 512, 512, 512],
      [512, 512, 512, 512, 512],
      [512, 512, 512, 512, 512],
      [512, 512, 512, 512, 512],
    ];

    const matLnkProbabilities: number[][] = [
      [0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128],
      [0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128],
      [0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128],
      [0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128],
      [0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128, 0.3422459893048128],
    ];

    // FIXME entropy does not match
    const entropy: number = 10.546894459887637;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency: number = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      1496n,
      new NbTxos(5, 5),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP6", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);
    inputs.set("e", 5);
    inputs.set("f", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);
    outputs.set("E", 5);
    outputs.set("F", 5);

    const nbCmbn: number = 22482;

    const matLnkCombinations: number[][] = [
      [6697, 6697, 6697, 6697, 6697, 6697],
      [6697, 6697, 6697, 6697, 6697, 6697],
      [6697, 6697, 6697, 6697, 6697, 6697],
      [6697, 6697, 6697, 6697, 6697, 6697],
      [6697, 6697, 6697, 6697, 6697, 6697],
      [6697, 6697, 6697, 6697, 6697, 6697],
    ];

    const matLnkProbabilities: number[][] = [
      [0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604],
      [0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604],
      [0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604],
      [0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604],
      [0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604],
      [0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604, 0.2978827506449604],
    ];

    const entropy: number = 14.45648276305027;

    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency: number = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      22482n,
      new NbTxos(6, 6),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP7", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);
    inputs.set("e", 5);
    inputs.set("f", 5);
    inputs.set("g", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);
    outputs.set("E", 5);
    outputs.set("F", 5);
    outputs.set("G", 5);

    const nbCmbn: number = 426833;

    const matLnkCombinations: number[][] = [
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
      [112925, 112925, 112925, 112925, 112925, 112925, 112925],
    ];

    const matLnkProbabilities: number[][] = [
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
      [0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086, 0.26456482980463086],
    ];
    const entropy = 18.703312194872563;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees = 0;
    const efficiency = 1;

    const intraFees = new IntraFees(0, 0);
    const expected = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      426833n,
      new NbTxos(7, 7),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP8", () => {
    const inputs = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);
    inputs.set("e", 5);
    inputs.set("f", 5);
    inputs.set("g", 5);
    inputs.set("h", 5);

    const outputs = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);
    outputs.set("E", 5);
    outputs.set("F", 5);
    outputs.set("G", 5);
    outputs.set("H", 5);

    const nbCmbn = 9934563;
    const matLnkCombinations: number[][] = [
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
      [2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635, 2369635],
    ];
    const matLnkProbabilities: number[][] = [
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
      [
        0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339, 0.23852433166914339,
        0.23852433166914339,
      ],
    ];

    // FIXME entropy does not match
    const entropy = 23.244025077151523;
    const expectedReadableDtrmLnks: string[][] = [];
    const fees = 0;
    const efficiency = 1;

    const intraFees = new IntraFees(0, 0);
    const expected = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      0n,
      new NbTxos(0, 0),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP9", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);
    inputs.set("e", 5);
    inputs.set("f", 5);
    inputs.set("g", 5);
    inputs.set("h", 5);
    inputs.set("i", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);
    outputs.set("E", 5);
    outputs.set("F", 5);
    outputs.set("G", 5);
    outputs.set("H", 5);
    outputs.set("I", 5);

    const nbCmbn: number = 277006192;
    const matLnkCombinations = null;
    const matLnkProbabilities = null;
    const entropy: number = 1.5849625007211563;
    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency: number = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      0n,
      new NbTxos(0, 0),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });

  describe("testProcess_testCaseP10", () => {
    const inputs: Map<string, number> = new Map<string, number>();
    inputs.set("a", 5);
    inputs.set("b", 5);
    inputs.set("c", 5);
    inputs.set("d", 5);
    inputs.set("e", 5);
    inputs.set("f", 5);
    inputs.set("g", 5);
    inputs.set("h", 5);
    inputs.set("i", 5);
    inputs.set("j", 5);

    const outputs: Map<string, number> = new Map<string, number>();
    outputs.set("A", 5);
    outputs.set("B", 5);
    outputs.set("C", 5);
    outputs.set("D", 5);
    outputs.set("E", 5);
    outputs.set("F", 5);
    outputs.set("G", 5);
    outputs.set("H", 5);
    outputs.set("I", 5);
    outputs.set("J", 5);

    const nbCmbn: number = 22482;
    const matLnkCombinations = null;
    const matLnkProbabilities = null;
    const entropy: number = 1.5849625007211563;
    const expectedReadableDtrmLnks: string[][] = [];

    const fees: number = 0;

    const efficiency: number = 1;

    const intraFees: IntraFees = new IntraFees(0, 0);

    const expected: TxProcessorResult = new TxProcessorResult(
      nbCmbn,
      matLnkCombinations,
      matLnkProbabilities,
      entropy,
      new Set(),
      new Txos(inputs, outputs),
      fees,
      intraFees,
      efficiency,
      0n,
      new NbTxos(0, 0),
    );
    processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
  });
});
