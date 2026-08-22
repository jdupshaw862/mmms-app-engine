import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  async generateApi(apiConfig: any) {
    return {
      apiId: crypto.randomUUID(),
      routes: apiConfig,
    };
  }
}
