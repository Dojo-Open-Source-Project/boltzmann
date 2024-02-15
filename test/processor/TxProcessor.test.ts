import { describe, it, assert, expect } from "vitest";

import { TxProcessor } from "../../src/processor/TxProcessor.js";
import { BoltzmannSettings } from "../../src/beans/BoltzmannSettings.js";
import { CoinjoinPattern } from "../../src/processor/CoinjoinPattern.js";
import { IntraFees } from "../../src/linker/IntraFees.js";
import { Txos } from "../../src/beans/Txos.js";
import { TxosLinkerOptionEnum } from "../../src/linker/TxosLinkerOptionEnum.js";

describe("TxProcessor", () => {
  const txProcessor = new TxProcessor(BoltzmannSettings.MAX_DURATION_DEFAULT, BoltzmannSettings.MAX_TXOS_DEFAULT);

  describe("checkCoinjoinPattern", () => {
    const processCheckCoinjoinPattern = (outs: Map<string, number>, maxNbEntities: number, expected: CoinjoinPattern) => {
      // @ts-expect-error Necessary call of protected method
      const result = txProcessor.checkCoinjoinPattern(outs, maxNbEntities);

      assert.exists(result);

      assert.deepStrictEqual(result!.getNbPtcpts(), expected.getNbPtcpts());
      assert.deepStrictEqual(result!.getCjAmount(), expected.getCjAmount());
    };

    const outs = new Map<string, number>();
    outs.set("18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000);
    outs.set("1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000);
    outs.set("1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000);
    outs.set("1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000);

    it("properly checks coinjoin pattern", () => {
      processCheckCoinjoinPattern(outs, 2, new CoinjoinPattern(2, 100000));
    });
  });

  describe("computeCoinjoinIntrafees", () => {
    const expected = new IntraFees(500, 500);
    // @ts-expect-error Necessary call of protected method
    const result = txProcessor.computeCoinjoinIntrafees(2, 100000, 0.005);

    it("properly computes coinjoin intra fees", () => {
      assert.strictEqual(result.getFeesMaker(), expected.getFeesMaker());
      assert.strictEqual(result.getFeesTaker(), expected.getFeesTaker());
    });
  });

  describe("entropy", () => {
    // 8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8
    const ins0 = new Map<string, number>();
    ins0.set("1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000);
    ins0.set("1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000);

    const outs0 = new Map<string, number>();
    outs0.set("18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000);
    outs0.set("1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000);
    outs0.set("1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000);
    outs0.set("1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000);

    const txos0 = new Txos(ins0, outs0);

    const result0 = txProcessor.processTx(txos0, 0.005, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

    it("should calculate proper entropy and density #1", () => {
      expect(result0.getEntropy()).toBeCloseTo(1.5849625007211563, 2);
      expect(result0.getDensity()).toBeCloseTo(0.2641604167, 2);
    });

    // 742d8e113839946dad9e81c4b5211e959710a55aa499486bf13a3f435b45456c
    const ins1 = new Map<string, number>();
    ins1.set("bc1q0wsrm6523zkt0vs9dvae7c64d5yuq86x5ec", 2999808);
    ins1.set("3C6tAAZCTt4bGZ45s4zdhgNpfCFT5Y4b3v", 2999854);

    const outs1 = new Map<string, number>();
    outs1.set("1AiruUx2v1De9p1MJgKiUgm75bzUDhGkJT", 427566);
    outs1.set("1FdoMZmYdJxAeddMPkB57PU39fzFMmqgkg", 427566);
    outs1.set("3JXHgGknQyFnUKSNnicmcEyXaY2pxY4L3h", 2571867);
    outs1.set("bc1qj2pyuyx9rercqxvr0sk3mqwlqdrdw7v8dha", 2572242);

    const txos1 = new Txos(ins1, outs1);
    const result1 = txProcessor.processTx(txos1, 0.005, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

    it("should calculate proper entropy and density #2", () => {
      expect(result1.getEntropy()).toBeCloseTo(2.321928094887362, 2);
      expect(result1.getDensity()).toBeCloseTo(0.386988008158, 2);
    });
  });

  describe("efficiency", () => {
    // 8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8
    const ins0 = new Map<string, number>();
    ins0.set("1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000);
    ins0.set("1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000);

    const outs0 = new Map<string, number>();
    outs0.set("18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000);
    outs0.set("1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000);
    outs0.set("1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000);
    outs0.set("1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000);

    const txos0 = new Txos(ins0, outs0);
    const result0 = txProcessor.processTx(txos0, 0.005, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

    it("should calculate proper efficiency #1", () => {
      expect(result0.getEfficiency()).toBeCloseTo(0.42857142857142855, 2);
    });

    // 742d8e113839946dad9e81c4b5211e959710a55aa499486bf13a3f435b45456c
    const ins1 = new Map<string, number>();
    ins1.set("bc1q0wsrm6523zkt0vs9dvae7c64d5yuq86x5ec", 2999808);
    ins1.set("3C6tAAZCTt4bGZ45s4zdhgNpfCFT5Y4b3v", 2999854);

    const outs1 = new Map<string, number>();
    outs1.set("1AiruUx2v1De9p1MJgKiUgm75bzUDhGkJT", 427566);
    outs1.set("1FdoMZmYdJxAeddMPkB57PU39fzFMmqgkg", 427566);
    outs1.set("3JXHgGknQyFnUKSNnicmcEyXaY2pxY4L3h", 2571867);
    outs1.set("bc1qj2pyuyx9rercqxvr0sk3mqwlqdrdw7v8dha", 2572242);

    const txos1 = new Txos(ins1, outs1);
    const result1 = txProcessor.processTx(txos1, 0.005, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

    it("should calculate proper efficiency #2", () => {
      expect(result1.getEfficiency()).toBeCloseTo(0.7142857142857143, 2);
    });
  });

  describe("ratioDL", () => {
    // 8e56317360a548e8ef28ec475878ef70d1371bee3526c017ac22ad61ae5740b8
    const ins0 = new Map<string, number>();
    ins0.set("1FJNUgMPRyBx6ahPmsH6jiYZHDWBPEHfU7", 10000000);
    ins0.set("1JDHTo412L9RCtuGbYw4MBeL1xn7ZTuzLH", 1380000);

    const outs0 = new Map<string, number>();
    outs0.set("18JNSFk8eRZcM8RdqLDSgCiipgnfAYsFef", 9850000);
    outs0.set("1PA1eHufj8axDWEbYfPtL8HXfA66gTFsFc", 1270000);
    outs0.set("1JR3x2xNfeFicqJcvzz1gkEhHEewJBb5Zb", 100000);
    outs0.set("1ALKUqxRb2MeFqomLCqeYwDZK6FvLNnP3H", 100000);

    const txos0 = new Txos(ins0, outs0);

    const result0 = txProcessor.processTx(txos0, 0.005, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

    it("should calculate proper ratioDL #1", () => {
      expect(result0.getNRatioDL()).toBeCloseTo(0.75, 4);
    });

    // 742d8e113839946dad9e81c4b5211e959710a55aa499486bf13a3f435b45456c
    const ins1 = new Map<string, number>();
    ins1.set("bc1q0wsrm6523zkt0vs9dvae7c64d5yuq86x5ec", 2999808);
    ins1.set("3C6tAAZCTt4bGZ45s4zdhgNpfCFT5Y4b3v", 2999854);

    const outs1 = new Map<string, number>();
    outs1.set("1AiruUx2v1De9p1MJgKiUgm75bzUDhGkJT", 427566);
    outs1.set("1FdoMZmYdJxAeddMPkB57PU39fzFMmqgkg", 427566);
    outs1.set("3JXHgGknQyFnUKSNnicmcEyXaY2pxY4L3h", 2571867);
    outs1.set("bc1qj2pyuyx9rercqxvr0sk3mqwlqdrdw7v8dha", 2572242);

    const txos1 = new Txos(ins1, outs1);
    const result1 = txProcessor.processTx(txos1, 0.005, [TxosLinkerOptionEnum.PRECHECK, TxosLinkerOptionEnum.LINKABILITY]);

    it("should calculate proper ratioDL #2", () => {
      expect(result1.getNRatioDL()).toBeCloseTo(1, 4);
    });
  });
});
