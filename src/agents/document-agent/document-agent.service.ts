import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'document',
      orgId,
      document: {
        title: payload.title || 'Untitled Document',
        content: payload.content || '',
      },
    };
  }
}
