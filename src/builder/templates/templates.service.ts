import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplatesService {
  async applyTemplates(config: any) {
    return {
      templateId: crypto.randomUUID(),
      applied: true,
      config,
    };
  }
}
