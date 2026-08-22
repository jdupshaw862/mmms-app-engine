import { Injectable } from '@nestjs/common';

@Injectable()
export class SopService {
  async generate(orgId: string, payload: any) {
    return {
      id: crypto.randomUUID(),
      orgId,
      type: 'sop',
      title: payload.title,
      steps: payload.steps,
      createdAt: Date.now(),
    };
  }
}
