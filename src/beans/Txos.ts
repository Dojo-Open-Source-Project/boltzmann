export class Txos {
  private readonly inputs: Map<string, number>;
  private readonly outputs: Map<string, number>;

  constructor(inputs?: Map<string, number>, outputs?: Map<string, number>) {
    this.inputs = inputs || new Map<string, number>();
    this.outputs = outputs || new Map<string, number>();
  }

  public getInputs(): Map<string, number> {
    return this.inputs;
  }

  public getOutputs(): Map<string, number> {
    return this.outputs;
  }
}
