import { Injectable } from '@nestjs/common';

@Injectable()
export class SmtpService {
  async createCredentials(domain: string) {
    return {
      username: `smtp-${crypto.randomUUID()}`,
      password: crypto.randomUUID(),
      host: `smtp.${domain}`,
      port: 587,
    };
  }
}
