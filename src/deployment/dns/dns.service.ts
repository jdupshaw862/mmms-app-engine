import { Injectable } from '@nestjs/common';

@Injectable()
export class DnsService {
  async configureDomain(domain: string) {
    return {
      domain,
      records: [
        { type: 'A', value: '123.45.67.89' },
        { type: 'CNAME', value: 'apps.mmms.app' },
      ],
    };
  }
}
