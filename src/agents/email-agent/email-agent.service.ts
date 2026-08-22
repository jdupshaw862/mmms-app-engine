import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'email',
      orgId,
      email: {
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
      },
    };
  }
}
