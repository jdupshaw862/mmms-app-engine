export class DbNode {
  async run(config: { query: string; params?: any[] }) {
    return {
      executed: true,
      query: config.query,
      params: config.params || [],
    };
  }
}
