import { Injectable } from '@nestjs/common';

@Injectable()
export class SpfService {
  async setup(domain: string) {
    return {
      type: 'TXT',
      value: `v=spf1 include:_spf.mmms.app ~all`,
    };
  }
}
