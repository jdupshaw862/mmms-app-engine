import { Injectable } from '@nestjs/common';

@Injectable()
export class DmarcService {
  async setup(domain: string) {
    return {
      type: 'TXT',
      value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
    };
  }
}
