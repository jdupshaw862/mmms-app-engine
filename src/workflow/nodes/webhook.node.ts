import axios from 'axios';

export class WebhookNode {
  async run(config: { url: string; payload: any }) {
    const response = await axios.post(config.url, config.payload);
    return response.data;
  }
}
