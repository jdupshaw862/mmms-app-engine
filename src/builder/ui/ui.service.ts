import { Injectable } from '@nestjs/common';

@Injectable()
export class UiService {
  async generateUi(uiConfig: any) {
    return {
      uiBundle: `ui-${crypto.randomUUID()}`,
      config: uiConfig,
    };
  }
}
