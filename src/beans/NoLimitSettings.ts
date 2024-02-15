import { BoltzmannSettings } from "./BoltzmannSettings.js";

export class NoLimitSettings extends BoltzmannSettings {
  constructor() {
    super();
    this.maxDuration = Number.POSITIVE_INFINITY;
    this.maxTxos = Number.POSITIVE_INFINITY;
  }
}
