import { Injectable } from '@nestjs/common';

@Injectable()
export class ManualsService {
  async generate(orgId: string, payload: any) {
    return {
      id: crypto.randomUUID(),
      orgId,
      type: 'manual',
      category: payload.category,
      content: payload.content,
      createdAt: Date.now(),
    };
  }
}
