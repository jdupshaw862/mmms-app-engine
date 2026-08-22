import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ConnectorsService } from './connectors.service';

type ConnectorPayload = Record<string, unknown>;

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectors: ConnectorsService) {}

  @Post('email/send')
  sendEmail(@Body() body: ConnectorPayload) {
    return this.connectors.sendEmail(body);
  }

  @Post('files/upload')
  uploadFile(@Body() body: ConnectorPayload) {
    return this.connectors.uploadFile(body);
  }

  @Post('llm/invoke')
  invokeLlm(@Body() body: ConnectorPayload) {
    return this.connectors.invokeLlm(body);
  }

  @Post('images/generate')
  generateImage(@Body() body: ConnectorPayload) {
    return this.connectors.generateImage(body);
  }

  @Post('videos/generate')
  generateVideo(@Body() body: ConnectorPayload) {
    return this.connectors.generateVideo(body);
  }

  @Get('videos/:jobId')
  getVideo(@Param('jobId') jobId: string) {
    return this.connectors.getVideo(jobId);
  }

  @Post('speech/generate')
  generateSpeech(@Body() body: ConnectorPayload) {
    return this.connectors.generateSpeech(body);
  }

  @Post('files/extract')
  extractFileData(@Body() body: ConnectorPayload) {
    return this.connectors.extractFileData(body);
  }

  @Post('whatsapp/send')
  sendWhatsAppMessage(@Body() body: ConnectorPayload) {
    return this.connectors.sendWhatsAppMessage(body);
  }

  @Get('whatsapp/webhook')
  @Header('Content-Type', 'text/plain')
  verifyWhatsAppWebhook(
    @Query('hub.mode') mode?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') challenge?: string,
  ) {
    return this.connectors.verifyWhatsAppWebhook(mode, token, challenge);
  }

  @Post('whatsapp/webhook')
  handleWhatsAppWebhook(@Body() body: ConnectorPayload) {
    return this.connectors.handleWhatsAppWebhook(body);
  }

  @Post('telegram/send')
  sendTelegramMessage(@Body() body: ConnectorPayload) {
    return this.connectors.sendTelegramMessage(body);
  }

  @Post('telegram/webhook')
  handleTelegramWebhook(@Body() body: ConnectorPayload) {
    return this.connectors.handleTelegramWebhook(body);
  }
}
