import { Injectable } from '@nestjs/common';

@Injectable()
export class MxService {
  async setup(domain: string) {
    return [
      { type: 'MX', priority: 10, value: `mail.${domain}` },
      { type: 'A', value: '123.45.67.89' },
    ];
  }
}
