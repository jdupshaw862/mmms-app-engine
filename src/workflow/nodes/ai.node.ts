export class AiNode {
  async run(config: { prompt: string }, payload: any) {
    return {
      aiResponse: `AI processed: ${config.prompt}`,
      payload,
    };
  }
}
