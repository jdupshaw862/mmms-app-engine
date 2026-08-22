import { Injectable } from '@nestjs/common';

@Injectable()
export class PhoneAgentService {
  async run(orgId: string, payload: any) {
    return {
      agent: 'phone',
      orgId,
      call: {
        to: payload.to,
        action: payload.action || 'route',
      },
    };
  }
}
