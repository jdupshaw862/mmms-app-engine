export class ConditionNode {
  async run(config: { if: string; equals: any }, payload: any) {
    const value = payload[config.if];
    return value === config.equals;
  }
}
