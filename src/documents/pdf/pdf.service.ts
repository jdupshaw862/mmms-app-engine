import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  async generate(orgId: string, payload: any) {
    return {
      id: crypto.randomUUID(),
      orgId,
      type: 'pdf',
      html: payload.html,
      createdAt: Date.now(),
    };
  }
}
