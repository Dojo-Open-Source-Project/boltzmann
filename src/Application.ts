import { parseArgs } from "node:util";

import { NoLimitSettings } from "./beans/NoLimitSettings.js";
import { BoltzmannSettings } from "./beans/BoltzmannSettings.js";
import { Boltzmann } from "./Boltzmann.js";

class Application {
  public static main(args: string[]): void {
    // TODO dynamic toggle for debug
    //LogbackUtils.setLogLevel("com.samourai.boltzmann", Level.DEBUG.toString());

    // parse args
    if (args.length === 0) {
      console.error("Usage: <txid> [maxCjIntrafeesRatio]");
      return;
    }
    const txid: string = args[0];
    let maxCjIntrafeesRatio: number = 0.005;
    if (args.length > 1) {
      maxCjIntrafeesRatio = Number.parseFloat(args[1]);
    }
    console.log(`Running Boltzmann: txid=${txid}, maxCjIntrafeesRatio=${maxCjIntrafeesRatio}`);

    // run
    const settings: BoltzmannSettings = new NoLimitSettings();
    settings.setMaxCjIntrafeesRatio(maxCjIntrafeesRatio);
    new Boltzmann(settings).processFromTxid(txid);
  }
}

const { positionals } = parseArgs({ allowPositionals: true });

Application.main(positionals);
