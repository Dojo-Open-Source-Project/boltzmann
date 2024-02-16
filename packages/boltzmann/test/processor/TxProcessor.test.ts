import { assert, describe, expect, it } from "vitest";

import {
	LogLevel,
	MAX_DURATION_DEFAULT,
	MAX_TXOS_DEFAULT,
} from "../../src/beans/boltzmann-settings.js";
import { IntraFees } from "../../src/linker/intra-fees.js";
import { TxProcessor } from "../../src/processor/tx-processor.js";
import type { CoinjoinPattern, Txos } from "../../src/utils/interfaces.js";
import { CustomMap, Logger } from "../../src/utils/utils.js";

const logger = Logger(LogLevel.NONE);

describe("TxProcessor", () => {
	const txProcessor = new TxProcessor(
		MAX_DURATION_DEFAULT,
		MAX_TXOS_DEFAULT,
		logger,
	);

	describe("checkCoinjoinPattern", () => {
		const processCheckCoinjoinPattern = (
			outs: Map<string, number>,
			maxNbEntities: number,
			expected: CoinjoinPattern,
		) => {
			// @ts-expect-error Necessary call of protected method
			const result = txProcessor.checkCoinjoinPattern(outs, maxNbEntities);

			assert.exists(result);

			assert.deepStrictEqual(result!.nbPtcpts, expected.nbPtcpts);
			assert.deepStrictEqual(result!.cjAmount, expected.cjAmount);
		};

		const outs = new Map<string, number>([
			["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000],
			["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000],
			["1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000],
			["1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000],
		]);

		it("properly checks coinjoin pattern", () => {
			processCheckCoinjoinPattern(outs, 2, { nbPtcpts: 2, cjAmount: 100000 });
		});
	});

	describe("computeCoinjoinIntrafees", () => {
		const expected = new IntraFees(500, 500);
		// @ts-expect-error Necessary call of protected method
		const result = txProcessor.computeCoinjoinIntrafees(2, 100000, 0.005);

		it("properly computes coinjoin intra fees", () => {
			assert.strictEqual(result.feesMaker, expected.feesMaker);
			assert.strictEqual(result.feesTaker, expected.feesTaker);
		});
	});

	describe("entropy", () => {
		// 8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8
		const ins0 = new CustomMap([
			["1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000],
			["1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000],
		]);

		const outs0 = new CustomMap([
			["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000],
			["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000],
			["1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000],
			["1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000],
		]);

		const txos0: Txos = { inputs: ins0, outputs: outs0 };

		const result0 = txProcessor.processTx(txos0, 0.005, {
			precheck: true,
			linkability: true,
		});

		it("should calculate proper entropy and density #1", () => {
			expect(result0.entropy).toBeCloseTo(1.5849625007211563, 2);
			expect(result0.density).toBeCloseTo(0.2641604167, 2);
		});

		// 742d8e113839946dad9e81c4b5211e959710a55aa499486bf13a3f435b45456c
		const ins1 = new CustomMap([
			["bc1q0wsrm6523zkt0vs9dvae7c64d5yuq86x5ec", 2999808],
			["3C6tAAZCTt4bGZ45s4zdhgNpfCFT5Y4b3v", 2999854],
		]);

		const outs1 = new CustomMap([
			["1AiruUx2v1De9p1MJgKiUgm75bzUDhGkJT", 427566],
			["1FdoMZmYdJxAeddMPkB57PU39fzFMmqgkg", 427566],
			["3JXHgGknQyFnUKSNnicmcEyXaY2pxY4L3h", 2571867],
			["bc1qj2pyuyx9rercqxvr0sk3mqwlqdrdw7v8dha", 2572242],
		]);

		const txos1: Txos = { inputs: ins1, outputs: outs1 };
		const result1 = txProcessor.processTx(txos1, 0.005, {
			precheck: true,
			linkability: true,
		});

		it("should calculate proper entropy and density #2", () => {
			expect(result1.entropy).toBeCloseTo(2.321928094887362, 2);
			expect(result1.density).toBeCloseTo(0.386988008158, 2);
		});
	});

	describe("efficiency", () => {
		// 8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8
		const ins0 = new CustomMap([
			["1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000],
			["1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000],
		]);

		const outs0 = new CustomMap([
			["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000],
			["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000],
			["1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000],
			["1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000],
		]);

		const txos0: Txos = { inputs: ins0, outputs: outs0 };
		const result0 = txProcessor.processTx(txos0, 0.005, {
			precheck: true,
			linkability: true,
		});

		it("should calculate proper efficiency #1", () => {
			expect(result0.efficiency).toBeCloseTo(0.42857142857142855, 2);
		});

		// 742d8e113839946dad9e81c4b5211e959710a55aa499486bf13a3f435b45456c
		const ins1 = new CustomMap([
			["bc1q0wsrm6523zkt0vs9dvae7c64d5yuq86x5ec", 2999808],
			["3C6tAAZCTt4bGZ45s4zdhgNpfCFT5Y4b3v", 2999854],
		]);

		const outs1 = new CustomMap([
			["1AiruUx2v1De9p1MJgKiUgm75bzUDhGkJT", 427566],
			["1FdoMZmYdJxAeddMPkB57PU39fzFMmqgkg", 427566],
			["3JXHgGknQyFnUKSNnicmcEyXaY2pxY4L3h", 2571867],
			["bc1qj2pyuyx9rercqxvr0sk3mqwlqdrdw7v8dha", 2572242],
		]);

		const txos1: Txos = { inputs: ins1, outputs: outs1 };
		const result1 = txProcessor.processTx(txos1, 0.005, {
			precheck: true,
			linkability: true,
		});

		it("should calculate proper efficiency #2", () => {
			expect(result1.efficiency).toBeCloseTo(0.7142857142857143, 2);
		});
	});

	describe("ratioDL", () => {
		// 8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8
		const ins0 = new CustomMap([
			["1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000],
			["1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000],
		]);

		const outs0 = new CustomMap([
			["18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000],
			["1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000],
			["1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000],
			["1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000],
		]);

		const txos0: Txos = { inputs: ins0, outputs: outs0 };

		const result0 = txProcessor.processTx(txos0, 0.005, {
			precheck: true,
			linkability: true,
		});

		it("should calculate proper ratioDL #1", () => {
			expect(result0.nRatioDL).toBeCloseTo(0.75, 4);
		});

		// 742d8e113839946dad9e81c4b5211e959710a55aa499486bf13a3f435b45456c
		const ins1 = new CustomMap([
			["bc1q0wsrm6523zkt0vs9dvae7c64d5yuq86x5ec", 2999808],
			["3C6tAAZCTt4bGZ45s4zdhgNpfCFT5Y4b3v", 2999854],
		]);

		const outs1 = new CustomMap([
			["1AiruUx2v1De9p1MJgKiUgm75bzUDhGkJT", 427566],
			["1FdoMZmYdJxAeddMPkB57PU39fzFMmqgkg", 427566],
			["3JXHgGknQyFnUKSNnicmcEyXaY2pxY4L3h", 2571867],
			["bc1qj2pyuyx9rercqxvr0sk3mqwlqdrdw7v8dha", 2572242],
		]);

		const txos1: Txos = { inputs: ins1, outputs: outs1 };
		const result1 = txProcessor.processTx(txos1, 0.005, {
			precheck: true,
			linkability: true,
		});

		it("should calculate proper ratioDL #2", () => {
			expect(result1.nRatioDL).toBeCloseTo(1, 4);
		});
	});
});
