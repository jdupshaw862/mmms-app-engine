import axios from 'axios';

export class HttpNode {
  async run(config: { url: string; method: string; data?: any }) {
    const response = await axios({
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return response.data;
  }
}
