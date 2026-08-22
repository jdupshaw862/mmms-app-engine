export class DelayNode {
  async run(config: { ms: number }) {
    await new Promise((resolve) => setTimeout(resolve, config.ms));
    return { delayed: config.ms };
  }
}
