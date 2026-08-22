export class EmailNode {
  async run(config: { to: string; subject: string; body: string }) {
    return {
      sent: true,
      to: config.to,
      subject: config.subject,
      body: config.body,
    };
  }
}
