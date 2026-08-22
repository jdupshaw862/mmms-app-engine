import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';

type ConnectorPayload = Record<string, unknown>;

export interface ConnectorResult {
  [key: string]: unknown;
}

@Injectable()
export class ConnectorsService {
  async sendEmail(payload: ConnectorPayload) {
    return this.invoke('email/send', payload);
  }

  async uploadFile(payload: ConnectorPayload) {
    return this.invoke('files/upload', payload);
  }

  async invokeLlm(payload: ConnectorPayload) {
    return this.invoke('llm/invoke', payload);
  }

  async generateImage(payload: ConnectorPayload) {
    return this.invoke('images/generate', payload);
  }

  async generateVideo(payload: ConnectorPayload) {
    return this.invoke('videos/generate', payload);
  }

  async getVideo(jobId: string) {
    return this.request('GET', `videos/status/${encodeURIComponent(jobId)}`);
  }

  async generateSpeech(payload: ConnectorPayload) {
    return this.invoke('speech/generate', payload);
  }

  async extractFileData(payload: ConnectorPayload) {
    return this.invoke('files/extract', payload);
  }

  async sendWhatsAppMessage(payload: ConnectorPayload) {
    return this.invoke('whatsapp/send', payload);
  }

  async sendTelegramMessage(payload: ConnectorPayload) {
    return this.invoke('telegram/send', payload);
  }

  async handleWhatsAppWebhook(payload: ConnectorPayload) {
    return this.invoke('whatsapp/webhook', payload);
  }

  async handleTelegramWebhook(payload: ConnectorPayload) {
    return this.invoke('telegram/webhook', payload);
  }

  verifyWhatsAppWebhook(mode?: string, token?: string, challenge?: string) {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!expectedToken) {
      throw new ServiceUnavailableException(
        'WHATSAPP_VERIFY_TOKEN is not configured',
      );
    }

    if (mode !== 'subscribe' || token !== expectedToken || !challenge) {
      throw new UnauthorizedException('Invalid WhatsApp verification request');
    }

    return challenge;
  }

  private async invoke(
    path: string,
    payload: ConnectorPayload,
  ): Promise<ConnectorResult> {
    return this.request('POST', path, payload);
  }

  private async request(
    method: 'GET' | 'POST',
    path: string,
    payload?: ConnectorPayload,
  ): Promise<ConnectorResult> {
    const baseUrl = process.env.CONNECTOR_GATEWAY_URL?.replace(/\/$/, '');
    const apiKey = process.env.CONNECTOR_GATEWAY_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new ServiceUnavailableException(
        'Connector gateway is not configured',
      );
    }

    try {
      const response = await axios.request<ConnectorResult>({
        method,
        url:
        `${baseUrl}/${path}`,
        data: payload,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        throw new BadGatewayException(
          status
            ? `Connector gateway request failed with status ${status}`
            : 'Connector gateway request failed',
        );
      }
      throw error;
    }
  }
}
