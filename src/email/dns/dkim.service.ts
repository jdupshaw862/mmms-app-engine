import { Injectable } from '@nestjs/common';

@Injectable()
export class DkimService {
  async setup(domain: string) {
    return {
      selector: 'mmms',
      publicKey: 'PUBLIC_KEY_PLACEHOLDER',
    };
  }
}
