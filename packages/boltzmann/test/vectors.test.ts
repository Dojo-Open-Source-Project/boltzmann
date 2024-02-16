import { assert, describe, it } from "vitest";

import { Boltzmann } from "../src/boltzmann.js";
import { IntraFees } from "../src/linker/intra-fees.js";
import { TxProcessorResult } from "../src/processor/tx-processor-result.js";
import type { Txos } from "../src/utils/interfaces.js";
import { CustomMap } from "../src/utils/utils.js";

const processTest = (
	inputs: CustomMap<string, number>,
	outputs: CustomMap<string, number>,
	maxCjIntrafeesRatio: number,
	expected: TxProcessorResult,
	expectedReadableDtrmLnks: string[][],
) => {
	const boltzmann = new Boltzmann();
	const txos: Txos = { inputs, outputs };
	const result = boltzmann.processWithOptions(
		{ inputs: [...txos.inputs], outputs: [...txos.outputs] },
		maxCjIntrafeesRatio,
		{
			precheck: true,
			linkability: true,
		},
	);

	it("matches nbCmbn", ({ expect }) => {
		expect(result.nbCmbn).toStrictEqual(expected.nbCmbn);
	});

	it("matches matLnkCombinations", ({ expect }) => {
		expect(result.matLnkCombinations).toStrictEqual(
			expected.matLnkCombinations,
		);
	});

	it("matches matLnkProbabilities", ({ expect }) => {
		expect(result.matLnkProbabilities).toStrictEqual(
			expected.matLnkProbabilities,
		);
	});

	it("matches dtrmLnks", ({ expect }) => {
		expect(result.dtrmLnks).toStrictEqual(expectedReadableDtrmLnks);
	});

	it("matches inputs", ({ expect }) => {
		assert.sameDeepMembers([...result.txos.inputs], [...expected.txos.inputs]);
	});

	it("matches outputs", ({ expect }) => {
		assert.sameDeepMembers(
			[...result.txos.outputs],
			[...expected.txos.outputs],
		);
	});

	it("matches fees", ({ expect }) => {
		expect(result.fees).toStrictEqual(expected.fees);
	});

	it("matches maker intrafees", ({ expect }) => {
		expect(result.intraFees.feesMaker).toStrictEqual(
			expected.intraFees.feesMaker,
		);
	});

	it("matches takes intrafees", ({ expect }) => {
		expect(result.intraFees.feesTaker).toStrictEqual(
			expected.intraFees.feesTaker,
		);
	});

	it("matches efficiency", ({ expect }) => {
		expect(result.efficiency).toStrictEqual(expected.efficiency);
	});

	it("matches nbCmbnPrfctCj", ({ expect }) => {
		expect(result.nbCmbnPrfctCj).toStrictEqual(expected.nbCmbnPrfctCj);
	});

	it("matches nbTxosPrfctCj inputs", ({ expect }) => {
		expect(result.nbTxosPrfctCj.nbIns).toStrictEqual(
			expected.nbTxosPrfctCj.nbIns,
		);
	});

	it("matches nbTxosPrfctCj outputs", ({ expect }) => {
		expect(result.nbTxosPrfctCj.nbOuts).toStrictEqual(
			expected.nbTxosPrfctCj.nbOuts,
		);
	});

	it("matches entropy", ({ expect }) => {
		expect(result.entropy).toStrictEqual(expected.entropy);
	});
};

describe("Vectors", () => {
	describe("testProcess_dcba20fdfe34fe240fa6eacccfb2e58468ba2feafcfff99706145800d09a09a6", () => {
		describe("#1", () => {
			const inputs = new CustomMap([
				["1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS", 5300000000],
				["1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG", 2020000000],
				["1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K", 4975000000],
				["16h7kaoG82k8DFhUgodf4BozYSA5zLNRma", 5000000000],
				["16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T", 5556000000],
				["1KVry787zTL42uZinmpyqW9umC4PbKxPCa", 7150000000],
			]);

			const outputs = new CustomMap([
				["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", 1000000],
				["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", 30000000000],
			]);

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
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1KVry787zTL42uZinmpyqW9umC4PbKxPCa",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"16h7kaoG82k8DFhUgodf4BozYSA5zLNRma",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1KVry787zTL42uZinmpyqW9umC4PbKxPCa",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"16h7kaoG82k8DFhUgodf4BozYSA5zLNRma",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				21n,
				{ nbIns: 2, nbOuts: 6 },
			);

			processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
		});

		describe("#2", () => {
			const inputs = new CustomMap([
				["1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS", 5300000000],
				["1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG", 2020000000],
				["1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K", 4975000000],
				["16h7kaoG82k8DFhUgodf4BozYSA5zLNRma", 5000000000],
				["16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T", 5556000000],
				["1KVry787zTL42uZinmpyqW9umC4PbKxPCa", 7150000000],
			]);

			const outputs = new CustomMap([
				["1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8", 1000000],
				["1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa", 30000000000],
			]);

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
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1KVry787zTL42uZinmpyqW9umC4PbKxPCa",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"16h7kaoG82k8DFhUgodf4BozYSA5zLNRma",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K",
				],
				[
					"1BPUHdEzaJLz9VBT2d3hivSYEJALHmzrGa",
					"1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1KVry787zTL42uZinmpyqW9umC4PbKxPCa",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"16boodvrd8PVSGPmtB87PD9XfsJzwaMh3T",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1QAHGtVG5EXbs1n7BuhyNKr7DGMWQWKHgS",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"16h7kaoG82k8DFhUgodf4BozYSA5zLNRma",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1NaNy4UwTGrRcvuufHsVWj1KWGEc3PEk9K",
				],
				[
					"1ABoCkCDm7RVwzuapb1TALDNaEDSvP91D8",
					"1DV9k4MzaHSHkhNMxHCjKQuXUwZXPUxEwG",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				21n,
				{ nbIns: 2, nbOuts: 6 },
			);
			processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
		});
	});

	describe("testProcess_8c5feb901f3983b0f28d996f9606d895d75136dbe8d77ed1d6c7340a403a73bf", () => {
		describe("#1", () => {
			const inputs = new CustomMap([
				["1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR", 4900000000],
				["15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000],
			]);

			const outputs = new CustomMap([
				["1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq", 4900000000],
				["15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000],
			]);

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
				[
					"1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq",
					"1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR",
				],
				[
					"15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX",
					"15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				3n,
				{ nbIns: 2, nbOuts: 2 },
			);

			processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
		});

		describe("#2", () => {
			const inputs = new CustomMap([
				["1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR", 4900000000],
				["15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000],
			]);

			const outputs = new CustomMap([
				["1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq", 4900000000],
				["15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX", 100000000],
			]);

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
				[
					"1NKToQ48X5qaMo1ndexWmHKnn6FNNViivq",
					"1KHWnqHHx3fQuRwPmwhZGbSYzDbN3SdhoR",
				],
				[
					"15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX",
					"15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				3n,
				{ nbIns: 2, nbOuts: 2 },
			);
			processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
		});
	});

	describe("testProcess_coinJoin_8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8", () => {
		describe("#1", () => {
			const inputs = new CustomMap([
				["1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000],
				["1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000],
			]);

			const outputs = new CustomMap([
				["1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000],
				["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000],
				["1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000],
				["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000],
			]);

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
				[
					"18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef",
					"1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7",
				],
				[
					"1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc",
					"1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				7n,
				{ nbIns: 2, nbOuts: 4 },
			);

			processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
		});

		describe("#2", () => {
			const inputs = new CustomMap([
				["1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000],
				["1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000],
			]);

			const outputs = new CustomMap([
				["1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000],
				["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000],
				["1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000],
				["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000],
			]);

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
				[
					"18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef",
					"1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7",
				],
				[
					"1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc",
					"1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				7n,
				{ nbIns: 2, nbOuts: 4 },
			);
			processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
		});
	});

	describe("testProcess_coinJoin_7d588d52d1cece7a18d663c977d6143016b5b326404bbf286bc024d5d54fcecb", () => {
		describe("#1", () => {
			const inputs = new CustomMap([
				["1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG", 260994463],
				["1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF", 98615817],
				["1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A", 84911243],
				["14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw", 20112774],
				["1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP", 79168410],
			]);

			const outputs = new CustomMap([
				["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", 14868890],
				["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", 84077613],
				["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", 84077613],
				["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", 15369204],
				["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", 177252160],
				["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", 84077613],
				["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", 84077613],
			]);

			const fees = 2001;

			const expectedReadableDtrmLnks: string[][] = [
				[
					"1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
				[
					"1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
				[
					"1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
				[
					"1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
				[
					"1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
				[
					"1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
				[
					"13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
				[
					"13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u",
					"1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF",
				],
				[
					"13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u",
					"1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A",
				],
				[
					"13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u",
					"1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP",
				],
				[
					"13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u",
					"14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw",
				],
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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				364576n,
				{ nbIns: 5, nbOuts: 10 },
			);

			processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
		});

		describe("#2", () => {
			const inputs = new CustomMap([
				["1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG", 260994463],
				["1KUMiSa4Asac8arevxQ3Zqy3K4VZGGrgqF", 98615817],
				["1PQWvTNkbcq8g2hLiRHgS4VWVbwnawMt3A", 84911243],
				["14c8VyzSrR6ibPiQBjEFrrPRYNFfm2Sfhw", 20112774],
				["1E1PUeh3EmXY4vNf2HkRyXwQFnXHFWgJPP", 79168410],
			]);

			const outputs = new CustomMap([
				["13vsiRp43UCvpJTNvgh1ma3gGtHiz7ap1u", 14868890],
				["1JLoZi3H5imXGv365kXhR1HMgkCDJVNu38", 84077613],
				["1BPwP8GXe3qVadzn1ATYCDkUEZ6R9mPxjG", 84077613],
				["1K1QZNs9hjVg8HF6AM8UUNADJBLWAR5mhq", 15369204],
				["1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc", 177252160],
				["1B172idTvupbVHvSwE4zqHm7H9mR7Hy6dy", 84077613],
				["1AY56nwgza7MJ4icMURzMPzLrj3ehLAkgK", 84077613],
			]);

			const fees = 2001;

			const efficiency = 0.00026057666988501713;
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
				[
					1, 0.09473684210526316, 0.2631578947368421, 0.11578947368421053,
					0.11578947368421053,
				],
				[
					0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316,
					0.3473684210526316,
				],
				[
					0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316,
					0.3473684210526316,
				],
				[
					0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316,
					0.3473684210526316,
				],
				[
					0.3684210526315789, 0.4, 0.4842105263157895, 0.3473684210526316,
					0.3473684210526316,
				],
				[
					0.09473684210526316, 0.28421052631578947, 0.45263157894736844,
					0.7684210526315789, 0.7684210526315789,
				],
				[
					0.11578947368421053, 0.7684210526315789, 0.22105263157894736,
					0.28421052631578947, 0.28421052631578947,
				],
			];
			const entropy = 6.569855608330948;
			const expectedReadableDtrmLnks = [
				[
					"1Dy3ewdSzquMFBGdT4XtJ4GcQgbssSwcxc",
					"1KMYhyxf3HQ9AS6fEKx4JFeBW9f9fxxwKG",
				],
			];
			const intraFees = new IntraFees(420388, 1261164);
			const expected = new TxProcessorResult(
				nbCmbn,
				matLnkCombinations,
				matLnkProbabilities,
				entropy,
				new Set(),
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				364576n,
				{ nbIns: 5, nbOuts: 10 },
			);
			processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
		});
	});

	describe("testProcess_testCaseA", () => {
		describe("#1", () => {
			const inputs = new CustomMap([
				["a", 10],
				["b", 10],
			]);

			const outputs = new CustomMap([
				["A", 8],
				["B", 2],
				["C", 3],
				["D", 7],
			]);

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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				7n,
				{ nbIns: 2, nbOuts: 4 },
			);
			processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
		});

		describe("#2", () => {
			const inputs = new CustomMap([
				["a", 10],
				["b", 10],
			]);

			const outputs = new CustomMap([
				["A", 8],
				["B", 2],
				["C", 3],
				["D", 7],
			]);

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
				{ inputs, outputs },
				fees,
				intraFees,
				efficiency,
				7n,
				{ nbIns: 2, nbOuts: 4 },
			);
			processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
		});
	});

	describe("testProcess_testCaseB", () => {
		const inputs = new CustomMap([
			["a", 10],
			["b", 10],
		]);

		const outputs = new CustomMap([
			["A", 8],
			["B", 2],
			["C", 2],
			["D", 8],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			7n,
			{ nbIns: 2, nbOuts: 4 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseB2", () => {
		const inputs = new CustomMap([
			["a", 10],
			["b", 10],
		]);

		const outputs = new CustomMap([
			["A", 10],
			["C", 2],
			["D", 8],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			7n,
			{ nbIns: 2, nbOuts: 4 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseC", () => {
		const inputs = new CustomMap([
			["a", 10],
			["b", 10],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 5],
			["D", 5],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			7n,
			{ nbIns: 2, nbOuts: 4 },
		);

		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseC2", () => {
		const inputs = new CustomMap([
			["a", 10],
			["b", 10],
		]);

		const outputs = new CustomMap([
			["A", 10],
			["C", 5],
			["D", 5],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			7n,
			{ nbIns: 2, nbOuts: 4 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseD", () => {
		const inputs = new CustomMap([
			["a", 10],
			["b", 10],
			["c", 2],
		]);

		const outputs = new CustomMap([
			["A", 8],
			["B", 2],
			["C", 2],
			["D", 8],
			["E", 2],
		]);

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
		const efficiency = 0.20588235294117646;
		const intraFees: IntraFees = new IntraFees(0, 0);
		const expected: TxProcessorResult = new TxProcessorResult(
			nbCmbn,
			matLnkCombinations,
			matLnkProbabilities,
			entropy,
			new Set(),
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			136n,
			{ nbIns: 3, nbOuts: 6 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP2", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
		]);

		const nbCmbn: number = 3;

		const matLnkCombinations: number[][] = [
			[2, 2],
			[2, 2],
		];

		const matLnkProbabilities: number[][] = [
			[0.6666666666666666, 0.6666666666666666],
			[0.6666666666666666, 0.6666666666666666],
		];

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			3n,
			{ nbIns: 2, nbOuts: 2 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP3", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 5],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			16n,
			{ nbIns: 3, nbOuts: 3 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP3WithFees", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 3],
			["C", 2],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			16n,
			{ nbIns: 3, nbOuts: 3 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP3b", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 10],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 10],
		]);

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			16n,
			{ nbIns: 3, nbOuts: 3 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP4", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 5],
			["d", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 5],
			["D", 5],
		]);

		const nbCmbn: number = 131;

		const matLnkCombinations: number[][] = [
			[53, 53, 53, 53],
			[53, 53, 53, 53],
			[53, 53, 53, 53],
			[53, 53, 53, 53],
		];

		const matLnkProbabilities: number[][] = [
			[
				0.40458015267175573, 0.40458015267175573, 0.40458015267175573,
				0.40458015267175573,
			],
			[
				0.40458015267175573, 0.40458015267175573, 0.40458015267175573,
				0.40458015267175573,
			],
			[
				0.40458015267175573, 0.40458015267175573, 0.40458015267175573,
				0.40458015267175573,
			],
			[
				0.40458015267175573, 0.40458015267175573, 0.40458015267175573,
				0.40458015267175573,
			],
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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			131n,
			{ nbIns: 4, nbOuts: 4 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP5", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 5],
			["d", 5],
			["e", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 5],
			["D", 5],
			["E", 5],
		]);

		const nbCmbn: number = 1496;

		const matLnkCombinations: number[][] = [
			[512, 512, 512, 512, 512],
			[512, 512, 512, 512, 512],
			[512, 512, 512, 512, 512],
			[512, 512, 512, 512, 512],
			[512, 512, 512, 512, 512],
		];

		const matLnkProbabilities: number[][] = [
			[
				0.3422459893048128, 0.3422459893048128, 0.3422459893048128,
				0.3422459893048128, 0.3422459893048128,
			],
			[
				0.3422459893048128, 0.3422459893048128, 0.3422459893048128,
				0.3422459893048128, 0.3422459893048128,
			],
			[
				0.3422459893048128, 0.3422459893048128, 0.3422459893048128,
				0.3422459893048128, 0.3422459893048128,
			],
			[
				0.3422459893048128, 0.3422459893048128, 0.3422459893048128,
				0.3422459893048128, 0.3422459893048128,
			],
			[
				0.3422459893048128, 0.3422459893048128, 0.3422459893048128,
				0.3422459893048128, 0.3422459893048128,
			],
		];

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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			1496n,
			{ nbIns: 5, nbOuts: 5 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP6", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 5],
			["d", 5],
			["e", 5],
			["f", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 5],
			["D", 5],
			["E", 5],
			["F", 5],
		]);

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
			[
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
			],
			[
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
			],
			[
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
			],
			[
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
			],
			[
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
			],
			[
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
				0.2978827506449604, 0.2978827506449604, 0.2978827506449604,
			],
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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			22482n,
			{ nbIns: 6, nbOuts: 6 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_testCaseP7", () => {
		const inputs = new CustomMap([
			["a", 5],
			["b", 5],
			["c", 5],
			["d", 5],
			["e", 5],
			["f", 5],
			["g", 5],
		]);

		const outputs = new CustomMap([
			["A", 5],
			["B", 5],
			["C", 5],
			["D", 5],
			["E", 5],
			["F", 5],
			["G", 5],
		]);

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
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
			[
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086, 0.26456482980463086, 0.26456482980463086,
				0.26456482980463086,
			],
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
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			426833n,
			{ nbIns: 7, nbOuts: 7 },
		);
		processTest(inputs, outputs, 0, expected, expectedReadableDtrmLnks);
	});

	describe("testProcess_nondeterministic_015d9cf0a12057d009395710611c65109f36b3eaefa3a694594bf243c097f404", () => {
		const inputs = new CustomMap([
			["bc1qywg58qwcr499t6m3n8ne58qw2lf3a9splm7pmd", 203486],
			["bc1qywwz0hhkvhj3x6ef69x0rewz6vjaruxqxva0fz", 5000000],
			["bc1qsve4yxmtjwgv9n263sp8sdwgpmuxj8y28mlyn3", 11126],
			["bc1qk7ts8zsl2585r98xqa3znmu054f073zha0dnha", 9829],
			["bc1quge22k5hpet0cdt09j7ep2hesdx0jml029h0ux", 9572867],
			["bc1qy66zv00ye4j5yh6f4hnx7ccq89d67rrthaze4r", 13796],
			["bc1qg6kzv0egktt8mxlgj909ljl8r2gtmyuayzm2rk", 150000],
			["bc1qxx4c69qwlkep45v76msrz3k9wx4eedkqnzecag", 82835],
			["bc1quftvdtag08zhs7xc0nutg5llklenwnrr55vjqn", 5000000],
		]);

		const outputs = new CustomMap([
			["bc1q0lagp6zrp7v9v3u6avj2nl58q4c4prve0zj6qz", 791116],
			["bc1qmmyl2zezppf5ctpm8mfnh8avnhsz32335tvyga", 907419],
			["bc1qtvtutlhdxqhezl70v5kjr5829ctgl9lkelr3es", 9136520],
			["bc1q6vm607n2u09n9lh0utycllwhvn40s0376e6t4z", 9136520],
		]);

		const nbCmbn: number = 438;

		const matLnkCombinations: number[][] = [
			[245, 245, 245, 245, 245, 131, 114, 113, 113],
			[245, 245, 245, 245, 245, 131, 114, 113, 113],
			[126, 364, 364, 126, 136, 163, 109, 111, 111],
			[364, 126, 126, 364, 354, 99, 119, 115, 115],
		];

		const matLnkProbabilities: number[][] = [
			[
				0.5593607305936074, 0.5593607305936074, 0.5593607305936074,
				0.5593607305936074, 0.5593607305936074, 0.2990867579908676,
				0.2602739726027397, 0.2579908675799087, 0.2579908675799087,
			],
			[
				0.5593607305936074, 0.5593607305936074, 0.5593607305936074,
				0.5593607305936074, 0.5593607305936074, 0.2990867579908676,
				0.2602739726027397, 0.2579908675799087, 0.2579908675799087,
			],
			[
				0.2876712328767123, 0.8310502283105022, 0.8310502283105022,
				0.2876712328767123, 0.3105022831050228, 0.3721461187214612,
				0.24885844748858446, 0.2534246575342466, 0.2534246575342466,
			],
			[
				0.8310502283105022, 0.2876712328767123, 0.2876712328767123,
				0.8310502283105022, 0.8082191780821918, 0.22602739726027396,
				0.271689497716895, 0.2625570776255708, 0.2625570776255708,
			],
		];

		const entropy = 8.774787059601174;
		const expectedReadableDtrmLnks: string[][] = [];
		const fees = 72364;
		const efficiency = 0.0009047100693404498;
		const intraFees = new IntraFees(45683, 45683);
		const expected = new TxProcessorResult(
			nbCmbn,
			matLnkCombinations,
			matLnkProbabilities,
			entropy,
			new Set(),
			{ inputs, outputs },
			fees,
			intraFees,
			efficiency,
			484133n,
			{ nbIns: 4, nbOuts: 12 },
		);
		processTest(inputs, outputs, 0.005, expected, expectedReadableDtrmLnks);
	});
});
