import { BoltzmannSettings } from "./beans/BoltzmannSettings.js";
import { TxProcessor } from "./processor/TxProcessor.js";
import { Txos } from "./beans/Txos.js";
import { BoltzmannResult } from "./beans/BoltzmannResult.js";
import { OxtFetch } from "./fetch/OxtFetch.js";
import { TxosLinkerOptionEnum } from "./linker/TxosLinkerOptionEnum.js";

export class Boltzmann {
  private settings: BoltzmannSettings;
  private txProcessor: TxProcessor;

  constructor(settings: BoltzmannSettings = new BoltzmannSettings()) {
    this.settings = settings;
    this.txProcessor = new TxProcessor(settings.getMaxDuration(), settings.getMaxTxos());
  }

  public process(txos: Txos): BoltzmannResult {
    return this.processWithOptions(txos, this.settings.getMaxCjIntrafeesRatio(), this.settings.getOptions());
  }

  public async processFromTxid(txid: string): Promise<BoltzmannResult> {
    const txos = await new OxtFetch().fetch(txid);
    return this.processWithOptions(txos, this.settings.getMaxCjIntrafeesRatio(), this.settings.getOptions());
  }

  public processWithOptions(txos: Txos, maxCjIntrafeesRatio: number, linkerOptions: TxosLinkerOptionEnum[]): BoltzmannResult {
    const t1 = Date.now();

    const sumInputs = [...txos.getInputs().values()].reduce((sum, input) => sum + input, 0);
    const sumOutputs = [...txos.getOutputs().values()].reduce((sum, output) => sum + output, 0);
    const fees = sumInputs - sumOutputs;
    console.log(`fees = ${fees}`);

    const txProcessorResult = this.txProcessor.processTx(txos, maxCjIntrafeesRatio, linkerOptions);

    const duration = (Date.now() - t1) / 1000;
    const result = new BoltzmannResult(duration, txProcessorResult);
    result.print();
    return result;
  }
}
