import { Injectable } from '@nestjs/common';

@Injectable()
export class SslService {
  async provisionSsl(domain: string) {
    return {
      domain,
      ssl: true,
      certificateId: crypto.randomUUID(),
    };
  }
}
