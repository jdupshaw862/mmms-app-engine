import { Injectable } from '@nestjs/common';

@Injectable()
export class InboxService {
  async createInbox(orgId: string, domain: string, inbox: string) {
    return {
      inboxId: crypto.randomUUID(),
      address: `${inbox}@${domain}`,
      orgId,
    };
  }
}
